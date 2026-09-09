import { Suspense } from 'react';
import { getProjects, getClients } from '@/actions/os';
import { ProjectsView } from '@/components/os/ProjectsView';

export default async function ProjetosPage() {
  const projects = await getProjects();
  const clients = await getClients();

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando projetos...</p>}>
      <ProjectsView projects={projects} clients={clients} />
    </Suspense>
  );
}
