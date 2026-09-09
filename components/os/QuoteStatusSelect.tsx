'use client';

import { useTransition } from 'react';
import { updateQuoteStatus } from '@/actions/os';

const STATUSES = [
  { id: 'RASCUNHO', label: 'Rascunho' },
  { id: 'ENVIADO', label: 'Enviado' },
  { id: 'NEGOCIACAO', label: 'Negociação' },
  { id: 'APROVADO', label: 'Aprovado' },
  { id: 'RECUSADO', label: 'Recusado' },
] as const;

export function QuoteStatusSelect({
  quoteId,
  status,
}: {
  quoteId: string;
  status?: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status || 'RASCUNHO'}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await updateQuoteStatus(quoteId, next);
        });
      }}
      className="cnpja-input text-[11px] py-1"
      aria-label="Status da proposta"
    >
      {STATUSES.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
