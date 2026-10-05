'use server';

import { revalidatePath } from 'next/cache';
import { formId, getDbClient } from '@/lib/server/actions-helpers';
import type { ClientRow } from '@/types/rows';

function clientPayloadFromForm(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const whatsapp = String(formData.get('whatsapp') || phone).trim();
  return {
    name,
    company: String(formData.get('company') || '').trim() || null,
    document: String(formData.get('document') || '').trim() || null,
    email: String(formData.get('email') || '').trim() || null,
    phone: phone || null,
    whatsapp: whatsapp || null,
    address: String(formData.get('address') || '').trim() || null,
    city: String(formData.get('city') || '').trim() || null,
    state: String(formData.get('state') || '').trim().toUpperCase() || null,
    notes: String(formData.get('notes') || '').trim() || null,
  };
}

function revalidateClientPaths(clientId?: string | null) {
  revalidatePath('/clientes');
  revalidatePath('/orcamentos');
  revalidatePath('/projetos');
  revalidatePath('/dashboard');
  if (clientId) revalidatePath(`/clientes/${clientId}`);
}

export async function getClients() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*, quotes(id, status, total_amount, title), projects(id, status, name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    const fallback = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    return (fallback.data || []) as ClientRow[];
  }
  return (data || []) as ClientRow[];
}

export async function getClientAccount(id: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('clients')
    .select(
      '*, quotes(id, quote_number, title, status, total_amount, created_at), projects(id, name, status, value, monthly_amount, next_billing_date, quote_id), revenues(id, description, amount, status, due_date, paid_at)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar conta do cliente:', error);
    return null;
  }
  return (data || null) as ClientRow | null;
}

export async function createClientAccount(formData: FormData) {
  const supabase = getDbClient();
  const payload = clientPayloadFromForm(formData);

  if (!payload.name) return { error: 'O nome do cliente é obrigatório.' };

  const { data, error } = await supabase.from('clients').insert(payload).select('id').single();

  if (error || !data) return { error: error?.message || 'Falha ao salvar cliente.' };

  revalidateClientPaths(data.id);
  return { success: true, id: data.id as string };
}

export async function updateClientAccount(formData: FormData) {
  const supabase = getDbClient();
  const clientId = formId(formData, 'clientId', 'id');
  const payload = clientPayloadFromForm(formData);

  if (!clientId) return { error: 'Cliente inválido.' };
  if (!payload.name) return { error: 'O nome do cliente é obrigatório.' };

  const { error } = await supabase
    .from('clients')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', clientId);

  if (error) return { error: error.message || 'Falha ao atualizar o cliente.' };

  revalidateClientPaths(clientId);
  return { success: true, id: clientId };
}

export async function deleteClientAccount(clientId: string) {
  const supabase = getDbClient();
  if (!clientId) return { error: 'Cliente inválido.' };

  const [{ count: quoteCount }, { count: projectCount }] = await Promise.all([
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
  ]);

  if ((quoteCount || 0) > 0 || (projectCount || 0) > 0) {
    return {
      error: 'Não é possível excluir: este cliente tem proposta ou projeto. Arquive o histórico antes.',
    };
  }

  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) return { error: 'Falha ao excluir o cliente.' };

  revalidateClientPaths();
  return { success: true };
}
