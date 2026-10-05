'use server';

import { revalidatePath } from 'next/cache';
import { fetchAllRows, getDbClient, loadAuthProfile, normalizeLeadDocument, parseDecimal, parseIsoDate } from '@/lib/server/actions-helpers';
import type { LeadRow } from '@/types/rows';

export async function getLeads() {
  const supabase = getDbClient();
  const { data, error } = await fetchAllRows((from, to) =>
    supabase
      .from('leads')
      .select('*, assigned:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to)
  );

  if (error) console.error('Erro ao buscar leads:', error);
  return data as LeadRow[];
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
    phone: phone || whatsapp,
    whatsapp: whatsapp || phone,
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
  share_capital?: number | string | null;
  annual_revenue?: number | string | null;
  opened_at?: string | null;
  niche?: string | null;
  category?: string | null;
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
    'niche',
    'category',
  ];

  for (const key of fields) {
    if (key in payload) {
      const value = payload[key];
      data[key] = typeof value === 'string' ? value.trim() || null : value ?? null;
    }
  }

  if ('share_capital' in payload) data.share_capital = parseDecimal(payload.share_capital);
  if ('annual_revenue' in payload) data.annual_revenue = parseDecimal(payload.annual_revenue);
  if ('opened_at' in payload) data.opened_at = parseIsoDate(payload.opened_at);

  if (payload.name !== undefined && !String(payload.name || '').trim()) {
    return { error: 'O nome do lead é obrigatório.' };
  }

  let { data: updated, error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', leadId)
    .select('*, assigned:profiles(full_name, email)')
    .maybeSingle();

  if (error && /share_capital|annual_revenue|opened_at/.test(error.message || '')) {
    delete data.share_capital;
    delete data.annual_revenue;
    delete data.opened_at;
    const retry = await supabase
      .from('leads')
      .update(data)
      .eq('id', leadId)
      .select('*, assigned:profiles(full_name, email)')
      .maybeSingle();
    updated = retry.data;
    error = retry.error;
  }

  if (error) return { error: error.message || 'Falha ao salvar alterações do lead.' };

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

  const validStatuses = [
    'NOVO',
    'CONTATO',
    'QUALIFICADO',
    'CALL_AGENDADA',
    'PROPOSTA',
    'NEGOCIACAO',
    'GANHO',
    'NAO_INTERESSADO',
    'SEM_RESPOSTA',
    'FUTURO',
  ];

  const normalizedLeads = rawItems.map((item) => {
    const document = normalizeLeadDocument(
      item.documento || item.document || item.cnpj || item.cpf || null,
    );
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
    const status = validStatuses.includes(rawStatus) ? rawStatus : 'NOVO';

    const assignedTo = item.responsavel_id || item.assigned_to || defaultAssignedTo || null;
    const notes = item.observacoes || item.notes || null;
    const shareCapital = parseDecimal(item.capital_social ?? item.share_capital);
    const annualRevenue = parseDecimal(
      item.faturamento ?? item.annual_revenue ?? item.revenue,
    );
    const openedAt = parseIsoDate(
      item.data_abertura ?? item.data_inicio_atividade ?? item.opened_at,
    );

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
      share_capital: shareCapital,
      annual_revenue: annualRevenue,
      opened_at: openedAt,
      category,
      niche,
      source,
      status,
      assigned_to: assignedTo,
      notes,
    };
  });

  // Match por CNPJ/CPF (só dígitos) para atualizar em vez de duplicar.
  const { data: existingRows, error: existingError } = await fetchAllRows((from, to) =>
    supabase.from('leads').select('id, document, assigned_to, status').order('id').range(from, to)
  );

  if (existingError) {
    return { error: `Falha ao consultar leads existentes: ${existingError.message}` };
  }

  const byDocument = new Map<string, { id: string; assigned_to: string | null; status: string }>();
  for (const row of existingRows || []) {
    const key = normalizeLeadDocument(row.document);
    if (key && !byDocument.has(key)) {
      byDocument.set(key, {
        id: row.id,
        assigned_to: row.assigned_to ?? null,
        status: row.status,
      });
    }
  }

  const toInsert: typeof normalizedLeads = [];
  const toUpdate: Array<{ id: string; patch: Record<string, unknown> }> = [];

  for (const lead of normalizedLeads) {
    const existing = lead.document ? byDocument.get(lead.document) : null;
    if (!existing) {
      toInsert.push(lead);
      continue;
    }

    toUpdate.push({
      id: existing.id,
      patch: {
        document: lead.document,
        person_type: lead.person_type,
        company: lead.company,
        trade_name: lead.trade_name,
        name: lead.name,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        city: lead.city,
        state: lead.state,
        main_activity: lead.main_activity,
        cnae_code: lead.cnae_code,
        share_capital: lead.share_capital,
        annual_revenue: lead.annual_revenue,
        opened_at: lead.opened_at,
        category: lead.category,
        niche: lead.niche,
        source: lead.source,
        // Não reseta pipeline: status e dono atuais permanecem.
        // Só preenche vendedor se o lead ainda estiver na fila pública.
        ...(existing.assigned_to == null && lead.assigned_to
          ? { assigned_to: lead.assigned_to }
          : {}),
        ...(lead.notes ? { notes: lead.notes } : {}),
        updated_at: new Date().toISOString(),
      },
    });
  }

  let created = 0;
  let updated = 0;

  if (toInsert.length > 0) {
    const { data, error } = await supabase.from('leads').insert(toInsert).select('id');
    if (error) {
      console.error('Erro ao importar batch de leads:', error);
      return { error: `Falha ao importar leads: ${error.message}` };
    }
    created = data?.length || 0;
  }

  for (const item of toUpdate) {
    const { error } = await supabase.from('leads').update(item.patch).eq('id', item.id);
    if (error) {
      console.error('Erro ao atualizar lead na reimportação:', error);
      return {
        error: `Falha ao atualizar lead existente: ${error.message} (criados: ${created}, atualizados: ${updated})`,
      };
    }
    updated += 1;
  }

  revalidatePath('/leads');
  revalidatePath('/vendedores');
  revalidatePath('/dashboard');
  return {
    success: true,
    count: created + updated,
    created,
    updated,
  };
}

export async function getLeadActivities(leadId: string) {
  const supabase = getDbClient();
  const { data } = await supabase
    .from('lead_activities')
    .select('*, user:profiles(full_name, email)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  return (data || []) as any[];
}

export async function createLeadActivity(leadId: string, type: string, description: string) {
  const profile = await loadAuthProfile();
  if (!profile) return { error: 'Não autenticado.' };
  const text = description.trim();
  if (!leadId || !text) return { error: 'Descreva a atividade.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('lead_activities').insert({
    lead_id: leadId,
    user_id: profile.id,
    type,
    description: text,
  });
  if (error) return { error: error.message || 'Falha ao registrar atividade.' };
  revalidatePath('/leads');
  return { success: true };
}

export async function updateLeadActivity(id: string, description: string) {
  if (!id) return { error: 'Atividade inválida.' };
  const supabase = getDbClient();
  const { error } = await supabase
    .from('lead_activities')
    .update({ description: description.trim() })
    .eq('id', id);
  if (error) return { error: error.message || 'Falha ao atualizar atividade.' };
  return { success: true };
}

export async function deleteLeadActivity(id: string) {
  if (!id) return { error: 'Atividade inválida.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('lead_activities').delete().eq('id', id);
  if (error) return { error: error.message || 'Falha ao excluir atividade.' };
  return { success: true };
}

export async function getLeadFollowups(leadId: string) {
  const supabase = getDbClient();
  const { data } = await supabase
    .from('lead_followups')
    .select('*')
    .eq('lead_id', leadId)
    .order('scheduled_at', { ascending: true });
  return (data || []) as any[];
}

export async function createLeadFollowup(leadId: string, scheduledAt: string, notes: string) {
  const profile = await loadAuthProfile();
  if (!profile) return { error: 'Não autenticado.' };
  if (!leadId || !scheduledAt) return { error: 'Informe a data do follow-up.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('lead_followups').insert({
    lead_id: leadId,
    user_id: profile.id,
    scheduled_at: scheduledAt,
    notes: notes.trim() || null,
    status: 'PENDENTE',
  });
  if (error) return { error: error.message || 'Falha ao criar follow-up.' };
  revalidatePath('/leads');
  return { success: true };
}

export async function updateLeadFollowup(id: string, input: { scheduled_at?: string; notes?: string; status?: string }) {
  if (!id) return { error: 'Follow-up inválido.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('lead_followups').update(input).eq('id', id);
  if (error) return { error: error.message || 'Falha ao atualizar follow-up.' };
  return { success: true };
}

export async function deleteLeadFollowup(id: string) {
  if (!id) return { error: 'Follow-up inválido.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('lead_followups').delete().eq('id', id);
  if (error) return { error: error.message || 'Falha ao excluir follow-up.' };
  return { success: true };
}
