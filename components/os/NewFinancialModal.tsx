'use client';

import { useState, useTransition } from 'react';
import { createRevenue, createExpense } from '@/actions/os';
import { Plus, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
}

interface NewFinancialModalProps {
  type: 'revenue' | 'expense';
  clients?: ClientItem[];
}

export function NewFinancialModal({ type, clients = [] }: NewFinancialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isRevenue = type === 'revenue';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = isRevenue ? await createRevenue(formData) : await createExpense(formData);
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
        onClick={() => setIsOpen(true)}
        className={isRevenue ? 'cnpja-button-primary text-xs' : 'cnpja-button-secondary text-xs'}
      >
        <Plus className="w-4 h-4" /> {isRevenue ? 'Nova Receita' : 'Nova Despesa'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-md ${isRevenue ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {isRevenue ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <h2 className="text-base font-bold text-white">
                  {isRevenue ? 'Lançar Nova Receita (Entrada)' : 'Lançar Nova Despesa (Saída)'}
                </h2>
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
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder={isRevenue ? 'Ex: Pagamento 1ª Parcela Projeto Web' : 'Ex: Assinatura Servidor Vercel / OpenAI'}
                  className="cnpja-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Valor (R$) *
                  </label>
                  <input type="number" step="0.01" name="amount" required placeholder="1500.00" className="cnpja-input text-xs font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Vencimento *
                  </label>
                  <input type="date" name="dueDate" required className="cnpja-input text-xs" />
                </div>
              </div>

              {isRevenue ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Cliente</label>
                    <select name="clientId" className="cnpja-input text-xs">
                      <option value="">Nenhum / Não vinculado</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Categoria</label>
                    <select name="category" defaultValue="SETUP" className="cnpja-input text-xs">
                      <option value="SETUP">Setup / Implantação</option>
                      <option value="MENSALIDADE">Mensalidade (Continuidade)</option>
                      <option value="PROJETO_ADICIONAL">Projeto Adicional / Evolução</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status</label>
                    <select name="status" defaultValue="PENDENTE" className="cnpja-input text-xs">
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago / Recebido</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Categoria</label>
                    <select name="category" defaultValue="HOSPEDAGEM" className="cnpja-input text-xs">
                      <option value="HOSPEDAGEM">Hospedagem & Servidores</option>
                      <option value="IA_API">APIs & Inteligência Artificial</option>
                      <option value="DOMINIO">Domínios & SSL</option>
                      <option value="SERVICOS">Softwares & Ferramentas</option>
                      <option value="COMISSAO">Comissão de Vendedores</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status</label>
                    <select name="status" defaultValue="PENDENTE" className="cnpja-input text-xs">
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                  {isPending ? 'Salvando...' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
