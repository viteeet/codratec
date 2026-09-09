import { Suspense } from 'react';
import { getTasks, getProjects } from '@/actions/os';
import { TasksView } from '@/components/os/TasksView';

export default async function DemandasPage() {
  const tasks = await getTasks();
  const projects = await getProjects();

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando demandas...</p>}>
      <TasksView tasks={tasks} projects={projects} />
    </Suspense>
  );
}
