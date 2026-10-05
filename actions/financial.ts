'use server';

import { revalidatePath } from 'next/cache';
import { getDbClient } from '@/lib/server/actions-helpers';
import type { ExpenseRow, RevenueRow } from '@/types/rows';

export async function getFinancialData() {
  const supabase = getDbClient();

  const [{ data: revenues }, { data: expenses }] = await Promise.all([
    supabase.from('revenues').select('*, client:clients(name, company)').order('due_date', { ascending: false }),
    supabase.from('expenses').select('*').order('due_date', { ascending: false }),
  ]);

  return {
    revenues: (revenues || []) as RevenueRow[],
    expenses: (expenses || []) as ExpenseRow[],
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

export async function updateFinancialEntry(
  type: 'revenue' | 'expense',
  formData: FormData,
) {
  const id = String(formData.get('id') || '');
  if (!id) return { error: 'Lançamento inválido.' };

  const description = String(formData.get('description') || '').trim();
  const amount = parseFloat(String(formData.get('amount') || '0'));
  const dueDate = String(formData.get('dueDate') || '');
  const status = String(formData.get('status') || 'PENDENTE');
  const category = String(formData.get('category') || 'OUTROS');

  if (!description || !amount || !dueDate) return { error: 'Preencha descrição, valor e vencimento.' };

  const payload: Record<string, unknown> = {
    description,
    amount,
    due_date: dueDate,
    status,
    category,
    paid_at: status === 'PAGO' ? new Date().toISOString() : null,
  };
  if (type === 'revenue') payload.client_id = (formData.get('clientId') as string) || null;

  const supabase = getDbClient();
  const table = type === 'revenue' ? 'revenues' : 'expenses';
  const { error } = await supabase.from(table).update(payload).eq('id', id);
  if (error) return { error: error.message || 'Falha ao atualizar lançamento.' };
  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteFinancialEntry(type: 'revenue' | 'expense', id: string) {
  if (!id) return { error: 'Lançamento inválido.' };
  const supabase = getDbClient();
  const table = type === 'revenue' ? 'revenues' : 'expenses';
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return { error: error.message || 'Falha ao excluir lançamento.' };
  revalidatePath('/financeiro');
  revalidatePath('/dashboard');
  return { success: true };
}
