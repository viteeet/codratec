'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTask, updateTask, deleteTask } from '@/actions/projects';
import { TaskCommentsPanel } from '@/components/os/TaskCommentsPanel';
import { Plus, CheckSquare, Pencil } from 'lucide-react';
import { useConfirm, useToast } from '@/components/ui/Feedback';
import { FormError, Modal } from '@/components/ui/Modal';

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
  defaultProjectId?: string;
  compact?: boolean;
}

export function NewTaskModal({
  projects,
  members = [],
  task,
  defaultProjectId,
  compact = false,
}: NewTaskModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

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
        toast.success(editing ? 'Demanda atualizada.' : 'Demanda criada.');
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          editing
            ? 'cnpja-button-secondary text-[11px] inline-flex items-center gap-1'
            : compact
              ? 'inline-flex items-center justify-center gap-1 text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-500'
              : 'cnpja-button-primary text-xs'
        }
      >
        {editing ? <Pencil className="w-3 h-3" /> : <Plus className="w-4 h-4" />}
        {editing ? 'Editar' : 'Criar Demanda'}
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? 'Editar Demanda' : 'Criar Nova Demanda / Tarefa'}
        icon={<CheckSquare className="w-4 h-4" />}
      >
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={task.id} />}
          {defaultProjectId && !editing ? (
            <input type="hidden" name="projectId" value={defaultProjectId} />
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Projeto Vinculado *
              </label>
              <select
                name="projectId"
                required
                defaultValue={task?.project_id || defaultProjectId || ''}
                className="cnpja-input text-xs"
              >
                <option value="">Selecione um projeto...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

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
                onClick={async () => {
                  if (!task?.id || !(await confirm({ title: `Excluir a demanda "${task.title}"?` }))) return;
                  startTransition(async () => {
                    const res = await deleteTask(task.id);
                    if (res?.error) setError(res.error);
                    else {
                      toast.success('Demanda excluída.');
                      setIsOpen(false);
                    }
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
      </Modal>
    </>
  );
}
