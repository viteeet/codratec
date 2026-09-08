'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteQuote, updateQuote } from '@/actions/os';

type ClientItem = { id: string; name: string; company?: string | null };

type Line = {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
};

function toDateInput(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function money(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="quote-field">
      <label htmlFor={id}>
        {label}
        {required ? <em>obrigatório</em> : <span>opcional</span>}
      </label>
      {children}
      {hint ? <p className="quote-field__hint">{hint}</p> : null}
    </div>
  );
}

function linesFromQuote(quote: any): Line[] {
  const existing = Array.isArray(quote.items)
    ? [...quote.items].sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    : [];
  if (existing.length > 0) {
    return existing.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
    }));
  }
  const setup = Number(quote.setup_amount || 0);
  const monthly = Number(quote.monthly_amount || 0);
  const months = Number(quote.contract_duration_months || 0);
  const seeded: Line[] = [];
  if (setup > 0) {
    seeded.push({
      title: 'Setup / implantação',
      description: 'Taxa única',
      quantity: 1,
      unit_price: setup,
    });
  }
  if (monthly > 0) {
    seeded.push({
      title: 'Plano de continuidade',
      description: months ? `Mensalidade · ${months} meses` : 'Mensalidade',
      quantity: months || 1,
      unit_price: monthly,
    });
  }
  return seeded.length > 0 ? seeded : [{ title: '', description: '', quantity: 1, unit_price: 0 }];
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
  const [lines, setLines] = useState<Line[]>(() => linesFromQuote(quote));

  const linesTotal = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.unit_price || 0) * Math.max(1, Number(line.quantity || 1)), 0),
    [lines],
  );

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    formData.set('itemsJson', JSON.stringify(lines.filter((line) => line.title.trim())));
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
      <p className="quote-form-note">Só cliente e título são obrigatórios. O restante pode ficar em branco.</p>

      {error && <p className="quote-banner quote-banner--error">{error}</p>}
      {saved && <p className="quote-banner quote-banner--ok">Proposta salva.</p>}

      <section className="quote-card">
        <h2>Cliente e objeto</h2>
        <Field id="clientId" label="Cliente" required>
          <select id="clientId" name="clientId" required defaultValue={quote.client_id || ''} className="cnpja-input">
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field id="title" label="Título do projeto" required>
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
          <textarea id="solicitation" name="solicitation" rows={4} defaultValue={quote.solicitation || ''} className="cnpja-input" />
        </Field>
        <Field id="proposedSolution" label="Objetivo / resultado esperado">
          <textarea
            id="proposedSolution"
            name="proposedSolution"
            rows={4}
            defaultValue={quote.proposed_solution || ''}
            className="cnpja-input"
          />
        </Field>
        <Field id="generalScope" label="Escopo comercial" hint="Um entregável por linha. Aparece como lista no documento.">
          <textarea
            id="generalScope"
            name="generalScope"
            rows={5}
            defaultValue={quote.general_scope || ''}
            className="cnpja-input"
          />
        </Field>
      </section>

      <section className="quote-card">
        <h2>Detalhe do investimento</h2>
        <p className="quote-field__hint">Liste as linhas. O total da proposta é a soma delas.</p>
        <div className="quote-lines">
          {lines.map((line, index) => (
            <div key={index} className="quote-line">
              <label>
                Item
                <input
                  value={line.title}
                  onChange={(e) => updateLine(index, { title: e.target.value })}
                  placeholder="Ex.: Setup"
                  className="cnpja-input"
                  inputMode="text"
                />
              </label>
              <label>
                Detalhe
                <input
                  value={line.description}
                  onChange={(e) => updateLine(index, { description: e.target.value })}
                  placeholder="Ex.: taxa única"
                  className="cnpja-input"
                />
              </label>
              <label>
                Qtd
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: Number(e.target.value || 1) })}
                  className="cnpja-input font-mono"
                />
              </label>
              <label>
                Valor
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={line.unit_price}
                  onChange={(e) => updateLine(index, { unit_price: Number(e.target.value || 0) })}
                  className="cnpja-input font-mono"
                />
              </label>
              <p className="quote-line__sum">
                Soma <strong>R$ {money(Number(line.unit_price || 0) * Math.max(1, Number(line.quantity || 1)))}</strong>
              </p>
              <button
                type="button"
                className="quote-line__remove"
                onClick={() => setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))}
              >
                Remover linha
              </button>
            </div>
          ))}
        </div>
        <div className="quote-lines-footer">
          <button
            type="button"
            className="cnpja-button-secondary text-sm"
            onClick={() => setLines((prev) => [...prev, { title: '', description: '', quantity: 1, unit_price: 0 }])}
          >
            + Linha
          </button>
          <strong>Total R$ {money(linesTotal)}</strong>
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
              defaultValue={quote.delivery_deadline_days ?? ''}
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
        <button type="button" disabled={isPending} onClick={onDelete} className="quote-btn-danger">
          Excluir
        </button>
        <button type="submit" disabled={isPending} className="cnpja-button-primary text-sm px-5 py-2">
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </footer>
    </form>
  );
}
