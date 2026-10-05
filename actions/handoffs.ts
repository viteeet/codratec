'use server';

import { revalidatePath } from 'next/cache';
import { canHandleHandoffs, getDbClient, loadAuthProfile } from '@/lib/server/actions-helpers';

export type LeadHandoffInput = {
  conversation_summary: string;
  client_needs: string;
  system_type?: string | null;
  current_process?: string | null;
  budget_range?: string | null;
  urgency?: string | null;
  decision_maker?: string | null;
  temperature?: string | null;
};

const HANDOFF_STATUSES = ['ENVIADO', 'EM_ANALISE', 'PRECISA_INFO', 'ORCAMENTO_CRIADO', 'CANCELADO'];

const LEAD_STATUSES_AFTER_PROPOSAL = ['PROPOSTA', 'NEGOCIACAO', 'GANHO'];

function revalidateHandoffPaths() {
  revalidatePath('/leads');
  revalidatePath('/orcamentos');
  revalidatePath('/dashboard');
}

export async function createLeadHandoff(leadId: string, input: LeadHandoffInput) {
  const profile = await loadAuthProfile();
  if (!profile) return { error: 'Não autenticado.' };
  if (!leadId) return { error: 'Lead inválido.' };

  const conversation = String(input.conversation_summary || '').trim();
  const needs = String(input.client_needs || '').trim();
  if (!conversation || !needs) {
    return { error: 'Conte como foi a conversa e o que o cliente precisa.' };
  }
  const optional = (value?: string | null) => String(value || '').trim() || null;

  const supabase = getDbClient();
  const { data: lead } = await supabase.from('leads').select('id, status').eq('id', leadId).single();
  if (!lead) return { error: 'Lead não encontrado.' };

  const { data: handoff, error } = await supabase
    .from('lead_handoffs')
    .insert({
      lead_id: leadId,
      requested_by: profile.id,
      conversation_summary: conversation,
      client_needs: needs,
      system_type: optional(input.system_type),
      current_process: optional(input.current_process),
      budget_range: optional(input.budget_range),
      urgency: optional(input.urgency),
      decision_maker: optional(input.decision_maker),
      temperature: optional(input.temperature),
    })
    .select('id')
    .single();

  if (error || !handoff) {
    if (error?.code === '23505') return { error: 'Este lead já tem um briefing aberto na fila de propostas.' };
    return { error: error?.message || 'Falha ao enviar o briefing.' };
  }

  if (!LEAD_STATUSES_AFTER_PROPOSAL.includes(lead.status)) {
    await supabase
      .from('leads')
      .update({ status: 'PROPOSTA', updated_at: new Date().toISOString() })
      .eq('id', leadId);
  }

  await supabase.from('lead_activities').insert({
    lead_id: leadId,
    user_id: profile.id,
    type: 'BRIEFING',
    description: `Enviado para proposta.\n\nConversa: ${conversation}\n\nNecessidade: ${needs}`,
  });

  revalidateHandoffPaths();
  return { success: true, id: handoff.id as string };
}

export async function getOpenLeadHandoff(leadId: string) {
  if (!leadId) return null;
  const supabase = getDbClient();
  const { data } = await supabase
    .from('lead_handoffs')
    .select('id, status, created_at')
    .eq('lead_id', leadId)
    .in('status', ['ENVIADO', 'EM_ANALISE', 'PRECISA_INFO'])
    .maybeSingle();
  return data as { id: string; status: string; created_at: string } | null;
}

export async function getHandoffQueue() {
  const profile = await loadAuthProfile();
  if (!profile || !canHandleHandoffs(profile.role)) return [];
  const supabase = getDbClient();
  const { data } = await supabase
    .from('lead_handoffs')
    .select(
      '*, lead:leads(id, name, company, trade_name, phone, whatsapp, email, city, state, notes, call_notes), requester:profiles!lead_handoffs_requested_by_fkey(full_name, email)',
    )
    .in('status', ['ENVIADO', 'EM_ANALISE', 'PRECISA_INFO'])
    .order('created_at', { ascending: true });
  return (data || []) as any[];
}

export async function updateLeadHandoffStatus(handoffId: string, status: string) {
  const profile = await loadAuthProfile();
  if (!profile) return { error: 'Não autenticado.' };
  if (!handoffId || !HANDOFF_STATUSES.includes(status)) return { error: 'Status inválido.' };

  const supabase = getDbClient();
  const { data: handoff } = await supabase
    .from('lead_handoffs')
    .select('id, requested_by, seen_at')
    .eq('id', handoffId)
    .single();
  if (!handoff) return { error: 'Briefing não encontrado.' };

  const isAuthorCancelling = status === 'CANCELADO' && handoff.requested_by === profile.id;
  if (!canHandleHandoffs(profile.role) && !isAuthorCancelling) {
    return { error: 'Permissão negada.' };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status, updated_at: now };
  if (status === 'EM_ANALISE') {
    patch.assigned_to = profile.id;
    if (!handoff.seen_at) patch.seen_at = now;
  }

  const { error } = await supabase.from('lead_handoffs').update(patch).eq('id', handoffId);
  if (error) return { error: error.message || 'Falha ao atualizar o briefing.' };

  revalidateHandoffPaths();
  return { success: true };
}
