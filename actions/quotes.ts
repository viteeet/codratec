'use server';

import { revalidatePath } from 'next/cache';
import { getDbClient } from '@/lib/server/actions-helpers';
import type { QuoteRow } from '@/types/rows';

async function attachQuoteProjects(quotes: any[]) {
  if (!quotes.length) return quotes;
  const supabase = getDbClient();
  const ids = quotes.map((q) => q.id).filter(Boolean);
  if (ids.length === 0) return quotes;
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status, quote_id')
    .in('quote_id', ids)
    .order('created_at', { ascending: true });
  const byQuote = new Map<string, any>();
  for (const project of projects || []) {
    if (project.quote_id && !byQuote.has(project.quote_id)) byQuote.set(project.quote_id, project);
  }
  return quotes.map((quote) => ({ ...quote, project: byQuote.get(quote.id) || null }));
}

export async function getQuote(id: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(name, company, document, email, phone, city, state), items:quote_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) console.error('Erro ao buscar orçamento:', error);
  if (!data) return null;
  const [withProject] = await attachQuoteProjects([data]);
  return withProject as QuoteRow;
}

export async function getQuotes() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(name, company, document, email, phone)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar orçamentos:', error);
  return (await attachQuoteProjects(data || [])) as QuoteRow[];
}

export async function createQuote(formData: FormData) {
  const supabase = getDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'gerente')) {
    return { error: 'Permissão negada: Apenas o Administrador ou Gerente Comercial podem emitir orçamentos oficiais.' };
  }

  const { clientId, title, items, payload } = quotePayloadFromForm(formData);
  if (!title || !clientId) return { error: 'Preencha o cliente e o título do orçamento.' };

  const { data: quoteData, error } = await supabase.from('quotes').insert({
    ...payload,
    created_by: user.id,
  }).select().single();

  if (error || !quoteData) return { error: 'Falha ao salvar orçamento no banco de dados.' };

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('quote_items').insert(
      items.map((item) => ({ ...item, quote_id: quoteData.id })),
    );
    if (itemsError) return { error: 'Proposta salva, mas falhou ao gravar as linhas de investimento.' };
  }

  let projectId: string | undefined;
  if (payload.status === 'APROVADO') {
    const conv = await autoConvertQuoteToProjectAndRevenue({ ...quoteData, items });
    if (conv.error) return { error: `Proposta salva, mas o projeto não foi criado: ${conv.error}`, id: quoteData.id as string };
    projectId = conv.projectId;
  }

  revalidateQuoteOutcome(quoteData, projectId);
  return { success: true, id: quoteData.id as string, projectId };
}

function parseQuoteItemsJson(raw: string) {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row: any, index: number) => {
        const title = String(row.title || '').trim();
        const unit = Number(row.unit_price || 0);
        const qty = Math.max(1, parseInt(String(row.quantity || 1), 10) || 1);
        if (!title) return null;
        return {
          title,
          description: String(row.description || '').trim() || null,
          unit_price: Number.isFinite(unit) ? unit : 0,
          quantity: qty,
          total_price: (Number.isFinite(unit) ? unit : 0) * qty,
          position: index,
        };
      })
      .filter(Boolean) as {
      title: string;
      description: string | null;
      unit_price: number;
      quantity: number;
      total_price: number;
      position: number;
    }[];
  } catch {
    return [];
  }
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
  const setupRaw = String(formData.get('setupAmount') || '').trim();
  const monthlyRaw = String(formData.get('monthlyAmount') || '').trim();
  const setupAmount = setupRaw === '' ? 0 : parseFloat(setupRaw);
  const monthlyAmount = monthlyRaw === '' ? 0 : parseFloat(monthlyRaw);
  const contractDurationMonths = parseInt((formData.get('contractDurationMonths') as string) || '0', 10) || 0;
  const items = parseQuoteItemsJson(String(formData.get('itemsJson') || ''));
  const itemsTotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const totalAmount =
    items.length > 0
      ? itemsTotal
      : setupAmount + monthlyAmount * (contractDurationMonths || 1);
  const validUntil = String(formData.get('validUntil') || '').trim();
  const deliveryDeadlineDays = parseInt((formData.get('deliveryDeadlineDays') as string) || '30', 10);
  const status = String(formData.get('status') || 'RASCUNHO');

  return {
    clientId,
    title,
    items,
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
      payment_terms: String(formData.get('paymentTerms') || '').trim() || null,
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

  const { clientId, title, items, payload } = quotePayloadFromForm(formData);
  if (!title || !clientId) return { error: 'Preencha o cliente e o título do orçamento.' };

  const { data: quoteData, error } = await auth.supabase
    .from('quotes')
    .update(payload)
    .eq('id', quoteId)
    .select()
    .single();

  if (error || !quoteData) return { error: 'Falha ao atualizar a proposta.' };

  await auth.supabase.from('quote_items').delete().eq('quote_id', quoteId);
  if (items.length > 0) {
    const { error: itemsError } = await auth.supabase.from('quote_items').insert(
      items.map((item) => ({ ...item, quote_id: quoteId })),
    );
    if (itemsError) return { error: 'Proposta salva, mas falhou ao gravar as linhas de investimento.' };
  }

  let projectId: string | undefined;
  if (payload.status === 'APROVADO' && quoteData) {
    const conv = await autoConvertQuoteToProjectAndRevenue({ ...quoteData, items });
    if (conv.error) {
      return { error: `Proposta salva, mas o projeto não foi criado: ${conv.error}` };
    }
    projectId = conv.projectId;
  }

  revalidateQuoteOutcome(quoteData, projectId);
  return { success: true, projectId };
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

function revalidateQuoteOutcome(
  quote: { id?: string | null; client_id?: string | null },
  projectId?: string | null,
) {
  revalidatePath('/orcamentos');
  revalidatePath('/projetos');
  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  revalidatePath('/clientes');
  revalidatePath('/demandas');
  if (quote.id) {
    revalidatePath(`/orcamentos/${quote.id}`);
    revalidatePath(`/orcamentos/${quote.id}/editar`);
  }
  if (quote.client_id) revalidatePath(`/clientes/${quote.client_id}`);
  if (projectId) revalidatePath(`/projetos/${projectId}`);
}

const QUOTE_STATUSES = [
  'RASCUNHO',
  'ENVIADO',
  'VISUALIZADO',
  'NEGOCIACAO',
  'APROVADO',
  'RECUSADO',
  'EXPIRADO',
] as const;

export async function updateQuoteStatus(quoteId: string, status: string) {
  const auth = await assertCanManageQuotes();
  if (auth.error) return { error: auth.error };
  if (!quoteId) return { error: 'Proposta inválida.' };
  if (!QUOTE_STATUSES.includes(status as (typeof QUOTE_STATUSES)[number])) {
    return { error: 'Status inválido.' };
  }

  const { data: current, error: loadError } = await auth.supabase
    .from('quotes')
    .select('*, items:quote_items(*)')
    .eq('id', quoteId)
    .maybeSingle();

  if (loadError || !current) return { error: 'Proposta não encontrada.' };

  let projectId: string | undefined;
  if (status === 'APROVADO') {
    const conv = await autoConvertQuoteToProjectAndRevenue(current);
    if (conv.error) return { error: conv.error };
    projectId = conv.projectId;
  }

  const { data: quoteData, error } = await auth.supabase
    .from('quotes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', quoteId)
    .select('*')
    .single();

  if (error || !quoteData) return { error: 'Falha ao atualizar orçamento.' };

  revalidateQuoteOutcome(quoteData, projectId);
  return { success: true, projectId };
}

function quoteNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function addIsoDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function quoteInvestment(quote: any) {
  const items = Array.isArray(quote.items) ? quote.items : [];
  const itemsTotal = items.reduce((sum: number, item: any) => {
    const line = quoteNumber(item.total_price, quoteNumber(item.unit_price) * Math.max(1, quoteNumber(item.quantity, 1)));
    return sum + line;
  }, 0);
  const setup = quoteNumber(quote.setup_amount);
  const monthly = quoteNumber(quote.monthly_amount);
  const months = Math.max(0, Math.trunc(quoteNumber(quote.contract_duration_months)));
  const totalFromQuote = quoteNumber(quote.total_amount);
  const total =
    itemsTotal > 0
      ? itemsTotal
      : totalFromQuote > 0
        ? totalFromQuote
        : setup + monthly * (months || (monthly > 0 ? 1 : 0));
  return { setup, monthly, months, total };
}

async function findProjectByQuoteId(supabase: any, quoteId: string) {
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: true })
    .limit(1);
  return data?.[0] || null;
}

async function autoConvertQuoteToProjectAndRevenue(quote: any): Promise<{
  projectId?: string;
  created?: boolean;
  error?: string;
}> {
  if (!quote?.id || !quote.client_id) {
    return { error: 'Proposta sem cliente. Não dá para criar o projeto.' };
  }

  const supabase = getDbClient();
  const existing = await findProjectByQuoteId(supabase, quote.id);
  if (existing) return { projectId: existing.id, created: false };

  const inv = quoteInvestment(quote);
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = addIsoDays(today, 30);
  const deliveryDays = quoteNumber(quote.delivery_deadline_days);
  const description =
    String(quote.general_scope || quote.proposed_solution || quote.description || '').trim() || null;

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      client_id: quote.client_id,
      quote_id: quote.id,
      name: quote.title,
      description,
      value: inv.total,
      setup_amount: inv.setup,
      monthly_amount: inv.monthly,
      contract_start_date: today,
      contract_duration_months: inv.months || null,
      next_billing_date: inv.monthly > 0 ? nextMonth : null,
      contract_status: 'ATIVO',
      status: 'PLANEJAMENTO',
      start_date: today,
      estimated_completion_date: deliveryDays > 0 ? addIsoDays(today, deliveryDays) : null,
    })
    .select('id, name')
    .single();

  if (error || !project) {
    if (error?.code === '23505') {
      const again = await findProjectByQuoteId(supabase, quote.id);
      if (again) return { projectId: again.id, created: false };
    }
    console.error('Falha ao criar projeto a partir da proposta', error);
    return { error: error?.message || 'Falha ao criar o projeto a partir da proposta.' };
  }

  const revenues: Record<string, unknown>[] = [];
  if (inv.monthly > 0) {
    if (inv.setup > 0) {
      revenues.push({
        client_id: quote.client_id,
        project_id: project.id,
        description: `Setup / Implantação: ${quote.title}`,
        amount: inv.setup,
        due_date: today,
        status: 'PENDENTE',
        category: 'SETUP',
      });
    }
    revenues.push({
      client_id: quote.client_id,
      project_id: project.id,
      description: `Mensalidade (1/${inv.months || 1}): ${quote.title}`,
      amount: inv.monthly,
      due_date: nextMonth,
      status: 'PENDENTE',
      category: 'MENSALIDADE',
    });
  } else if (inv.total > 0) {
    revenues.push({
      client_id: quote.client_id,
      project_id: project.id,
      description: `Projeto: ${quote.title}`,
      amount: inv.total,
      due_date: today,
      status: 'PENDENTE',
      category: 'PROJETO',
    });
  }

  if (revenues.length > 0) {
    const { error: revenueError } = await supabase.from('revenues').insert(revenues);
    if (revenueError) console.error('Projeto criado, mas a receita não foi lançada', revenueError);
  }

  const scopeLines = String(quote.general_scope || '')
    .split(/\n+/)
    .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 20);
  const kickoffTasks =
    scopeLines.length > 0
      ? scopeLines.map((title: string) => ({
          project_id: project.id,
          title,
          description: 'Item do escopo da proposta aprovada.',
          status: 'BACKLOG',
          priority: 'NORMAL',
          created_by: quote.created_by || null,
        }))
      : [
          {
            project_id: project.id,
            title: 'Kickoff e detalhamento (SOW)',
            description: 'Validar os entregáveis da proposta e quebrar o trabalho em demandas.',
            status: 'TODO',
            priority: 'ALTA',
            created_by: quote.created_by || null,
          },
        ];
  const { error: taskError } = await supabase.from('tasks').insert(kickoffTasks);
  if (taskError) console.error('Projeto criado, mas as demandas iniciais não foram geradas', taskError);

  return { projectId: project.id, created: true };
}
