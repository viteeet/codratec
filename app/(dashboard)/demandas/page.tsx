import { getTasks, getProjects } from '@/actions/os';
import { NewTaskModal } from '@/components/os/NewTaskModal';
import { Search, Filter, CheckSquare } from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: 'border-slate-600' },
  { id: 'TODO', title: 'A Fazer', color: 'border-blue-500' },
  { id: 'IN_PROGRESS', title: 'Em Andamento', color: 'border-amber-500' },
  { id: 'BLOCKED', title: 'Bloqueado', color: 'border-rose-500' },
  { id: 'REVIEW', title: 'Revisão', color: 'border-purple-500' },
  { id: 'DONE', title: 'Concluído', color: 'border-emerald-500' },
];

export default async function DemandasPage() {
  const tasks = await getTasks();
  const projects = await getProjects();

  return (
    <div className="w-full h-full min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Demandas & Tarefas de Dev</h1>
          <p className="text-xs text-slate-400 mt-1">
            Quadro Kanban para divisão e acompanhamento de tarefas por projeto.
          </p>
        </div>

        <NewTaskModal projects={projects} />
      </div>

      <div className="cnpja-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título de demanda..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>

        <button className="cnpja-button-secondary text-xs py-1.5">
          <Filter className="w-3.5 h-3.5" /> Filtrar por Projeto
        </button>
      </div>

      {/* Quadro Kanban de Demandas com dados reais */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="cnpja-card p-3 space-y-3 bg-slate-900/60 min-w-[78vw] sm:min-w-[240px] md:min-w-0 snap-center shrink-0 md:shrink"
            >
              <div className={`flex items-center justify-between border-l-2 ${col.color} pl-2 py-0.5`}>
                <h3 className="text-xs font-bold text-slate-200">{col.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              {colTasks.length > 0 ? (
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <div key={task.id} className="bg-slate-950 p-2.5 rounded-md border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-white text-xs">{task.title}</p>
                      {task.project?.name && (
                        <span className="text-[10px] text-blue-400 block font-medium">{task.project.name}</span>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-900 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          task.priority === 'URGENTE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          task.priority === 'ALTA' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500'
                        }`}>
                          {task.priority}
                        </span>
                        {task.due_date && <span className="text-slate-500 font-mono">{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 min-h-[140px] flex items-center justify-center border border-dashed border-slate-800 rounded-md p-3">
                  <p className="text-xs text-slate-500 text-center">Sem tarefas</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
