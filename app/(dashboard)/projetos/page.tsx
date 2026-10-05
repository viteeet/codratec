import { Suspense } from 'react';
import { getClients } from '@/actions/clients';
import { getProjects } from '@/actions/projects';
import { getTeamMembers } from '@/actions/team';
import { ProjectsView } from '@/components/os/ProjectsView';

export default async function ProjetosPage() {
  const [projects, clients, members] = await Promise.all([getProjects(), getClients(), getTeamMembers()]);

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando projetos...</p>}>
      <ProjectsView projects={projects} clients={clients} members={members} />
    </Suspense>
  );
}
