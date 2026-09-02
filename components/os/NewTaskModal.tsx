'use client';

import { useState, useTransition } from 'react';
import { createTask } from '@/actions/os';
import { Plus, X, CheckSquare } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
}

interface NewTaskModalProps {
  projects: ProjectItem[];
}

export function NewTaskModal({ projects }: NewTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createTask(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="cnpja-button-primary text-xs">
        <Plus className="w-4 h-4" /> Criar Demanda
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Criar Nova Demanda / Tarefa</h2>
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
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Projeto Vinculado *
                </label>
                <select name="projectId" required className="cnpja-input text-xs">
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
                <input type="text" name="title" required placeholder="Ex: Criar autenticação Supabase Auth" className="cnpja-input text-xs" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Descrição</label>
                <textarea name="description" rows={3} placeholder="Requisitos técnicos e aceitação..." className="cnpja-input text-xs" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Prioridade</label>
                  <select name="priority" defaultValue="NORMAL" className="cnpja-input text-xs">
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status Inicial</label>
                  <select name="status" defaultValue="BACKLOG" className="cnpja-input text-xs">
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">A Fazer</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Prazo</label>
                  <input type="date" name="dueDate" className="cnpja-input text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                  {isPending ? 'Salvando...' : 'Salvar Demanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
