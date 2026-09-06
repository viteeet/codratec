'use client';

import { useState, useTransition } from 'react';
import { createProject } from '@/actions/os';
import { Plus, X, FolderKanban } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  company?: string | null;
}

interface NewProjectModalProps {
  clients: ClientItem[];
}

export function NewProjectModal({ clients }: NewProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createProject(formData);
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
        <Plus className="w-4 h-4" /> Novo Projeto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-md">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Criar Novo Projeto</h2>
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
                  Cliente *
                </label>
                <select name="clientId" required className="cnpja-input text-xs">
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
                <input type="text" name="name" required placeholder="Ex: Plataforma Web Codratec OS" className="cnpja-input text-xs" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Descrição</label>
                <textarea name="description" rows={2} placeholder="Escopo das entregas..." className="cnpja-input text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Valor Contratado (R$)
                  </label>
                  <input type="number" step="0.01" name="value" placeholder="10000.00" className="cnpja-input text-xs font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Previsão de Entrega
                  </label>
                  <input type="date" name="estimatedCompletionDate" className="cnpja-input text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                  {isPending ? 'Salvando...' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
