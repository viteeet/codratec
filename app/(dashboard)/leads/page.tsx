import { getLeads, getTeamMembers, canSendBrevoEmail } from '@/actions/os';
import { LeadsView } from '@/components/os/LeadsView';

export default async function LeadsPage() {
  const [leads, members, canSendEmail] = await Promise.all([
    getLeads(),
    getTeamMembers(),
    canSendBrevoEmail(),
  ]);

  return (
    <LeadsView initialLeads={leads} members={members} canSendEmail={canSendEmail} />
  );
}
