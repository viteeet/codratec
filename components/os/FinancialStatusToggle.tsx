'use client';

import { useTransition } from 'react';
import { toggleFinancialStatus } from '@/actions/financial';
import { financialStatusKind } from '@/components/os/project-status';

export function FinancialStatusToggle({
  type,
  id,
  status,
}: {
  type: 'revenue' | 'expense';
  id: string;
  status?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const paid = status === 'PAGO';
  const next = paid ? 'PENDENTE' : 'PAGO';
  const label = paid ? 'Pago' : status === 'ATRASADO' ? 'Atrasado' : status === 'CANCELADO' ? 'Cancelado' : 'Pendente';

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleFinancialStatus(type, id, next);
        });
      }}
      className={`cnpja-badge-${financialStatusKind(status)} os-status-toggle`}
      title={paid ? 'Marcar como pendente' : 'Marcar como pago'}
      aria-label={`${label}. ${paid ? 'Marcar como pendente' : 'Marcar como pago'}`}
    >
      {isPending ? '…' : label}
    </button>
  );
}
