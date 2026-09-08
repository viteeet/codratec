'use client';

import { useState, useTransition } from 'react';
import { createQuote, createClientAccount } from '@/actions/os';
import { Plus, X, FileText, Building2, DollarSign, Calendar } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  company?: string | null;
}

interface NewQuoteModalProps {
  clients: ClientItem[];
}

export function NewQuoteModal({ clients }: NewQuoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createQuote(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  const handleCreateQuickClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createClientAccount(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setShowNewClientForm(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cnpja-button-primary text-xs"
      >
        <Plus className="w-4 h-4" /> Criar Orçamento
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Novo Orçamento Commercial</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md">
                {error}
              </div>
            )}

            {/* Form de rápido cadastro de Cliente se não houver clientes */}
            {showNewClientForm ? (
              <form onSubmit={handleCreateQuickClient} className="space-y-3 bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> Cadastrar Cliente Rápidamente
                </h3>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nome do Cliente *</label>
                  <input type="text" name="name" required placeholder="Ex: Clínica Bella Vita" className="cnpja-input text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Empresa / Razão Social</label>
                  <input type="text" name="company" placeholder="Ex: Bella Vita Ltda" className="cnpja-input text-xs" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowNewClientForm(false)} className="cnpja-button-secondary text-xs">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                    Salvar Cliente
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateQuote} className="space-y-4">
                {/* Seleção do Cliente */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                      Cliente *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewClientForm(true)}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      + Novo Cliente
                    </button>
                  </div>
                  {clients.length > 0 ? (
                    <select name="clientId" required className="cnpja-input text-xs">
                      <option value="">Selecione um cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md flex items-center justify-between">
                      <span>Nenhum cliente cadastrado.</span>
                      <button
                        type="button"
                        onClick={() => setShowNewClientForm(true)}
                        className="font-bold underline text-amber-200 ml-2"
                      >
                        Cadastrar Agora
                      </button>
                    </div>
                  )}
                </div>

                {/* Título do Orçamento */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Título do Orçamento / Projeto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Ex: Desenvolvimento de Sistema Web SaaS"
                    className="cnpja-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Solicitação
                  </label>
                  <textarea
                    name="solicitation"
                    rows={3}
                    placeholder="O que o cliente pediu..."
                    className="cnpja-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Solução proposta
                  </label>
                  <textarea
                    name="proposedSolution"
                    rows={3}
                    placeholder="Como a Codratec resolve..."
                    className="cnpja-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Escopo geral
                  </label>
                  <textarea
                    name="generalScope"
                    rows={4}
                    placeholder="O que entra nesta proposta. O detalhe do projeto vem após o aceite."
                    className="cnpja-input text-xs"
                  />
                </div>

                {/* Setup, Mensalidade e Fidelidade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Setup Inicial (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="setupAmount"
                      required
                      defaultValue="2500.00"
                      className="cnpja-input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Plano Mensal (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="monthlyAmount"
                      required
                      defaultValue="600.00"
                      className="cnpja-input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Fidelidade (Meses)
                    </label>
                    <input
                      type="number"
                      name="contractDurationMonths"
                      defaultValue={12}
                      className="cnpja-input text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Prazo Entrega e Validade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Prazo Entrega (Dias)
                    </label>
                    <input
                      type="number"
                      name="deliveryDeadlineDays"
                      defaultValue={30}
                      className="cnpja-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Válido Até
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      className="cnpja-input text-xs"
                    />
                  </div>
                </div>

                {/* Status Inicial */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Status Inicial
                  </label>
                  <select name="status" defaultValue="RASCUNHO" className="cnpja-input text-xs">
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="APROVADO">Aprovado</option>
                  </select>
                </div>

                {/* Botões do Formulário */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="cnpja-button-secondary text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || clients.length === 0}
                    className="cnpja-button-primary text-xs"
                  >
                    {isPending ? 'Salvando...' : 'Emitir Orçamento'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
