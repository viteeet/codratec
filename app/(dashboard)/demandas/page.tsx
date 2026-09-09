import { Suspense } from 'react';
import { getTasks, getProjects, getTeamMembers } from '@/actions/os';
import { TasksView } from '@/components/os/TasksView';

export default async function DemandasPage() {
  const [tasks, projects, members] = await Promise.all([getTasks(), getProjects(), getTeamMembers()]);

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando demandas...</p>}>
      <TasksView tasks={tasks} projects={projects} members={members} />
    </Suspense>
  );
}
