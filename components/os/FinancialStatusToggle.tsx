'use client';

import { useTransition } from 'react';
import { toggleFinancialStatus } from '@/actions/os';

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

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleFinancialStatus(type, id, next);
        });
      }}
      className={paid ? 'cnpja-badge-success' : 'cnpja-badge-warning'}
      title={paid ? 'Marcar como pendente' : 'Marcar como pago'}
    >
      {isPending ? '…' : paid ? 'Pago' : 'Pendente'}
    </button>
  );
}
