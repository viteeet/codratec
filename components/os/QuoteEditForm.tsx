'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteQuote, updateQuote } from '@/actions/os';

type ClientItem = { id: string; name: string; company?: string | null };

function toDateInput(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="quote-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function QuoteEditForm({
  quote,
  clients,
}: {
  quote: any;
  clients: ClientItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateQuote(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!window.confirm('Excluir esta proposta? Esta ação não pode ser desfeita.')) return;
    startTransition(async () => {
      const res = await deleteQuote(quote.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      window.location.href = '/orcamentos';
    });
  };

  return (
    <form onSubmit={onSubmit} className="quote-edit-form">
      <input type="hidden" name="quoteId" value={quote.id} />

      {error && <p className="quote-banner quote-banner--error">{error}</p>}
      {saved && <p className="quote-banner quote-banner--ok">Proposta salva.</p>}

      <section className="quote-card">
        <h2>Cliente e objeto</h2>
        <Field id="clientId" label="Cliente">
          <select id="clientId" name="clientId" required defaultValue={quote.client_id || ''} className="cnpja-input">
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field id="title" label="Título">
          <input id="title" name="title" required defaultValue={quote.title || ''} className="cnpja-input" />
        </Field>
        <Field id="status" label="Status">
          <select id="status" name="status" defaultValue={quote.status || 'RASCUNHO'} className="cnpja-input">
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADO">Enviado</option>
            <option value="APROVADO">Aprovado</option>
            <option value="RECUSADO">Recusado</option>
          </select>
        </Field>
      </section>

      <section className="quote-card">
        <h2>Problema, solução e escopo comercial</h2>
        <Field id="solicitation" label="Necessidade do cliente">
          <textarea id="solicitation" name="solicitation" rows={5} defaultValue={quote.solicitation || ''} className="cnpja-input" />
        </Field>
        <Field id="proposedSolution" label="Objetivo / resultado esperado">
          <textarea
            id="proposedSolution"
            name="proposedSolution"
            rows={5}
            defaultValue={quote.proposed_solution || ''}
            className="cnpja-input"
          />
        </Field>
        <Field id="generalScope" label="Escopo comercial (principais entregáveis, um por linha)">
          <textarea
            id="generalScope"
            name="generalScope"
            rows={6}
            defaultValue={quote.general_scope || ''}
            className="cnpja-input"
            placeholder="O cliente precisa entender o que está comprando. O SOW detalhado vem depois do aceite."
          />
        </Field>
      </section>

      <section className="quote-card">
        <h2>Investimento</h2>
        <div className="quote-field-grid quote-field-grid--3">
          <Field id="setupAmount" label="Setup (R$)">
            <input
              id="setupAmount"
              name="setupAmount"
              type="number"
              step="0.01"
              required
              defaultValue={quote.setup_amount ?? 2500}
              className="cnpja-input font-mono"
            />
          </Field>
          <Field id="monthlyAmount" label="Mensal (R$)">
            <input
              id="monthlyAmount"
              name="monthlyAmount"
              type="number"
              step="0.01"
              required
              defaultValue={quote.monthly_amount ?? 600}
              className="cnpja-input font-mono"
            />
          </Field>
          <Field id="contractDurationMonths" label="Fidelidade (meses)">
            <input
              id="contractDurationMonths"
              name="contractDurationMonths"
              type="number"
              defaultValue={quote.contract_duration_months ?? 12}
              className="cnpja-input font-mono"
            />
          </Field>
        </div>
      </section>

      <section className="quote-card">
        <h2>Condições de pagamento</h2>
        <Field id="paymentTerms" label="Forma de pagamento">
          <textarea
            id="paymentTerms"
            name="paymentTerms"
            rows={3}
            defaultValue={quote.payment_terms || ''}
            className="cnpja-input"
            placeholder="Ex.: 50% no aceite e 50% na entrega."
          />
        </Field>
      </section>

      <section className="quote-card">
        <h2>Prazo e validade</h2>
        <div className="quote-field-grid quote-field-grid--2">
          <Field id="deliveryDeadlineDays" label="Prazo de entrega (dias)">
            <input
              id="deliveryDeadlineDays"
              name="deliveryDeadlineDays"
              type="number"
              defaultValue={quote.delivery_deadline_days ?? 30}
              className="cnpja-input"
            />
          </Field>
          <Field id="validUntil" label="Válido até">
            <input
              id="validUntil"
              name="validUntil"
              type="date"
              defaultValue={toDateInput(quote.valid_until)}
              className="cnpja-input"
            />
          </Field>
        </div>
      </section>

      <footer className="quote-edit-actions">
        <button
          type="button"
          disabled={isPending}
          onClick={onDelete}
          className="quote-btn-danger"
        >
          Excluir
        </button>
        <button type="submit" disabled={isPending} className="cnpja-button-primary text-sm px-5 py-2">
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </footer>
    </form>
  );
}
