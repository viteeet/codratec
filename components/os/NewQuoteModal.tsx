'use client';

import { useState, useTransition } from 'react';
import { createQuote, createClientAccount, updateQuote, deleteQuote } from '@/actions/os';
import { Plus, X, FileText, Building2, Pencil, Trash2 } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  company?: string | null;
}

interface QuoteEditorProps {
  clients: ClientItem[];
  quote?: any;
}

function toDateInput(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function NewQuoteModal({ clients }: { clients: ClientItem[] }) {
  return <QuoteEditorModal clients={clients} />;
}

export function EditQuoteModal({ clients, quote }: QuoteEditorProps) {
  if (!quote?.id) return null;
  return <QuoteEditorModal clients={clients} quote={quote} />;
}

function QuoteEditorModal({ clients, quote }: QuoteEditorProps) {
  const isEdit = Boolean(quote?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmitQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = isEdit ? await updateQuote(formData) : await createQuote(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setIsOpen(false);
    });
  };

  const handleDelete = () => {
    if (!quote?.id) return;
    if (!window.confirm('Excluir esta proposta? Esta ação não pode ser desfeita.')) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteQuote(quote.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setIsOpen(false);
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
      {isEdit ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded font-medium flex items-center gap-1 transition"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
      ) : (
        <button onClick={() => setIsOpen(true)} className="cnpja-button-primary text-xs">
          <Plus className="w-4 h-4" /> Criar Orçamento
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {isEdit ? 'Editar proposta' : 'Novo Orçamento Comercial'}
                </h2>
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

            {showNewClientForm ? (
              <form onSubmit={handleCreateQuickClient} className="space-y-3 bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> Cadastrar Cliente Rapidamente
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
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                {isEdit && <input type="hidden" name="quoteId" value={quote.id} />}

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
                    <select
                      name="clientId"
                      required
                      defaultValue={quote?.client_id || ''}
                      className="cnpja-input text-xs"
                    >
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

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Título do Orçamento / Projeto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={quote?.title || ''}
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
                    defaultValue={quote?.solicitation || ''}
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
                    defaultValue={quote?.proposed_solution || ''}
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
                    defaultValue={quote?.general_scope || ''}
                    placeholder="Entregáveis comerciais (um por linha). O SOW detalhado vem após o aceite."
                    className="cnpja-input text-xs"
                  />
                </div>

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
                      defaultValue={quote?.setup_amount ?? '2500.00'}
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
                      defaultValue={quote?.monthly_amount ?? '600.00'}
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
                      defaultValue={quote?.contract_duration_months ?? 12}
                      className="cnpja-input text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Prazo Entrega (Dias)
                    </label>
                    <input
                      type="number"
                      name="deliveryDeadlineDays"
                      defaultValue={quote?.delivery_deadline_days ?? 30}
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
                      defaultValue={toDateInput(quote?.valid_until)}
                      className="cnpja-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Status
                  </label>
                  <select name="status" defaultValue={quote?.status || 'RASCUNHO'} className="cnpja-input text-xs">
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="RECUSADO">Recusado</option>
                  </select>
                </div>

                <div className="flex justify-between gap-2 pt-4 border-t border-slate-800">
                  {isEdit ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleDelete}
                      className="text-xs text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded inline-flex items-center gap-1 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
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
                      {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Emitir Orçamento'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
