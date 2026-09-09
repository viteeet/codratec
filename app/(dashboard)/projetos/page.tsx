import { Suspense } from 'react';
import { getProjects, getClients, getTeamMembers } from '@/actions/os';
import { ProjectsView } from '@/components/os/ProjectsView';

export default async function ProjetosPage() {
  const [projects, clients, members] = await Promise.all([getProjects(), getClients(), getTeamMembers()]);

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando projetos...</p>}>
      <ProjectsView projects={projects} clients={clients} members={members} />
    </Suspense>
  );
}
