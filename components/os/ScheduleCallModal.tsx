'use client';

import { useState, useTransition } from 'react';
import { scheduleLeadCall } from '@/actions/os';
import { Calendar, Clock, X, PhoneCall } from 'lucide-react';

interface ScheduleCallModalProps {
  leadId: string;
  leadName: string;
}

export function ScheduleCallModal({ leadId, leadName }: ScheduleCallModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError('Selecione a data e horário da call.');
      return;
    }

    startTransition(async () => {
      const res = await scheduleLeadCall(leadId, scheduledAt, notes);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-950 border border-blue-700 px-2 py-0.5 font-semibold inline-flex items-center gap-1 transition"
      >
        <Calendar className="w-3 h-3" /> Agendar Call
      </button>

      {isOpen && (
        <div className="os-modal-overlay">
          <div className="os-modal-panel w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Agendar Reunião / Call</h2>
                  <p className="text-[11px] text-slate-400">Lead: {leadName}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Data e Horário da Reunião *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="cnpja-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Objetivo / Pauta da Reunião
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Apresentação da proposta comercial e escopo do projeto..."
                  className="cnpja-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                  {isPending ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
