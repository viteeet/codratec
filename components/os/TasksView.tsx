'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewTaskModal } from '@/components/os/NewTaskModal';
import { OsPage, OsPageCount, OsPageHeader, OsPageToolbar } from '@/components/os/OsPage';
import { updateTaskStatus } from '@/actions/os';
import { Search } from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: 'border-slate-600' },
  { id: 'TODO', title: 'A Fazer', color: 'border-blue-500' },
  { id: 'IN_PROGRESS', title: 'Em Andamento', color: 'border-amber-500' },
  { id: 'BLOCKED', title: 'Bloqueado', color: 'border-rose-500' },
  { id: 'REVIEW', title: 'Revisão', color: 'border-purple-500' },
  { id: 'DONE', title: 'Concluído', color: 'border-emerald-500' },
];

export function TasksView({
  tasks,
  projects,
  members = [],
}: {
  tasks: any[];
  projects: any[];
  members?: any[];
}) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') || '');
  const [projectId, setProjectId] = useState('');
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<string | null>(null);
  const suppressClickRef = useRef(false);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tasks
      .map((task) => ({ ...task, status: statusById[task.id] || task.status }))
      .filter((task) => {
        if (projectId && task.project_id !== projectId && task.project?.id !== projectId) return false;
        if (!term) return true;
        return [task.title, task.description, task.priority, task.status, task.project?.name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term);
      });
  }, [tasks, q, projectId, statusById]);

  const hasFilters = Boolean(q.trim() || projectId);

  const moveTask = (taskId: string, status: string) => {
    const current = statusById[taskId] || tasks.find((t) => t.id === taskId)?.status;
    if (!taskId || current === status) return;
    setStatusById((prev) => ({ ...prev, [taskId]: status }));
    startTransition(async () => {
      const res = await updateTaskStatus(taskId, status);
      if (res && 'error' in res) {
        setStatusById((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    });
  };

  const onCardDragStart = (e: React.DragEvent, taskId: string) => {
    setDragTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onCardDragEnd = () => {
    setDragTaskId(null);
    setDropStatus(null);
  };

  const onColumnDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropStatus !== status) setDropStatus(status);
  };

  const onColumnDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || dragTaskId;
    setDropStatus(null);
    setDragTaskId(null);
    if (!taskId) return;
    suppressClickRef.current = true;
    moveTask(taskId, status);
  };

  return (
    <OsPage>
      <OsPageHeader
        title="Demandas"
        description="Arraste o card para mudar o status. Editar abre o formulário completo."
      >
        <NewTaskModal projects={projects} members={members} />
      </OsPageHeader>

      <OsPageToolbar className="cnpja-card p-3">
        <div className="os-page-toolbar__field os-page-toolbar__field--search">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Buscar
          </label>
          <Search className="w-4 h-4 text-slate-500 absolute left-3 bottom-2.5 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título de demanda..."
            className="cnpja-input pl-9 text-xs w-full"
          />
        </div>
        <div className="os-page-toolbar__field os-page-toolbar__field--select">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Projeto
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="cnpja-input text-xs w-full"
          >
            <option value="">Todos os projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setProjectId('');
            }}
            className="cnpja-button-secondary text-xs min-h-11"
          >
            Limpar
          </button>
        ) : null}
      </OsPageToolbar>

      <OsPageCount>
        {visible.length} de {tasks.length} demanda{tasks.length === 1 ? '' : 's'}
      </OsPageCount>

      <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory min-w-0">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = visible.filter((t) => t.status === col.id);
          const isDropTarget = Boolean(dragTaskId) && dropStatus === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => onColumnDragOver(e, col.id)}
              onDragLeave={() => {
                if (dropStatus === col.id) setDropStatus(null);
              }}
              onDrop={(e) => onColumnDrop(e, col.id)}
              className={`cnpja-card p-3 space-y-3 bg-slate-900/60 min-w-[78vw] sm:min-w-[240px] md:min-w-0 snap-center shrink-0 md:shrink ${
                isDropTarget ? 'border-blue-500/70' : ''
              }`}
            >
              <div className={`flex items-center justify-between border-l-2 ${col.color} pl-2 py-0.5`}>
                <h3 className="text-xs font-bold text-slate-200">{col.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              {colTasks.length > 0 ? (
                <div className="space-y-2 min-h-[140px]">
                  {colTasks.map((task) => {
                    const dragging = dragTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onCardDragStart(e, task.id)}
                        onDragEnd={onCardDragEnd}
                        className={`bg-slate-950 p-2.5 rounded-none border border-slate-800 space-y-1.5 cursor-grab active:cursor-grabbing ${
                          dragging ? 'opacity-50' : ''
                        }`}
                        title="Arraste para mudar o status"
                      >
                        <p className="font-semibold text-white text-xs">{task.title}</p>
                        {task.project?.name && (
                          <span className="text-[10px] text-blue-400 block font-medium">{task.project.name}</span>
                        )}
                        <div
                          className="pt-1"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            if (suppressClickRef.current) {
                              suppressClickRef.current = false;
                              e.preventDefault();
                            }
                          }}
                        >
                          <NewTaskModal projects={projects} members={members} task={task} />
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-900 text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              task.priority === 'URGENTE'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : task.priority === 'ALTA'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'text-slate-500'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-slate-500 font-mono">
                              {new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 min-h-[140px] flex items-center justify-center border border-dashed border-slate-800 rounded-none p-3">
                  <p className="text-xs text-slate-500 text-center">
                    {dragTaskId ? 'Solte aqui' : 'Sem tarefas'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </OsPage>
  );
}
