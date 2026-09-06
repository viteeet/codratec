'use client';

import { useState, useTransition } from 'react';
import { createClientAccount } from '@/actions/os';
import { Plus, X, Building2 } from 'lucide-react';

export function NewClientModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createClientAccount(formData);
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
        <Plus className="w-4 h-4" /> Novo Cliente
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Cadastrar Novo Cliente</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Nome do Contato / Cliente *
                  </label>
                  <input type="text" name="name" required placeholder="Ex: Roberto Silva" className="cnpja-input text-xs" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Empresa / Razão Social
                  </label>
                  <input type="text" name="company" placeholder="Ex: Clínica Odonto Ltda" className="cnpja-input text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    CNPJ / CPF
                  </label>
                  <input type="text" name="document" placeholder="00.000.000/0001-00" className="cnpja-input text-xs font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Email
                  </label>
                  <input type="email" name="email" placeholder="financeiro@empresa.com" className="cnpja-input text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input type="text" name="phone" placeholder="(11) 99999-9999" className="cnpja-input text-xs" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Cidade</label>
                    <input type="text" name="city" placeholder="São Paulo" className="cnpja-input text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">UF</label>
                    <input type="text" name="state" placeholder="SP" className="cnpja-input text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                  {isPending ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
