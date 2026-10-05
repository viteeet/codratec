import { getAuthProfile } from '@/actions/auth';
import { getEmailTemplates, canSendBrevoEmail } from '@/actions/email';
import { getCompanySettings } from '@/actions/settings';
import { getTeamMembers } from '@/actions/team';
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
