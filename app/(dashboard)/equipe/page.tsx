import { getTeamMembers, getAuthProfile } from '@/actions/os';
import { OsPage, OsPageHeader } from '@/components/os/OsPage';
import { TeamMembersPanel } from '@/components/os/TeamMembersPanel';
import { redirect } from 'next/navigation';

export default async function EquipePage() {
  const profile = await getAuthProfile();
  if (profile && profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const members = await getTeamMembers();

  return (
    <OsPage>
      <OsPageHeader
        title="Equipe"
        description="Edite nome, papel e status dos colaboradores."
      />
      <TeamMembersPanel members={members} />
    </OsPage>
  );
}
