'use client';

import { useState, useTransition } from 'react';
import { createRevenue, createExpense, updateFinancialEntry, deleteFinancialEntry } from '@/actions/os';
import { Plus, X, TrendingUp, TrendingDown, Pencil } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
}

interface NewFinancialModalProps {
  type: 'revenue' | 'expense';
  clients?: ClientItem[];
  entry?: any;
}

export function NewFinancialModal({ type, clients = [], entry }: NewFinancialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isRevenue = type === 'revenue';
  const editing = Boolean(entry?.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = editing
        ? await updateFinancialEntry(type, formData)
        : isRevenue
          ? await createRevenue(formData)
          : await createExpense(formData);
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
        className={
          editing
            ? 'cnpja-button-secondary text-[11px] inline-flex items-center gap-1'
            : isRevenue
              ? 'cnpja-button-primary text-xs'
              : 'cnpja-button-secondary text-xs'
        }
      >
        {editing ? <Pencil className="w-3 h-3" /> : <Plus className="w-4 h-4" />}
        {editing ? 'Editar' : isRevenue ? 'Nova Receita' : 'Nova Despesa'}
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
                  {editing
                    ? isRevenue
                      ? 'Editar Receita'
                      : 'Editar Despesa'
                    : isRevenue
                      ? 'Lançar Nova Receita (Entrada)'
                      : 'Lançar Nova Despesa (Saída)'}
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
              {editing && <input type="hidden" name="id" value={entry.id} />}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  defaultValue={entry?.description || ''}
                  placeholder={isRevenue ? 'Ex: Pagamento 1ª Parcela Projeto Web' : 'Ex: Assinatura Servidor Vercel / OpenAI'}
                  className="cnpja-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Valor (R$) *
                  </label>
                  <input type="number" step="0.01" name="amount" required defaultValue={entry?.amount ?? ''} placeholder="1500.00" className="cnpja-input text-xs font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Vencimento *
                  </label>
                  <input type="date" name="dueDate" required defaultValue={entry?.due_date || ''} className="cnpja-input text-xs" />
                </div>
              </div>

              {isRevenue ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Cliente</label>
                    <select name="clientId" defaultValue={entry?.client_id || ''} className="cnpja-input text-xs">
                      <option value="">Nenhum / Não vinculado</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Categoria</label>
                    <select name="category" defaultValue={entry?.category || 'SETUP'} className="cnpja-input text-xs">
                      <option value="SETUP">Setup / Implantação</option>
                      <option value="MENSALIDADE">Mensalidade (Continuidade)</option>
                      <option value="PROJETO_ADICIONAL">Projeto Adicional / Evolução</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Status</label>
                    <select name="status" defaultValue={entry?.status || 'PENDENTE'} className="cnpja-input text-xs">
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago / Recebido</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Categoria</label>
                    <select name="category" defaultValue={entry?.category || 'HOSPEDAGEM'} className="cnpja-input text-xs">
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
                    <select name="status" defaultValue={entry?.status || 'PENDENTE'} className="cnpja-input text-xs">
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-3 border-t border-slate-800">
                {editing ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!entry?.id || !window.confirm('Excluir este lançamento?')) return;
                      startTransition(async () => {
                        const res = await deleteFinancialEntry(type, entry.id);
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
                    {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar Lançamento'}
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
