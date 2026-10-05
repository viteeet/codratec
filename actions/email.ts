'use server';

import { revalidatePath } from 'next/cache';
import { getCompanySettings } from '@/actions/settings';
import { assertIsAdmin, getDbClient, loadAuthProfile } from '@/lib/server/actions-helpers';

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

function normalizeEmailAddr(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

async function refreshLeadEmailSummary(supabase: any, leadId: string) {
  const { data: latest } = await supabase
    .from('lead_emails')
    .select('status, sent_at, subject, to_email')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase
    .from('leads')
    .update({
      last_email_status: latest?.status || null,
      last_email_at: latest?.sent_at || null,
      last_email_subject: latest?.subject || null,
      last_email_to: latest?.to_email || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);
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

export async function syncBrevoEmailEvents(days = 7) {
  const { fetchTransactionalEvents } = await import('@/lib/brevo');
  const { statusFromBrevoEvent } = await import('@/lib/email-status');
  const report = await fetchTransactionalEvents({ days, limit: 2500 });
  if (!report.ok) return { error: report.error, updated: 0 };

  const supabase = getDbClient();
  const events = report.events;
  if (events.length === 0) return { success: true, updated: 0, events: 0 };

  type Acc = {
    status: 'ENVIADO' | 'ENTREGUE' | 'LIDO' | 'REJEITADO';
    delivered_at: string | null;
    opened_at: string | null;
    bounce_reason: string | null;
    email: string;
    subject?: string;
  };

  const mergeAcc = (prev: Acc | undefined, patch: Acc): Acc => {
    if (!prev) return patch;
    const statuses = [prev.status, patch.status];
    const status = statuses.includes('LIDO')
      ? 'LIDO'
      : statuses.includes('ENTREGUE')
        ? 'ENTREGUE'
        : statuses.includes('REJEITADO')
          ? 'REJEITADO'
          : 'ENVIADO';
    return {
      status,
      delivered_at: patch.delivered_at || prev.delivered_at,
      opened_at: patch.opened_at || prev.opened_at,
      bounce_reason: patch.bounce_reason || prev.bounce_reason,
      email: patch.email || prev.email,
      subject: patch.subject || prev.subject,
    };
  };

  const byMessage = new Map<string, Acc>();
  const byEmail = new Map<string, Acc>();

  for (const item of events) {
    const next = statusFromBrevoEvent(item.event);
    if (!next) continue;
    const email = normalizeEmailAddr(item.email);
    const patch: Acc = {
      status: next,
      delivered_at: next === 'ENTREGUE' || next === 'LIDO' ? item.date : null,
      opened_at: next === 'LIDO' ? item.date : null,
      bounce_reason: next === 'REJEITADO' ? item.reason || item.event : null,
      email,
      subject: item.subject,
    };
    if (item.messageId) byMessage.set(item.messageId, mergeAcc(byMessage.get(item.messageId), patch));
    if (email) byEmail.set(email, mergeAcc(byEmail.get(email), patch));
  }

  let updated = 0;
  const touched = new Set<string>();

  for (const [messageId, acc] of byMessage) {
    const { data: rows } = await supabase
      .from('lead_emails')
      .select('id, lead_id, status')
      .eq('message_id', messageId);
    const list = rows || [];
    if (list.length === 0) continue;
    for (const row of list) {
      const { error } = await supabase
        .from('lead_emails')
        .update({
          status: acc.status,
          delivered_at: acc.delivered_at,
          opened_at: acc.opened_at,
          bounce_reason: acc.bounce_reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (!error) {
        updated += 1;
        if (row.lead_id) touched.add(row.lead_id);
      }
    }
  }

  const unmatchedEmails = Array.from(byEmail.keys());
  const originals = new Map<string, string[]>();
  for (const item of events) {
    const lower = normalizeEmailAddr(item.email);
    if (!lower) continue;
    const list = originals.get(lower) || [];
    list.push(item.email);
    originals.set(lower, list);
  }
  if (unmatchedEmails.length > 0) {
    const chunkSize = 80;
    for (let i = 0; i < unmatchedEmails.length; i += chunkSize) {
      const chunk = unmatchedEmails.slice(i, i + chunkSize);
      const lookup = Array.from(new Set(chunk.flatMap((e) => originals.get(e) || [e])));
      const { data: leads } = await supabase.from('leads').select('id, email').in('email', lookup);
      for (const lead of leads || []) {
        const acc = byEmail.get(normalizeEmailAddr(lead.email));
        if (!acc) continue;
        const { data: existing } = await supabase
          .from('lead_emails')
          .select('id, status')
          .eq('lead_id', lead.id)
          .eq('to_email', lead.email)
          .order('sent_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing?.id) {
          const { error } = await supabase
            .from('lead_emails')
            .update({
              status: acc.status,
              delivered_at: acc.delivered_at,
              opened_at: acc.opened_at,
              bounce_reason: acc.bounce_reason,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          if (!error) {
            updated += 1;
            touched.add(lead.id);
          }
        } else {
          // Só atualiza status de disparos já registrados; não inventa envio
          // (isso inflava a cota local e marcava lead como "com disparo" sem message_id).
        }
      }
    }
  }

  for (const leadId of touched) {
    await refreshLeadEmailSummary(supabase, leadId);
  }

  return { success: true, updated, events: events.length };
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

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, assigned:profiles(full_name, email)')
    .in('id', ids);

  if (error || !leads?.length) return { error: 'Nenhum lead encontrado.' };

  const leadRows = leads as any[];
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
