'use client';

import { useState, useTransition } from 'react';
import { scheduleLeadCall } from '@/actions/leads';
import { Calendar, Clock, PhoneCall } from 'lucide-react';
import { FormError, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Feedback';

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
  const toast = useToast();

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
        toast.success('Reunião agendada.');
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

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Agendar Reunião / Call" subtitle={<>Lead: {leadName}</>}
        icon={<PhoneCall className="w-4 h-4" />} className="w-full max-w-md p-6 space-y-4"
      >
        <FormError message={error} />

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
      </Modal>
    </>
  );
}
