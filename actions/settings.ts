'use server';

import { revalidatePath } from 'next/cache';
import { assertIsAdmin, getDbClient, loadAuthProfile } from '@/lib/server/actions-helpers';

export type CompanySettingsRow = {
  company_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  site_url: string;
  site_label: string;
};

export async function getCompanySettings(): Promise<CompanySettingsRow> {
  const { DEFAULT_COMPANY_SETTINGS } = await import('@/lib/email-templates');
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('company_settings')
    .select('company_name, email, phone, whatsapp, site_url, site_label')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) return { ...DEFAULT_COMPANY_SETTINGS };

  return {
    company_name: data.company_name || DEFAULT_COMPANY_SETTINGS.company_name,
    email: data.email || DEFAULT_COMPANY_SETTINGS.email,
    phone: data.phone || DEFAULT_COMPANY_SETTINGS.phone,
    whatsapp: data.whatsapp || data.phone || DEFAULT_COMPANY_SETTINGS.whatsapp,
    site_url: data.site_url || DEFAULT_COMPANY_SETTINGS.site_url,
    site_label: data.site_label || DEFAULT_COMPANY_SETTINGS.site_label,
  };
}

export async function saveCompanySettings(input: CompanySettingsRow): Promise<
  { success: true; settings: CompanySettingsRow } | { error: string }
> {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };

  const company_name = input.company_name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const whatsapp = input.whatsapp.trim() || phone;
  const site_url = input.site_url.trim();
  const site_label = input.site_label.trim() || site_url.replace(/^https?:\/\//, '');

  if (!company_name || !email || !site_url) {
    return { error: 'Nome, e-mail e site são obrigatórios.' };
  }

  const profile = await loadAuthProfile();
  const supabase = getDbClient();
  const payload = {
    id: 1,
    company_name,
    email,
    phone,
    whatsapp,
    site_url,
    site_label,
    updated_at: new Date().toISOString(),
    updated_by: profile?.id || null,
  };

  const { error } = await supabase.from('company_settings').upsert(payload, { onConflict: 'id' });
  if (error) {
    return { error: error.message || 'Falha ao salvar contato. Rode a migration 16 no Supabase.' };
  }

  revalidatePath('/configuracoes');
  revalidatePath('/leads');
  return { success: true, settings: { company_name, email, phone, whatsapp, site_url, site_label } };
}
