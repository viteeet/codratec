'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/types/database';

function getDbClient() {
  return createClient() as any;
}

export async function getAuthProfile() {
  const supabase = getDbClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return profile;
}

export async function getNotifications() {
  const supabase = getDbClient();
  const notifications: any[] = [];

  // 1. Calls comercial agendadas
  const { data: calls } = await supabase
    .from('leads')
    .select('id, name, scheduled_call_at')
    .not('scheduled_call_at', 'is', null)
    .order('scheduled_call_at', { ascending: true })
    .limit(4);

  if (calls) {
    calls.forEach((c: any) => {
      notifications.push({
        id: `call-${c.id}`,
        title: '📞 Reunião Comercial Agendada',
        message: `Call com ${c.name} agendada para ${new Date(c.scheduled_call_at).toLocaleDateString('pt-BR')}`,
        type: 'call',
        link: '/leads',
        date: c.scheduled_call_at,
      });
    });
  }

  // 2. Orçamentos enviados aguardando resposta
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, title, total_amount')
    .eq('status', 'ENVIADO')
    .limit(3);

  if (quotes) {
    quotes.forEach((q: any) => {
      notifications.push({
        id: `quote-${q.id}`,
        title: '📄 Orçamento Aguardando Cliente',
        message: `${q.title} (R$ ${Number(q.total_amount || 0).toLocaleString('pt-BR')}) enviado`,
        type: 'quote',
        link: '/orcamentos',
        date: new Date().toISOString(),
      });
    });
  }

  // 3. Leads novos sem consultor atribuído
  const { data: newLeads } = await supabase
    .from('leads')
    .select('id, name')
    .eq('status', 'NOVO')
    .is('assigned_to', null)
    .limit(3);

  if (newLeads) {
    newLeads.forEach((l: any) => {
      notifications.push({
        id: `lead-${l.id}`,
        title: '🎯 Novo Lead na Fila Pública',
        message: `${l.name} aguardando atendimento comercial`,
        type: 'lead',
        link: '/leads',
        date: new Date().toISOString(),
      });
    });
  }

  return notifications;
}

// ==============================================================================
// 1. DASHBOARD METRICS
// ==============================================================================
export async function getDashboardMetrics() {
  const supabase = getDbClient();

  const [
    { data: revenues },
    { data: expenses },
    { data: leads },
    { data: quotes },
    { data: projects },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('revenues').select('amount, status'),
    supabase.from('expenses').select('amount, status'),
    supabase.from('leads').select('id, status'),
    supabase.from('quotes').select('id, status'),
    supabase.from('projects').select('*, client:clients(name, company)').order('created_at', { ascending: false }).limit(5),
    supabase.from('tasks').select('id, status'),
  ]);

  const totalRevenue = ((revenues as any[]) || [])
    .filter((r: any) => r.status === 'PAGO')
    .reduce((acc: number, cur: any) => acc + Number(cur.amount || 0), 0);

  const totalExpense = ((expenses as any[]) || [])
    .filter((e: any) => e.status === 'PAGO')
    .reduce((acc: number, cur: any) => acc + Number(cur.amount || 0), 0);

  const estimatedProfit = totalRevenue - totalExpense;

  const activeLeadsCount = ((leads as any[]) || []).filter((l: any) => l.status !== 'PERDIDO' && l.status !== 'GANHO' && l.status !== 'NAO_INTERESSADO').length;
  const sentQuotesCount = ((quotes as any[]) || []).filter((q: any) => q.status === 'ENVIADO' || q.status === 'APROVADO').length;
  const activeProjectsCount = ((projects as any[]) || []).filter((p: any) => p.status === 'EM_ANDAMENTO' || p.status === 'PLANEJAMENTO').length;
  const openTasksCount = ((tasks as any[]) || []).filter((t: any) => t.status !== 'DONE').length;

  return {
    totalRevenue,
    totalExpense,
    estimatedProfit,
    activeLeadsCount,
    sentQuotesCount,
    activeProjectsCount,
    openTasksCount,
    recentProjects: ((projects as any[]) || []),
  };
}

// ==============================================================================
// 2. METAS MENSARIAIS DE VENDAS & COMISSÕES (CONSULTORES)
// ==============================================================================
export async function getMonthlySalesPerformance(targetYear?: number, targetMonth?: number) {
  const supabase = getDbClient();
  const now = new Date();
  const year = targetYear || now.getFullYear();
  const month = targetMonth || (now.getMonth() + 1);

  // 1. Busca todos os consultores/vendedores e administradores
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .or('role.eq.vendedor,role.eq.admin');

  // 2. Busca as metas configuradas para o ano/mês
  const { data: goals } = await supabase
    .from('sales_goals')
    .select('*')
    .eq('year', year)
    .eq('month', month);

  // 3. Busca todos os leads GANHOS (vendas concluídas)
  const { data: wonLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'GANHO');

  // 4. Busca todos os orçamentos/projetos para cálculo do faturamento por vendedor
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, client:clients(lead_id)')
    .eq('status', 'APROVADO');

  const performanceList = (members || []).map((vendedor: any) => {
    const userGoal = (goals || []).find((g: any) => g.user_id === vendedor.id);
    const targetSalesCount = userGoal?.target_sales_count || 8; // Default 8 vendas/mês
    const commissionRatePercent = Number(userGoal?.commission_rate_percent || 10.0); // Default 10% comissão

    // Vendas realizadas pelo vendedor no mês selecionado
    const sellerWonLeads = (wonLeads || []).filter((l: any) => {
      if (l.assigned_to !== vendedor.id) return false;
      const updatedDate = new Date(l.updated_at || l.created_at);
      return updatedDate.getFullYear() === year && (updatedDate.getMonth() + 1) === month;
    });

    const realSalesCount = sellerWonLeads.length;
    const progressPercent = Math.min(Math.round((realSalesCount / targetSalesCount) * 1000) / 10, 100);

    // Faturamento gerado no mês
    const totalRevenueGenerated = sellerWonLeads.reduce((acc: number, lead: any) => {
      const leadQuotes = (quotes || []).filter((q: any) => q.client?.lead_id === lead.id);
      const leadValue = leadQuotes.reduce((qAcc: number, q: any) => qAcc + Number(q.total_amount || 0), 0);
      return acc + leadValue;
    }, 0);

    const calculatedCommission = (totalRevenueGenerated * commissionRatePercent) / 100;

    return {
      vendedorId: vendedor.id,
      name: vendedor.full_name || vendedor.email,
      email: vendedor.email,
      avatarUrl: vendedor.avatar_url,
      role: vendedor.role,
      year,
      month,
      targetSalesCount,
      realSalesCount,
      progressPercent,
      totalRevenueGenerated,
      commissionRatePercent,
      calculatedCommission,
    };
  });

  // Ordenar ranking pelas vendas realizadas (decrescente)
  performanceList.sort((a: any, b: any) => b.realSalesCount - a.realSalesCount);

  return performanceList;
}

export async function setVendedorMonthlyGoal(formData: FormData) {
  const supabase = getDbClient();

  const userId = formData.get('userId') as string;
  const year = parseInt(formData.get('year') as string, 10);
  const month = parseInt(formData.get('month') as string, 10);
  const targetSalesCount = parseInt(formData.get('targetSalesCount') as string, 10);
  const commissionRatePercent = parseFloat((formData.get('commissionRatePercent') as string) || '10.0');

  if (!userId || !year || !month || !targetSalesCount) {
    return { error: 'Preencha o vendedor, período e meta de vendas.' };
  }

  const { error } = await supabase.from('sales_goals').upsert({
    user_id: userId,
    year,
    month,
    target_sales_count: targetSalesCount,
    commission_rate_percent: commissionRatePercent,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,year,month' });

  if (error) {
    console.error('Erro ao salvar meta do vendedor:', error);
    return { error: 'Falha ao salvar meta no banco de dados.' };
  }

  revalidatePath('/vendedores');
  revalidatePath('/dashboard');
  return { success: true };
}

// ==============================================================================
// 3. MÓDULO LEADS & CLIENTES
// ==============================================================================
export async function getLeads() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*, assigned:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar leads:', error);
  return (data || []) as any[];
}

export async function createLead(formData: FormData) {
  const supabase = getDbClient();

  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const source = (formData.get('source') as string) || 'Site';
  const status = (formData.get('status') as string) || 'NOVO';
  const notes = formData.get('notes') as string;

  if (!name) return { error: 'O nome do lead é obrigatório.' };

  const { error } = await supabase.from('leads').insert({
    name,
    company,
    email,
    phone,
    whatsapp,
    city,
    state,
    source,
    status,
    notes,
  });

  if (error) return { error: 'Falha ao salvar lead.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function assignLead(leadId: string, assignedTo: string | null) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from('leads')
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) return { error: 'Falha ao atribuir lead ao vendedor.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  revalidatePath('/vendedores');
  return { success: true };
}

/** Atribui ou devolve à fila pública vários leads de uma vez. */
export async function assignLeadsBulk(leadIds: string[], assignedTo: string | null) {
  const ids = Array.from(new Set((leadIds || []).filter(Boolean)));
  if (ids.length === 0) return { error: 'Nenhum lead selecionado.' };

  const supabase = getDbClient();
  const { error } = await supabase
    .from('leads')
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) return { error: 'Falha ao atribuir leads em lote.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  revalidatePath('/vendedores');
  return { success: true, count: ids.length };
}

/** Atualiza status de vários leads (ação em massa estilo CRM). */
export async function updateLeadsStatusBulk(leadIds: string[], status: string) {
  const ids = Array.from(new Set((leadIds || []).filter(Boolean)));
  if (ids.length === 0) return { error: 'Nenhum lead selecionado.' };
  if (!status) return { error: 'Status inválido.' };

  const supabase = getDbClient();
  const { error } = await supabase
    .from('leads')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) return { error: 'Falha ao atualizar status em lote.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  return { success: true, count: ids.length };
}

export type LeadEditPayload = {
  name?: string | null;
  company?: string | null;
  trade_name?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  main_activity?: string | null;
  cnae_code?: string | null;
  notes?: string | null;
  source?: string | null;
  status?: string | null;
};

export async function updateLead(leadId: string, payload: LeadEditPayload) {
  if (!leadId) return { error: 'Lead inválido.' };

  const supabase = getDbClient();
  const data: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const fields: (keyof LeadEditPayload)[] = [
    'name',
    'company',
    'trade_name',
    'document',
    'email',
    'phone',
    'whatsapp',
    'city',
    'state',
    'main_activity',
    'cnae_code',
    'notes',
    'source',
    'status',
  ];

  for (const key of fields) {
    if (key in payload) {
      const value = payload[key];
      data[key] = typeof value === 'string' ? value.trim() || null : value ?? null;
    }
  }

  if (payload.name !== undefined && !String(payload.name || '').trim()) {
    return { error: 'O nome do lead é obrigatório.' };
  }

  const { data: updated, error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', leadId)
    .select('*, assigned:profiles(full_name, email)')
    .maybeSingle();

  if (error) return { error: 'Falha ao salvar alterações do lead.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  return { success: true, lead: updated };
}

export async function deleteLead(leadId: string) {
  if (!leadId) return { error: 'Lead inválido.' };

  const supabase = getDbClient();
  const { error } = await supabase.from('leads').delete().eq('id', leadId);

  if (error) {
    return {
      error:
        'Falha ao excluir lead. Se o erro persistir, verifique se sua conta tem permissão de exclusão (admin).',
    };
  }

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  revalidatePath('/vendedores');
  return { success: true };
}

export async function deleteLeadsBulk(leadIds: string[]) {
  const ids = Array.from(new Set((leadIds || []).filter(Boolean)));
  if (ids.length === 0) return { error: 'Nenhum lead selecionado.' };

  const supabase = getDbClient();
  const { error } = await supabase.from('leads').delete().in('id', ids);

  if (error) {
    return {
      error:
        'Falha ao excluir leads em lote. Exclusão costuma exigir perfil admin.',
    };
  }

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  revalidatePath('/vendedores');
  return { success: true, count: ids.length };
}

function textToHtmlEmail(text: string) {
  return `<html><body>${String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>')}</body></html>`;
}

/** Quem pode ver/usar o botão de e-mail Brevo no painel. */
export async function canSendBrevoEmail() {
  const profile = await getAuthProfile();
  const allowedEmail = (
    process.env.BREVO_ALLOWED_USER_EMAIL || 'victor.hg.pereira@gmail.com'
  )
    .trim()
    .toLowerCase();
  const email = String(profile?.email || '').toLowerCase();
  return Boolean(profile && profile.role === 'admin' && email === allowedEmail);
}

async function assertCanSendBrevo(): Promise<string | null> {
  const ok = await canSendBrevoEmail();
  return ok ? null : 'Apenas Victor Hugo (admin) pode enviar e-mails via Brevo.';
}

async function assertIsAdmin(): Promise<string | null> {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== 'admin') {
    return 'Apenas administradores podem alterar configurações.';
  }
  return null;
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

  const profile = await getAuthProfile();
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

  if (error || !data) return { error: 'Falha ao criar modelo. Rode a migration 12 no Supabase.' };

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
  const profile = await getAuthProfile();

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

  const { applyEmailTemplate } = await import('@/lib/email-templates');
  const { sendTransactionalEmail } = await import('@/lib/brevo');
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
      subject = applyEmailTemplate(tpl.subject, lead);
      bodyText = applyEmailTemplate(tpl.body, lead);
    }
  } else {
    subject = applyEmailTemplate(subject, lead);
    if (bodyText) bodyText = applyEmailTemplate(bodyText, lead);
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

  return { success: true, messageId: result.messageId };
}

/** Envio em lote com modelo (ou assunto/corpo com tags). */
export async function sendLeadsBulkEmail(params: {
  leadIds: string[];
  templateId?: string | null;
  subject?: string;
  bodyText?: string;
}): Promise<
  | {
      success: true;
      sent: number;
      skipped: number;
      failed: number;
      failures: string[];
    }
  | { error: string }
> {
  const deny = await assertCanSendBrevo();
  if (deny) return { error: deny };

  const ids = Array.from(new Set((params.leadIds || []).filter(Boolean)));
  if (ids.length === 0) return { error: 'Nenhum lead selecionado.' };
  if (ids.length > 300) return { error: 'Limite de 300 e-mails por disparo.' };

  const { applyEmailTemplate } = await import('@/lib/email-templates');
  const { sendTransactionalEmail } = await import('@/lib/brevo');
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

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const lead of leads) {
    if (!lead.email) {
      skipped += 1;
      continue;
    }
    const subject = applyEmailTemplate(tplSubject, lead).trim();
    const bodyText = applyEmailTemplate(tplBody, lead);
    const toName =
      (lead.trade_name || lead.company || lead.name || '').trim() || undefined;

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
    sent += 1;
  }

  return {
    success: true,
    sent,
    skipped,
    failed: failures.length,
    failures: failures.slice(0, 5),
  };
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) return { error: 'Falha ao atualizar status do lead.' };

  // Se o lead foi marcado como GANHO (Venda Concluída), converte automaticamente em Cliente
  if (status === 'GANHO') {
    const { data: leadData } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (leadData) {
      const query = leadData.document
        ? `lead_id.eq.${leadId},document.eq.${leadData.document}`
        : `lead_id.eq.${leadId}`;

      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .or(query)
        .maybeSingle();

      if (!existingClient) {
        await supabase.from('clients').insert({
          lead_id: leadId,
          name: leadData.name || leadData.company || 'Cliente',
          company: leadData.company || leadData.trade_name || null,
          document: leadData.document || null,
          email: leadData.email || null,
          phone: leadData.phone || null,
          whatsapp: leadData.whatsapp || null,
          city: leadData.city || null,
          state: leadData.state || null,
          notes: `Cliente convertido automaticamente a partir do Lead em ${new Date().toLocaleDateString('pt-BR')}`,
        });
      }
    }
  }

  revalidatePath('/leads');
  revalidatePath('/clientes');
  revalidatePath('/orcamentos');
  revalidatePath('/vendedores');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function scheduleLeadCall(leadId: string, scheduledAt: string, notes?: string) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from('leads')
    .update({
      status: 'CALL_AGENDADA',
      scheduled_call_at: scheduledAt,
      call_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) return { error: 'Falha ao agendar reunião.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function markLeadUninterested(leadId: string, reason?: string) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from('leads')
    .update({
      status: 'NAO_INTERESSADO',
      uninterest_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) return { error: 'Falha ao marcar lead como não interessado.' };

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function importLeadsBatch(rawItems: any[], defaultAssignedTo?: string | null) {
  const supabase = getDbClient();

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: 'Nenhum lead fornecido no payload JSON.' };
  }

  const normalizedLeads = rawItems.map((item) => {
    const document = item.documento || item.document || item.cnpj || item.cpf || null;
    const personType = item.tipo_pessoa || item.person_type || 'PJ';
    const company = item.razao_social || item.company || item.empresa || null;
    const tradeName = item.nome_fantasia || item.trade_name || null;
    const name = item.contato || item.nome || item.name || company || tradeName || 'Lead Sem Nome';
    const phone = item.telefone || item.phone || null;
    const whatsapp = item.whatsapp || phone;
    const email = item.email || null;
    const city = item.cidade || item.city || null;
    const state = item.uf || item.state || null;
    const mainActivity = item.atividade_principal || item.main_activity || null;
    const cnaeCode = item.cnae_principal || item.cnae_code || null;
    const category = item.categoria || item.category || null;
    const niche = item.nicho || item.niche || null;
    const source = item.origem || item.source || 'Importação JSON';
    const rawStatus = (item.status || 'NOVO').toString().toUpperCase();
    const validStatuses = ['NOVO', 'CONTATO', 'QUALIFICADO', 'CALL_AGENDADA', 'PROPOSTA', 'NEGOCIACAO', 'GANHO', 'NAO_INTERESSADO', 'SEM_RESPOSTA', 'FUTURO'];
    const status = validStatuses.includes(rawStatus) ? rawStatus : 'NOVO';

    const assignedTo = item.responsavel_id || item.assigned_to || defaultAssignedTo || null;
    const notes = item.observacoes || item.notes || null;

    return {
      document,
      person_type: personType,
      company,
      trade_name: tradeName,
      name,
      phone,
      whatsapp,
      email,
      city,
      state,
      main_activity: mainActivity,
      cnae_code: cnaeCode,
      category,
      niche,
      source,
      status,
      assigned_to: assignedTo,
      notes,
    };
  });

  const { data, error } = await supabase.from('leads').insert(normalizedLeads).select();

  if (error) {
    console.error('Erro ao importar batch de leads:', error);
    return { error: `Falha ao importar leads: ${error.message}` };
  }

  revalidatePath('/leads');
  revalidatePath('/vendedores');
  revalidatePath('/dashboard');
  return { success: true, count: data?.length || 0 };
}

// ==============================================================================
// 4. MÓDULO CLIENTES
// ==============================================================================
export async function getClients() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar clientes:', error);
  return (data || []) as any[];
}

export async function createClientAccount(formData: FormData) {
  const supabase = getDbClient();

  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const document = formData.get('document') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;

  if (!name) return { error: 'O nome do cliente é obrigatório.' };

  const { error } = await supabase.from('clients').insert({
    name,
    company,
    document,
    email,
    phone,
    city,
    state,
  });

  if (error) return { error: 'Falha ao salvar cliente.' };

  revalidatePath('/clientes');
  revalidatePath('/orcamentos');
  return { success: true };
}

// ==============================================================================
// 5. MÓDULO ORÇAMENTOS
// ==============================================================================
export async function getQuote(id: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(name, company, document, email, phone)')
    .eq('id', id)
    .maybeSingle();

  if (error) console.error('Erro ao buscar orçamento:', error);
  return (data || null) as any;
}

export async function getQuotes() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(name, company, document, email, phone)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar orçamentos:', error);
  return (data || []) as any[];
}

export async function createQuote(formData: FormData) {
  const supabase = getDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'gerente')) {
    return { error: 'Permissão negada: Apenas o Administrador ou Gerente Comercial podem emitir orçamentos oficiais.' };
  }

  const { clientId, title, payload } = quotePayloadFromForm(formData);
  if (!title || !clientId) return { error: 'Preencha o cliente e o título do orçamento.' };

  const { data: quoteData, error } = await supabase.from('quotes').insert({
    ...payload,
    created_by: user.id,
  }).select().single();

  if (error) return { error: 'Falha ao salvar orçamento no banco de dados.' };

  if (payload.status === 'APROVADO' && quoteData) {
    await autoConvertQuoteToProjectAndRevenue(quoteData);
  }

  revalidatePath('/orcamentos');
  revalidatePath('/projetos');
  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}

function quotePayloadFromForm(formData: FormData) {
  const clientId = String(formData.get('clientId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const solicitation = String(formData.get('solicitation') || '').trim();
  const proposedSolution = String(formData.get('proposedSolution') || '').trim();
  const generalScope = String(formData.get('generalScope') || '').trim();
  const description =
    String(formData.get('description') || '').trim() ||
    [
      solicitation && `SOLICITAÇÃO\n\n${solicitation}`,
      proposedSolution && `SOLUÇÃO PROPOSTA\n\n${proposedSolution}`,
      generalScope && `ESCOPO GERAL\n\n${generalScope}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  const setupAmount = parseFloat((formData.get('setupAmount') as string) || '2500');
  const monthlyAmount = parseFloat((formData.get('monthlyAmount') as string) || '600');
  const contractDurationMonths = parseInt((formData.get('contractDurationMonths') as string) || '12', 10);
  const totalAmount = setupAmount + monthlyAmount * contractDurationMonths;
  const validUntil = String(formData.get('validUntil') || '').trim();
  const deliveryDeadlineDays = parseInt((formData.get('deliveryDeadlineDays') as string) || '30', 10);
  const status = String(formData.get('status') || 'RASCUNHO');

  return {
    clientId,
    title,
    payload: {
      client_id: clientId,
      title,
      description,
      solicitation: solicitation || null,
      proposed_solution: proposedSolution || null,
      general_scope: generalScope || null,
      scope_summary: generalScope || null,
      setup_amount: setupAmount,
      monthly_amount: monthlyAmount,
      contract_duration_months: contractDurationMonths,
      total_amount: totalAmount,
      valid_until: validUntil || null,
      delivery_deadline_days: deliveryDeadlineDays,
      status,
      updated_at: new Date().toISOString(),
    },
  };
}

async function assertCanManageQuotes() {
  const supabase = getDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: 'Usuário não autenticado.' as const };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'gerente')) {
    return {
      supabase,
      user,
      error: 'Permissão negada: Apenas o Administrador ou Gerente Comercial podem alterar orçamentos.' as const,
    };
  }
  return { supabase, user, error: null };
}

export async function updateQuote(formData: FormData) {
  const auth = await assertCanManageQuotes();
  if (auth.error) return { error: auth.error };

  const quoteId = String(formData.get('quoteId') || '').trim();
  if (!quoteId) return { error: 'Proposta inválida.' };

  const { clientId, title, payload } = quotePayloadFromForm(formData);
  if (!title || !clientId) return { error: 'Preencha o cliente e o título do orçamento.' };

  const { data: quoteData, error } = await auth.supabase
    .from('quotes')
    .update(payload)
    .eq('id', quoteId)
    .select()
    .single();

  if (error || !quoteData) return { error: 'Falha ao atualizar a proposta.' };

  if (payload.status === 'APROVADO' && quoteData) {
    await autoConvertQuoteToProjectAndRevenue(quoteData);
  }

  revalidatePath('/orcamentos');
  revalidatePath('/projetos');
  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteQuote(quoteId: string) {
  const auth = await assertCanManageQuotes();
  if (auth.error) return { error: auth.error };
  if (!quoteId) return { error: 'Proposta inválida.' };

  const { error } = await auth.supabase.from('quotes').delete().eq('id', quoteId);
  if (error) return { error: 'Falha ao excluir a proposta. Verifique se ela já virou projeto.' };

  revalidatePath('/orcamentos');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateQuoteStatus(quoteId: string, status: string) {
  const supabase = getDbClient();

  const { data: quoteData, error } = await supabase
    .from('quotes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', quoteId)
    .select('*')
    .single();

  if (error) return { error: 'Falha ao atualizar orçamento.' };

  if (status === 'APROVADO' && quoteData) {
    await autoConvertQuoteToProjectAndRevenue(quoteData);
  }

  revalidatePath('/orcamentos');
  revalidatePath('/projetos');
  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}

async function autoConvertQuoteToProjectAndRevenue(quote: any) {
  const supabase = getDbClient();

  const setupAmount = Number(quote.setup_amount || 2500);
  const monthlyAmount = Number(quote.monthly_amount || 600);
  const contractDurationMonths = Number(quote.contract_duration_months || 12);

  const yearOneTotal = setupAmount + (monthlyAmount * contractDurationMonths);
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: project } = await supabase.from('projects').insert({
    client_id: quote.client_id,
    quote_id: quote.id,
    name: quote.title,
    description: quote.description,
    value: yearOneTotal,
    setup_amount: setupAmount,
    monthly_amount: monthlyAmount,
    contract_start_date: today,
    contract_duration_months: contractDurationMonths,
    next_billing_date: nextMonth,
    contract_status: 'ATIVO',
    status: 'PLANEJAMENTO',
    start_date: today,
  }).select().single();

  // 1. Receita de Setup / Implantação
  await supabase.from('revenues').insert({
    client_id: quote.client_id,
    project_id: project?.id || null,
    description: `Setup / Implantação: ${quote.title}`,
    amount: setupAmount,
    due_date: today,
    status: 'PENDENTE',
    category: 'SETUP',
  });

  // 2. Receita de 1ª Mensalidade (Plano de Continuidade Codratec)
  await supabase.from('revenues').insert({
    client_id: quote.client_id,
    project_id: project?.id || null,
    description: `Mensalidade (Plano de Continuidade 1/${contractDurationMonths}): ${quote.title}`,
    amount: monthlyAmount,
    due_date: nextMonth,
    status: 'PENDENTE',
    category: 'MENSALIDADE',
  });
}

// ==============================================================================
// 6. MÓDULO PROJETOS & DEMANDAS
// ==============================================================================
export async function getProjects() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(name, company)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar projetos:', error);
  return (data || []) as any[];
}

export async function createProject(formData: FormData) {
  const supabase = getDbClient();

  const clientId = formData.get('clientId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const value = parseFloat((formData.get('value') as string) || '0');
  const startDate = formData.get('startDate') as string;
  const estimatedCompletionDate = formData.get('estimatedCompletionDate') as string;

  if (!name || !clientId) return { error: 'Preencha o nome do projeto e selecione um cliente.' };

  const { error } = await supabase.from('projects').insert({
    client_id: clientId,
    name,
    description,
    value,
    start_date: startDate || null,
    estimated_completion_date: estimatedCompletionDate || null,
    status: 'PLANEJAMENTO',
  });

  if (error) return { error: 'Falha ao salvar projeto.' };

  revalidatePath('/projetos');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getTasks() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, project:projects(name), assigned:profiles!tasks_assigned_to_fkey(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar demandas:', error);
  return (data || []) as any[];
}

export async function createTask(formData: FormData) {
  const supabase = getDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = (formData.get('priority') as string) || 'NORMAL';
  const status = (formData.get('status') as string) || 'BACKLOG';
  const dueDate = formData.get('dueDate') as string;

  if (!title || !projectId) return { error: 'Selecione um projeto e o título da demanda.' };

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description,
    priority,
    status,
    due_date: dueDate || null,
    created_by: user?.id || null,
  });

  if (error) return { error: 'Falha ao criar demanda.' };

  revalidatePath('/demandas');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = getDbClient();
  const payload: any = { status, updated_at: new Date().toISOString() };
  if (status === 'DONE') {
    payload.completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);

  if (error) return { error: 'Falha ao atualizar demanda.' };

  revalidatePath('/demandas');
  revalidatePath('/dashboard');
  return { success: true };
}

// ==============================================================================
// 7. MÓDULO EQUIPE & MEMBROS
// ==============================================================================
export async function getTeamMembers() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar membros:', error);
  return (data || []) as any[];
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: 'Falha ao alterar perfil do colaborador.' };

  revalidatePath('/equipe');
  revalidatePath('/vendedores');
  revalidatePath('/configuracoes');
  return { success: true };
}

// ==============================================================================
// 8. MÓDULO FINANCEIRO (RECEITAS & DESPESAS)
// ==============================================================================
export async function getFinancialData() {
  const supabase = getDbClient();

  const [{ data: revenues }, { data: expenses }] = await Promise.all([
    supabase.from('revenues').select('*, client:clients(name, company)').order('due_date', { ascending: false }),
    supabase.from('expenses').select('*').order('due_date', { ascending: false }),
  ]);

  return {
    revenues: (revenues || []) as any[],
    expenses: (expenses || []) as any[],
  };
}

export async function createRevenue(formData: FormData) {
  const supabase = getDbClient();

  const description = formData.get('description') as string;
  const amount = parseFloat((formData.get('amount') as string) || '0');
  const dueDate = formData.get('dueDate') as string;
  const clientId = formData.get('clientId') as string;
  const category = (formData.get('category') as string) || 'PROJETO';
  const status = (formData.get('status') as string) || 'PENDENTE';

  if (!description || !amount || !dueDate) return { error: 'Preencha a descrição, valor e vencimento.' };

  const { error } = await supabase.from('revenues').insert({
    description,
    amount,
    due_date: dueDate,
    client_id: clientId || null,
    category,
    status,
    paid_at: status === 'PAGO' ? new Date().toISOString() : null,
  });

  if (error) return { error: 'Falha ao lançar receita.' };

  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createExpense(formData: FormData) {
  const supabase = getDbClient();

  const description = formData.get('description') as string;
  const amount = parseFloat((formData.get('amount') as string) || '0');
  const dueDate = formData.get('dueDate') as string;
  const category = (formData.get('category') as string) || 'OUTROS';
  const status = (formData.get('status') as string) || 'PENDENTE';

  if (!description || !amount || !dueDate) return { error: 'Preencha a descrição, valor e vencimento.' };

  const { error } = await supabase.from('expenses').insert({
    description,
    amount,
    due_date: dueDate,
    category,
    status,
    paid_at: status === 'PAGO' ? new Date().toISOString() : null,
  });

  if (error) return { error: 'Falha ao lançar despesa.' };

  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleFinancialStatus(type: 'revenue' | 'expense', id: string, status: string) {
  const supabase = getDbClient();
  const paidAt = status === 'PAGO' ? new Date().toISOString() : null;

  const error = type === 'revenue'
    ? (await supabase.from('revenues').update({ status, paid_at: paidAt }).eq('id', id)).error
    : (await supabase.from('expenses').update({ status, paid_at: paidAt }).eq('id', id)).error;

  if (error) return { error: 'Falha ao atualizar lançamento.' };

  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}
