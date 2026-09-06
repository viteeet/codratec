import { getAuthProfile, getEmailTemplates, canSendBrevoEmail } from '@/actions/os';
import { SettingsPageClient } from '@/components/os/settings/SettingsPageClient';
import { redirect } from 'next/navigation';

export default async function ConfiguracoesPage() {
  const profile = await getAuthProfile();
  if (profile && profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const [templates, canSendEmail] = await Promise.all([
    getEmailTemplates(),
    canSendBrevoEmail(),
  ]);

  return <SettingsPageClient templates={templates} canSendEmail={canSendEmail} />;
}
