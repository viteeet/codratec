'use server';

import { revalidatePath } from 'next/cache';
import { getCompanySettings } from '@/actions/settings';
import { assertIsAdmin, chunkIds, getDbClient, loadAuthProfile } from '@/lib/server/actions-helpers';
import { refreshLeadEmailSummary, syncBrevoEmailEventsWith } from '@/lib/server/brevo-sync';

function allowedBrevoEmails() {
  const raw =
    process.env.BREVO_ALLOWED_USER_EMAIL ||
    'victor.hg.pereira@gmail.com,victor.h.pereira@hotmail.com';
  return raw
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function textToHtmlEmail(text: string) {
  return `<html><body>${String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>')}</body></html>`;
}

async function recordLeadEmailSend(params: {
  leadId: string;
  toEmail: string;
  subject: string;
  messageId?: string | null;
}) {
  const profile = await loadAuthProfile();
  const supabase = getDbClient();
  const row = {
    lead_id: params.leadId,
    to_email: params.toEmail,
    subject: params.subject,
    message_id: params.messageId || null,
    status: 'ENVIADO',
    sent_at: new Date().toISOString(),
    created_by: profile?.id || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('lead_emails').insert(row);
  if (error) {
    console.error('Falha ao gravar disparo de e-mail:', error.message);
    return;
  }

  await refreshLeadEmailSummary(supabase, params.leadId);

  if (profile) {
    await supabase.from('lead_activities').insert({
      lead_id: params.leadId,
      user_id: profile.id,
      type: 'EMAIL',
      description: `Enviado via Brevo para ${params.toEmail}\nAssunto: ${params.subject}${
        params.messageId ? `\nmessageId: ${params.messageId}` : ''
      }`,
    });
  }
}

export async function getLeadEmails(leadId: string) {
  if (!leadId) return [] as any[];
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('lead_emails')
    .select('*')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar e-mails do lead:', error);
    return [];
  }
  return (data || []) as any[];
}

/** Atualiza Entregue/Lido/Rejeitado com os eventos da Brevo (botão na tela; o cron usa a service role). */
export async function syncBrevoEmailEvents(days = 7) {
  return syncBrevoEmailEventsWith(getDbClient(), days);
}

/** Quem pode ver/usar o botão de e-mail Brevo no painel. */
export async function canSendBrevoEmail() {
  const profile = await loadAuthProfile();
  const email = String(profile?.email || '').trim().toLowerCase();
  return Boolean(profile && profile.role === 'admin' && email && allowedBrevoEmails().includes(email));
}

async function assertCanSendBrevo(): Promise<string | null> {
  const ok = await canSendBrevoEmail();
  return ok ? null : 'Apenas Victor Hugo (admin) pode enviar e-mails via Brevo.';
}

export type BrevoDailyQuota = {
  used: number;
  remaining: number;
  limit: number;
};

export async function getBrevoDailyQuota(): Promise<BrevoDailyQuota> {
  const { BREVO_DAILY_LIMIT, fetchBrevoDailyQuota, startOfBrevoDayISO } = await import('@/lib/brevo');

  const remote = await fetchBrevoDailyQuota();
  if (remote.ok) {
    return {
      used: remote.used,
      remaining: remote.remaining,
      limit: remote.limit,
    };
  }

  console.error('Cota Brevo (API):', remote.error);
  const supabase = getDbClient();
  const { count, error } = await supabase
    .from('lead_emails')
    .select('id', { count: 'exact', head: true })
    .not('message_id', 'is', null)
    .gte('sent_at', startOfBrevoDayISO());

  if (error) {
    console.error('Cota diária Brevo (local):', error);
    return { used: 0, remaining: BREVO_DAILY_LIMIT, limit: BREVO_DAILY_LIMIT };
  }

  const used = count || 0;
  return {
    used,
    remaining: Math.max(0, BREVO_DAILY_LIMIT - used),
    limit: BREVO_DAILY_LIMIT,
  };
}

async function assertBrevoDailyQuota(needed: number): Promise<string | null> {
  if (needed <= 0) return null;
  const quota = await getBrevoDailyQuota();
  if (quota.remaining <= 0) {
    return `Limite diário da Brevo atingido (${quota.limit}/dia). Volte amanhã.`;
  }
  if (needed > quota.remaining) {
    return `A Brevo permite ${quota.limit} envios/dia. Restam ${quota.remaining}. Selecione no máximo ${quota.remaining} lead(s) com e-mail.`;
  }
  return null;
}

async function getEmailTemplateExtras(): Promise<Record<string, string>> {
  const { companySettingsToVars } = await import('@/lib/email-templates');
  return companySettingsToVars(await getCompanySettings());
}

export type EmailTemplateRow = {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at?: string;
  updated_at?: string;
};

export async function getEmailTemplates() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('email_templates')
    .select('id, name, subject, body, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar modelos de e-mail:', error);
    return [] as EmailTemplateRow[];
  }
  return (data || []) as EmailTemplateRow[];
}

export type EmailTemplateMutationResult =
  | { success: true; template: EmailTemplateRow }
  | { error: string };

export async function createEmailTemplate(input: {
  name: string;
  subject: string;
  body: string;
}): Promise<EmailTemplateMutationResult> {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };

  const name = input.name.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!name || !subject || !body) return { error: 'Nome, assunto e mensagem são obrigatórios.' };

  const profile = await loadAuthProfile();
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      name,
      subject,
      body,
      created_by: profile?.id || null,
    })
    .select('id, name, subject, body, created_at, updated_at')
    .single();

  if (error || !data) {
    return { error: error?.message || 'Falha ao criar modelo. Rode a migration 12 no Supabase.' };
  }

  revalidatePath('/leads');
  revalidatePath('/configuracoes');
  return { success: true, template: data as EmailTemplateRow };
}

export async function updateEmailTemplate(
  id: string,
  input: { name: string; subject: string; body: string },
): Promise<EmailTemplateMutationResult> {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };

  const name = input.name.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!id || !name || !subject || !body) {
    return { error: 'Nome, assunto e mensagem são obrigatórios.' };
  }

  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('email_templates')
    .update({
      name,
      subject,
      body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, name, subject, body, created_at, updated_at')
    .single();

  if (error || !data) return { error: 'Falha ao atualizar modelo.' };

  revalidatePath('/leads');
  revalidatePath('/configuracoes');
  return { success: true, template: data as EmailTemplateRow };
}

export async function deleteEmailTemplate(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };
  if (!id) return { error: 'Modelo inválido.' };

  const supabase = getDbClient();
  const { error } = await supabase.from('email_templates').delete().eq('id', id);
  if (error) return { error: 'Falha ao excluir modelo.' };

  revalidatePath('/leads');
  revalidatePath('/configuracoes');
  return { success: true };
}

/** Insere ou atualiza os modelos padrão Codratec (por nome). */
export async function seedDefaultEmailTemplates(): Promise<
  | { success: true; created: number; skipped: number; templates: EmailTemplateRow[] }
  | { error: string }
> {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };

  const { OUTREACH_TEMPLATES } = await import('@/lib/email-templates');
  const supabase = getDbClient();
  const profile = await loadAuthProfile();

  const existing = await getEmailTemplates();
  const byName = new Map(existing.map((t) => [t.name, t]));

  let created = 0;
  let skipped = 0;

  for (const tpl of OUTREACH_TEMPLATES) {
    const current = byName.get(tpl.name);
    if (current) {
      const { error } = await supabase
        .from('email_templates')
        .update({ subject: tpl.subject, body: tpl.body })
        .eq('id', current.id);
      if (error) return { error: `Falha ao atualizar "${tpl.name}".` };
      skipped += 1;
      continue;
    }
    const { error } = await supabase.from('email_templates').insert({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
      created_by: profile?.id || null,
    });
    if (error) return { error: `Falha ao criar "${tpl.name}".` };
    created += 1;
  }

  revalidatePath('/leads');
  revalidatePath('/configuracoes');
  const templates = await getEmailTemplates();
  return { success: true, created, skipped, templates };
}

export async function sendLeadEmail(params: {
  leadId: string;
  subject: string;
  htmlContent?: string;
  bodyText?: string;
  templateId?: string | null;
}) {
  const deny = await assertCanSendBrevo();
  if (deny) return { error: deny };
  const quotaDeny = await assertBrevoDailyQuota(1);
  if (quotaDeny) return { error: quotaDeny };

  const { applyEmailTemplate } = await import('@/lib/email-templates');
  const { sendTransactionalEmail } = await import('@/lib/brevo');
  const extras = await getEmailTemplateExtras();
  const supabase = getDbClient();

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*, assigned:profiles(full_name, email)')
    .eq('id', params.leadId)
    .maybeSingle();

  if (error || !lead) return { error: 'Lead não encontrado.' };
  if (!lead.email) return { error: 'Este lead não tem e-mail cadastrado.' };

  let subject = params.subject;
  let bodyText = params.bodyText || '';

  if (params.templateId) {
    const { data: tpl } = await supabase
      .from('email_templates')
      .select('subject, body')
      .eq('id', params.templateId)
      .maybeSingle();
    if (tpl) {
      subject = applyEmailTemplate(tpl.subject, lead, extras);
      bodyText = applyEmailTemplate(tpl.body, lead, extras);
    }
  } else {
    subject = applyEmailTemplate(subject, lead, extras);
    if (bodyText) bodyText = applyEmailTemplate(bodyText, lead, extras);
  }

  subject = subject.trim();
  const htmlContent = (params.htmlContent || textToHtmlEmail(bodyText)).trim();
  if (!subject || !htmlContent) return { error: 'Assunto e mensagem são obrigatórios.' };

  const toName =
    (lead.trade_name || lead.company || lead.name || '').trim() || undefined;

  const result = await sendTransactionalEmail({
    toEmail: lead.email,
    toName,
    subject,
    htmlContent,
  });

  if (!result.ok) return { error: result.error };

  await recordLeadEmailSend({
    leadId: params.leadId,
    toEmail: lead.email,
    subject,
    messageId: result.messageId,
  });

  return { success: true, messageId: result.messageId };
}

/** Envio em lote com modelo (ou assunto/corpo com tags). */
export async function sendLeadsBulkEmail(params: {
  leadIds: string[];
  templateId?: string | null;
  subject?: string;
  bodyText?: string;
  /** Se true, envia além da cota do dia; a Brevo coloca o excedente na fila (até ~1000) para amanhã. */
  allowQueueOverflow?: boolean;
}): Promise<
  | {
      success: true;
      sent: number;
      skipped: number;
      failed: number;
      failures: string[];
      queuedForTomorrow?: number;
    }
  | { error: string }
> {
  const deny = await assertCanSendBrevo();
  if (deny) return { error: deny };

  const ids = Array.from(new Set((params.leadIds || []).filter(Boolean)));
  if (ids.length === 0) return { error: 'Nenhum lead selecionado.' };

  const { BREVO_DAILY_LIMIT } = await import('@/lib/brevo');
  const maxBatch = params.allowQueueOverflow ? BREVO_DAILY_LIMIT + 1000 : BREVO_DAILY_LIMIT;
  if (ids.length > maxBatch) {
    return {
      error: params.allowQueueOverflow
        ? `Limite de ${maxBatch} e-mails por disparo (cota do dia + fila de espera da Brevo).`
        : 'Limite de 300 e-mails por disparo (cota diária da Brevo).',
    };
  }

  const { applyEmailTemplate } = await import('@/lib/email-templates');
  const { sendTransactionalEmail } = await import('@/lib/brevo');
  const extras = await getEmailTemplateExtras();
  const supabase = getDbClient();

  let tplSubject = params.subject || '';
  let tplBody = params.bodyText || '';

  if (params.templateId) {
    const { data: tpl } = await supabase
      .from('email_templates')
      .select('subject, body')
      .eq('id', params.templateId)
      .maybeSingle();
    if (!tpl) return { error: 'Modelo de e-mail não encontrado.' };
    tplSubject = tpl.subject;
    tplBody = tpl.body;
  }

  if (!tplSubject.trim() || !tplBody.trim()) {
    return { error: 'Selecione um modelo ou informe assunto e mensagem.' };
  }

  const leadRows: any[] = [];
  for (const chunk of chunkIds(ids)) {
    const { data, error } = await supabase
      .from('leads')
      .select('*, assigned:profiles(full_name, email)')
      .in('id', chunk);
    if (error) return { error: 'Nenhum lead encontrado.' };
    leadRows.push(...(data || []));
  }

  if (!leadRows.length) return { error: 'Nenhum lead encontrado.' };

  const withEmailCount = leadRows.filter((lead) => lead.email).length;
  const quota = await getBrevoDailyQuota();

  if (!params.allowQueueOverflow) {
    const quotaDeny = await assertBrevoDailyQuota(withEmailCount);
    if (quotaDeny) return { error: quotaDeny };
  } else if (quota.remaining <= 0 && withEmailCount > 1000) {
    return {
      error: `Cota de hoje esgotada. A fila da Brevo aceita no máximo 1000 e-mails para amanhã. Selecione no máximo 1000.`,
    };
  } else if (withEmailCount > quota.remaining + 1000) {
    return {
      error: `Restam ${quota.remaining} hoje + até 1000 na fila. Selecione no máximo ${quota.remaining + 1000} lead(s) com e-mail.`,
    };
  }

  let sent = 0;
  let skipped = 0;
  let queuedForTomorrow = 0;
  const failures: string[] = [];
  let remainingToday = quota.remaining;

  for (const lead of leadRows) {
    if (!lead.email) {
      skipped += 1;
      continue;
    }
    if (!params.allowQueueOverflow && remainingToday <= 0) {
      skipped += 1;
      continue;
    }
    const subject = applyEmailTemplate(tplSubject, lead, extras).trim();
    const bodyText = applyEmailTemplate(tplBody, lead, extras);
    const toName =
      (lead.trade_name || lead.company || lead.name || '').trim() || undefined;

    const intoQueue = remainingToday <= 0;
    const result = await sendTransactionalEmail({
      toEmail: lead.email,
      toName,
      subject,
      htmlContent: textToHtmlEmail(bodyText),
    });

    if (!result.ok) {
      failures.push(`${lead.email}: ${result.error}`);
      continue;
    }
    await recordLeadEmailSend({
      leadId: lead.id,
      toEmail: lead.email,
      subject,
      messageId: result.messageId,
    });
    sent += 1;
    if (intoQueue) queuedForTomorrow += 1;
    else remainingToday -= 1;
  }

  return {
    success: true,
    sent,
    skipped,
    failed: failures.length,
    failures: failures.slice(0, 5),
    queuedForTomorrow,
  };
}
