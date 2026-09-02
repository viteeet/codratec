import { getLeads, getTeamMembers } from '@/actions/os';
import { LeadsView } from '@/components/os/LeadsView';

export default async function LeadsPage() {
  const leads = await getLeads();
  const members = await getTeamMembers();

  return <LeadsView initialLeads={leads} members={members} />;
}
