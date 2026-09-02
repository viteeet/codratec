'use client';

import { useTransition } from 'react';
import { updateLeadStatus, markLeadUninterested } from '@/actions/os';
import { ScheduleCallModal } from '@/components/os/ScheduleCallModal';
import { UserX, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LeadCardActionsProps {
  leadId: string;
  leadName: string;
  currentStatus: string;
}

export function LeadCardActions({ leadId, leadName, currentStatus }: LeadCardActionsProps) {
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

  return (
    <div className="space-y-2 pt-2 border-t border-slate-900">
      {/* Botões Rápidos */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        <ScheduleCallModal leadId={leadId} leadName={leadName} />

        <div className="flex items-center gap-1">
          {currentStatus !== 'NAO_INTERESSADO' && (
            <button
              onClick={handleUninterested}
              disabled={isPending}
              title="Marcar como Não Interessado"
              className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-medium transition"
            >
              <UserX className="w-3 h-3" />
            </button>
          )}

          {currentStatus === 'NOVO' && (
            <button
              onClick={() => handleStatus('CONTATO')}
              disabled={isPending}
              className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
            >
              Contato <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {currentStatus === 'CONTATO' && (
            <button
              onClick={() => handleStatus('QUALIFICADO')}
              disabled={isPending}
              className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
            >
              Qualificar <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {currentStatus === 'QUALIFICADO' && (
            <button
              onClick={() => handleStatus('PROPOSTA')}
              disabled={isPending}
              className="text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
            >
              Proposta <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {currentStatus === 'PROPOSTA' && (
            <button
              onClick={() => handleStatus('GANHO')}
              disabled={isPending}
              className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
            >
              <CheckCircle2 className="w-3 h-3" /> Fechar Venda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
