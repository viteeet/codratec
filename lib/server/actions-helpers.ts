// Funções internas das server actions. Sem 'use server' de propósito: nada aqui vira endpoint.
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/database';

// O tipo Database em types/database.ts não cobre todas as tabelas (lead_handoffs, lead_emails,
// email_templates...), então o cliente segue sem tipo aqui. As leituras principais devolvem os
// tipos de types/rows.ts. Para tipar tudo: `supabase gen types typescript` e trocar este cast.
export function getDbClient() {
  return createClient() as any;
}

/** O PostgREST do Supabase devolve no máximo 1.000 linhas por consulta; busca em lotes até acabar. */
export const FETCH_BATCH = 1000;

export async function fetchAllRows<T = any>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<{ data: T[]; error: any }> {
  const rows: T[] = [];
  for (let from = 0; ; from += FETCH_BATCH) {
    const { data, error } = await query(from, from + FETCH_BATCH - 1);
    if (error) return { data: rows, error };
    rows.push(...(data || []));
    if (!data || data.length < FETCH_BATCH) return { data: rows, error: null };
  }
}

export function parseDecimal(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/[^\d.-]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function parseIsoDate(value: unknown): string | null {
  if (value == null || value === '') return null;
  const text = String(value).trim();
  if (!text) return null;
  const iso = text.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return null;
}

export function formId(formData: FormData, ...keys: string[]) {
  for (const key of keys) {
    const value = String(formData.get(key) || '').trim();
    if (value) return value;
  }
  return '';
}

export function normalizeLeadDocument(value: unknown): string | null {
  if (value == null || value === '') return null;
  const digits = String(value).replace(/\D/g, '');
  return digits || null;
}

export async function loadAuthProfile() {
  const supabase = getDbClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return profile;
}

export async function assertIsAdmin(): Promise<string | null> {
  const profile = await loadAuthProfile();
  if (!profile || profile.role !== 'admin') {
    return 'Apenas administradores podem alterar configurações.';
  }
  return null;
}

export function canHandleHandoffs(role?: UserRole | null) {
  return !role || role === 'admin' || role === 'gerente';
}
