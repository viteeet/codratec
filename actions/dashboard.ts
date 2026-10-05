'use server';

import { fetchAllRows, getDbClient } from '@/lib/server/actions-helpers';

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
    fetchAllRows((from, to) =>
      supabase
        .from('leads')
        .select('id, status, created_at, scheduled_call_at, last_email_status')
        .order('id')
        .range(from, to)
    ),
    supabase.from('quotes').select('id, status, created_at'),
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

  const leadRows = (leads as any[]) || [];
  const quoteRows = (quotes as any[]) || [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const activeLeadsCount = leadRows.filter((l: any) => l.status !== 'PERDIDO' && l.status !== 'GANHO' && l.status !== 'NAO_INTERESSADO').length;
  const sentQuotesCount = quoteRows.filter((q: any) => q.status === 'ENVIADO' || q.status === 'APROVADO').length;
  const activeProjectsCount = ((projects as any[]) || []).filter((p: any) => p.status === 'EM_ANDAMENTO' || p.status === 'PLANEJAMENTO').length;
  const openTasksCount = ((tasks as any[]) || []).filter((t: any) => t.status !== 'DONE').length;
  const wonLeadsCount = leadRows.filter((l: any) => l.status === 'GANHO').length;
  const scheduledCallsCount = leadRows.filter((l: any) => l.scheduled_call_at && new Date(l.scheduled_call_at).getTime() >= Date.now()).length;
  const newLeadsThisMonth = leadRows.filter((l: any) => l.created_at && new Date(l.created_at).getTime() >= monthStart).length;
  const emailsReadCount = leadRows.filter((l: any) => l.last_email_status === 'LIDO').length;

  const leadFunnel = [
    { id: 'NOVO', label: 'Novos' },
    { id: 'CONTATO', label: 'Contato' },
    { id: 'QUALIFICADO', label: 'Qualificados' },
    { id: 'CALL_AGENDADA', label: 'Call' },
    { id: 'PROPOSTA', label: 'Proposta' },
    { id: 'NEGOCIACAO', label: 'Negociação' },
    { id: 'GANHO', label: 'Ganhos' },
  ].map((col) => ({
    ...col,
    count: leadRows.filter((l: any) => (l.status || 'NOVO') === col.id).length,
  }));

  return {
    totalRevenue,
    totalExpense,
    estimatedProfit,
    activeLeadsCount,
    sentQuotesCount,
    activeProjectsCount,
    openTasksCount,
    wonLeadsCount,
    scheduledCallsCount,
    newLeadsThisMonth,
    emailsReadCount,
    leadFunnel,
    recentProjects: ((projects as any[]) || []),
  };
}
