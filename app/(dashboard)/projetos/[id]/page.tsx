import { notFound } from 'next/navigation';
import { getClients, getProject, getTeamMembers } from '@/actions/os';
import { ProjectWorkspace } from '@/components/os/ProjectWorkspace';

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { novo?: string };
}) {
  const [project, clients, members] = await Promise.all([
    getProject(params.id),
    getClients(),
    getTeamMembers(),
  ]);

  if (!project) notFound();

  return (
    <ProjectWorkspace
      project={project}
      clients={clients.map((c: any) => ({ id: c.id, name: c.name, company: c.company }))}
      members={members}
      justCreated={searchParams.novo === '1'}
    />
  );
}
