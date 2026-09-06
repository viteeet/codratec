'use client';

import { useTransition } from 'react';
import { updateLeadStatus, markLeadUninterested } from '@/actions/os';
import { ScheduleCallModal } from '@/components/os/ScheduleCallModal';
import { UserX, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LeadCardActionsProps {
  leadId: string;
  leadName: string;
  currentStatus: string;
  compact?: boolean;
}

const btnBase =
  'text-[10px] px-2 py-0.5 font-semibold inline-flex items-center gap-0.5 border disabled:opacity-50';

export function LeadCardActions({ leadId, leadName, currentStatus, compact }: LeadCardActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (status: string) => {
    startTransition(async () => {
      await updateLeadStatus(leadId, status);
    });
  };

  const handleUninterested = () => {
    const reason = prompt('Motivo do descarte / não interesse (opcional):');
    startTransition(async () => {
      await markLeadUninterested(leadId, reason || undefined);
    });
  };

  const nextButton = (() => {
    if (currentStatus === 'NOVO') {
      return (
        <button
          type="button"
          onClick={() => handleStatus('CONTATO')}
          disabled={isPending}
          className={`${btnBase} bg-amber-100 text-amber-950 border-amber-700`}
        >
          Contato <ArrowRight className="w-3 h-3" />
        </button>
      );
    }
    if (currentStatus === 'CONTATO') {
      return (
        <button
          type="button"
          onClick={() => handleStatus('QUALIFICADO')}
          disabled={isPending}
          className={`${btnBase} bg-violet-100 text-violet-950 border-violet-700`}
        >
          Qualificar <ArrowRight className="w-3 h-3" />
        </button>
      );
    }
    if (currentStatus === 'QUALIFICADO') {
      return (
        <button
          type="button"
          onClick={() => handleStatus('PROPOSTA')}
          disabled={isPending}
          className={`${btnBase} bg-sky-100 text-sky-950 border-sky-700`}
        >
          Proposta <ArrowRight className="w-3 h-3" />
        </button>
      );
    }
    if (currentStatus === 'PROPOSTA') {
      return (
        <button
          type="button"
          onClick={() => handleStatus('GANHO')}
          disabled={isPending}
          className={`${btnBase} bg-emerald-100 text-emerald-950 border-emerald-700`}
        >
          <CheckCircle2 className="w-3 h-3" /> {compact ? 'Fechar' : 'Fechar Venda'}
        </button>
      );
    }
    return null;
  })();

  const discardButton =
    currentStatus !== 'NAO_INTERESSADO' ? (
      <button
        type="button"
        onClick={handleUninterested}
        disabled={isPending}
        title="Não interessado"
        className={`${btnBase} bg-rose-100 text-rose-950 border-rose-700`}
      >
        <UserX className="w-3 h-3" />
      </button>
    ) : null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <ScheduleCallModal leadId={leadId} leadName={leadName} />
        {nextButton}
        {discardButton}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <ScheduleCallModal leadId={leadId} leadName={leadName} />
        <div className="flex items-center gap-1">
          {discardButton}
          {nextButton}
        </div>
      </div>
    </div>
  );
}
