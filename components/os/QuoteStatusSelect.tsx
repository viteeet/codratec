'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateQuoteStatus } from '@/actions/os';

const PIPELINE = [
  { id: 'RASCUNHO', label: 'Rascunho' },
  { id: 'ENVIADO', label: 'Enviado' },
  { id: 'NEGOCIACAO', label: 'Negociação' },
] as const;

const OPEN = new Set(['RASCUNHO', 'ENVIADO', 'VISUALIZADO', 'NEGOCIACAO']);

function projectHref(project: { id: string; name?: string | null }) {
  const q = project.name ? `&q=${encodeURIComponent(project.name)}` : '';
  return `/projetos?created=${project.id}${q}`;
}

export function QuoteStatusSelect({
  quoteId,
  status,
  project,
  canEdit = true,
}: {
  quoteId: string;
  status?: string | null;
  project?: { id: string; name?: string | null } | null;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const current = status || 'RASCUNHO';
  const isOpen = OPEN.has(current);

  const apply = (next: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const res = await updateQuoteStatus(quoteId, next);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      if (next === 'APROVADO' && 'projectId' in res && res.projectId) {
        router.push(`/projetos?created=${res.projectId}`);
      }
    });
  };

  if (current === 'APROVADO') {
    return (
      <div className="quote-outcome">
        <span className="cnpja-badge-success">Aprovado</span>
        {project ? (
          <Link href={projectHref(project)} className="cnpja-button-primary text-[11px] min-h-9 px-2.5">
            Abrir projeto
          </Link>
        ) : canEdit ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => apply('APROVADO', 'Criar o projeto agora a partir desta proposta?')}
            className="cnpja-button-primary text-[11px] min-h-9 px-2.5"
          >
            {isPending ? 'Criando…' : 'Criar projeto'}
          </button>
        ) : null}
        {error ? <p className="quote-outcome__error">{error}</p> : null}
      </div>
    );
  }

  if (current === 'RECUSADO') {
    return (
      <div className="quote-outcome">
        <span className="cnpja-badge-danger">Recusado</span>
        {canEdit ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => apply('ENVIADO')}
            className="cnpja-button-secondary text-[11px] min-h-9 px-2.5"
          >
            Reabrir
          </button>
        ) : null}
        {error ? <p className="quote-outcome__error">{error}</p> : null}
      </div>
    );
  }

  if (!canEdit) {
    if (current === 'ENVIADO') return <span className="cnpja-badge-info">Enviado</span>;
    if (current === 'NEGOCIACAO') return <span className="cnpja-badge-info">Negociação</span>;
    return <span className="cnpja-badge-warning">Rascunho</span>;
  }

  return (
    <div className="quote-outcome">
      <select
        value={PIPELINE.some((item) => item.id === current) ? current : 'ENVIADO'}
        disabled={isPending || !isOpen}
        onChange={(e) => apply(e.target.value)}
        className="cnpja-input text-[11px] py-1"
        aria-label="Andamento da proposta"
      >
        {PIPELINE.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <div className="quote-outcome__actions">
        <button
          type="button"
          disabled={isPending}
          onClick={() => apply('RECUSADO', 'Marcar esta proposta como recusada?')}
          className="cnpja-button-secondary text-[11px] min-h-9 px-2.5"
        >
          Recusar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            apply(
              'APROVADO',
              'Cliente aceitou. Isso cria o projeto e lança a receita no financeiro. Continuar?',
            )
          }
          className="cnpja-button-primary text-[11px] min-h-9 px-2.5"
        >
          {isPending ? 'Criando…' : 'Aprovar e criar projeto'}
        </button>
      </div>
      {error ? <p className="quote-outcome__error">{error}</p> : null}
    </div>
  );
}
