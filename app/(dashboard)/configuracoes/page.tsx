import {
  getAuthProfile,
  getEmailTemplates,
  canSendBrevoEmail,
  getCompanySettings,
  getTeamMembers,
} from '@/actions/os';
import { SettingsPageClient } from '@/components/os/settings/SettingsPageClient';
import { redirect } from 'next/navigation';

export default async function ConfiguracoesPage() {
  const profile = await getAuthProfile();
  if (profile && profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const [templates, canSendEmail, company, members] = await Promise.all([
    getEmailTemplates(),
    canSendBrevoEmail(),
    getCompanySettings(),
    getTeamMembers(),
  ]);

  return (
    <SettingsPageClient
      templates={templates}
      canSendEmail={canSendEmail}
      company={company}
      members={members}
    />
  );
}
