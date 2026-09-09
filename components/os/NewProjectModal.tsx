'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, updateProject, deleteProject } from '@/actions/os';
import { Plus, X, FolderKanban, Pencil } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  company?: string | null;
}

interface MemberItem {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

interface NewProjectModalProps {
  clients: ClientItem[];
  members?: MemberItem[];
  defaultClientId?: string;
  compact?: boolean;
  project?: any;
}

export function NewProjectModal({
  clients,
  members = [],
  defaultClientId,
  compact = false,
  project,
}: NewProjectModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = Boolean(project?.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = editing ? await updateProject(formData) : await createProject(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!project?.id || !window.confirm(`Excluir o projeto "${project.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (res?.error) setError(res.error);
      else {
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
              ? 'text-xs font-semibold bg-cyan-600 text-white px-2.5 py-1 rounded hover:bg-cyan-500'
              : 'cnpja-button-primary text-xs'
        }
      >
        {editing ? <Pencil className="w-3 h-3" /> : <Plus className="w-4 h-4" />}
        {editing ? 'Editar' : compact ? 'Novo projeto' : 'Novo Projeto'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-none p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-md">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">{editing ? 'Editar Projeto' : 'Criar Novo Projeto'}</h2>
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
              {editing && <input type="hidden" name="id" value={project.id} />}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Cliente *
                </label>
                <select
                  name="clientId"
                  required
                  defaultValue={project?.client_id || defaultClientId || ''}
                  className="cnpja-input text-xs"
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Nome do Projeto *
                </label>
                <input type="text" name="name" required defaultValue={project?.name || ''} placeholder="Ex: Plataforma Web Codratec OS" className="cnpja-input text-xs" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Descrição</label>
                <textarea name="description" rows={2} defaultValue={project?.description || ''} placeholder="Escopo das entregas..." className="cnpja-input text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Valor Contratado (R$)
                  </label>
                  <input type="number" step="0.01" name="value" defaultValue={project?.value ?? ''} placeholder="10000.00" className="cnpja-input text-xs font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Previsão de Entrega
                  </label>
                  <input
                    type="date"
                    name="estimatedCompletionDate"
                    defaultValue={project?.estimated_completion_date || ''}
                    className="cnpja-input text-xs"
                  />
                </div>
              </div>

              {members.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Equipe do projeto</label>
                  <div className="max-h-32 overflow-y-auto border border-slate-800 p-2 space-y-1">
                    {members.map((m) => {
                      const selected = (project?.members || []).some((row: any) => row.user_id === m.id);
                      return (
                        <label key={m.id} className="flex items-center gap-2 text-xs text-slate-200">
                          <input type="checkbox" name="memberIds" value={m.id} defaultChecked={selected} />
                          {m.full_name || m.email}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status</label>
                <select name="status" defaultValue={project?.status || 'PLANEJAMENTO'} className="cnpja-input text-xs">
                  <option value="PLANEJAMENTO">Planejamento</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="AGUARDANDO_CLIENTE">Aguardando cliente</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-between gap-2 pt-3 border-t border-slate-800">
                {editing ? (
                  <button type="button" onClick={handleDelete} disabled={isPending} className="text-xs text-rose-300 border border-rose-800 px-2 py-1">
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
                    {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar Projeto'}
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
