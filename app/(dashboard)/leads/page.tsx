import { getLeads, getTeamMembers, canSendBrevoEmail, getEmailTemplates } from '@/actions/os';
import { LeadsView } from '@/components/os/LeadsView';

export default async function LeadsPage() {
  const [leads, members, canSendEmail, emailTemplates] = await Promise.all([
    getLeads(),
    getTeamMembers(),
    canSendBrevoEmail(),
    getEmailTemplates(),
  ]);

  return (
    <LeadsView
      initialLeads={leads}
      members={members}
      canSendEmail={canSendEmail}
      emailTemplates={emailTemplates}
    />
  );
}
