'use client';

import { useState, useTransition } from 'react';
import { createTask, updateTask, deleteTask } from '@/actions/os';
import { TaskCommentsPanel } from '@/components/os/TaskCommentsPanel';
import { Plus, X, CheckSquare, Pencil } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
}

interface MemberItem {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

interface NewTaskModalProps {
  projects: ProjectItem[];
  members?: MemberItem[];
  task?: any;
}

export function NewTaskModal({ projects, members = [], task }: NewTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = Boolean(task?.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = editing ? await updateTask(formData) : await createTask(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={editing ? 'cnpja-button-secondary text-[11px] inline-flex items-center gap-1' : 'cnpja-button-primary text-xs'}
      >
        {editing ? <Pencil className="w-3 h-3" /> : <Plus className="w-4 h-4" />}
        {editing ? 'Editar' : 'Criar Demanda'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-none p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">{editing ? 'Editar Demanda' : 'Criar Nova Demanda / Tarefa'}</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {editing && <input type="hidden" name="id" value={task.id} />}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Projeto Vinculado *
                </label>
                <select name="projectId" required defaultValue={task?.project_id || ''} className="cnpja-input text-xs">
                  <option value="">Selecione um projeto...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Título da Demanda *
                </label>
                <input type="text" name="title" required defaultValue={task?.title || ''} placeholder="Ex: Criar autenticação Supabase Auth" className="cnpja-input text-xs" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Descrição</label>
                <textarea name="description" rows={3} defaultValue={task?.description || ''} placeholder="Requisitos técnicos e aceitação..." className="cnpja-input text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Prioridade</label>
                  <select name="priority" defaultValue={task?.priority || 'NORMAL'} className="cnpja-input text-xs">
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status Inicial</label>
                  <select name="status" defaultValue={task?.status || 'BACKLOG'} className="cnpja-input text-xs">
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">A Fazer</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="REVIEW">Revisão</option>
                    <option value="DONE">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Prazo</label>
                  <input type="date" name="dueDate" defaultValue={task?.due_date || ''} className="cnpja-input text-xs" />
                </div>
              </div>

              {members.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Responsável</label>
                  <select name="assignedTo" defaultValue={task?.assigned_to || ''} className="cnpja-input text-xs">
                    <option value="">Sem responsável</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name || m.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editing && task?.id ? <TaskCommentsPanel taskId={task.id} /> : null}

              <div className="flex justify-between gap-2 pt-3 border-t border-slate-800">
                {editing ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!task?.id || !window.confirm(`Excluir a demanda "${task.title}"?`)) return;
                      startTransition(async () => {
                        const res = await deleteTask(task.id);
                        if (res?.error) setError(res.error);
                        else setIsOpen(false);
                      });
                    }}
                    className="text-xs text-rose-300 border border-rose-800 px-2 py-1"
                  >
                    Excluir
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                    {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar Demanda'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
