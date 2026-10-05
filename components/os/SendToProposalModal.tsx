'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createLeadHandoff, type LeadHandoffInput } from '@/actions/os';
import {
  BUDGET_OPTIONS,
  SYSTEM_TYPE_OPTIONS,
  TEMPERATURE_OPTIONS,
  URGENCY_OPTIONS,
} from '@/lib/lead-handoff';
import { ClipboardList, X } from 'lucide-react';

interface SendToProposalModalProps {
  leadId: string;
  leadName: string;
  leadNotes?: string | null;
  callNotes?: string | null;
  /** Texto do botão; o padrão é "Enviar p/ proposta". */
  label?: string;
  className?: string;
  onSent?: () => void;
}

const EMPTY: LeadHandoffInput = {
  conversation_summary: '',
  client_needs: '',
  system_type: null,
  current_process: '',
  budget_range: null,
  urgency: null,
  decision_maker: '',
  temperature: null,
};

const draftKey = (leadId: string) => `codratec:briefing:${leadId}`;

function readDraft(leadId: string): LeadHandoffInput | null {
  try {
    const raw = window.localStorage.getItem(draftKey(leadId));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function writeDraft(leadId: string, value: LeadHandoffInput | null) {
  try {
    if (value) window.localStorage.setItem(draftKey(leadId), JSON.stringify(value));
    else window.localStorage.removeItem(draftKey(leadId));
  } catch {
    // sem armazenamento local (aba anônima): o rascunho só não é guardado
  }
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      id={id}
      ref={ref}
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="cnpja-input text-base md:text-sm rounded-lg w-full resize-none overflow-hidden min-h-[88px]"
    />
  );
}

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value?: string | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : opt.id)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold border transition ${
                active
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-500/50 text-inherit hover:border-blue-500'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SendToProposalModal({
  leadId,
  leadName,
  leadNotes,
  callNotes,
  label = 'Enviar p/ proposta',
  className,
  onSent,
}: SendToProposalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<LeadHandoffInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const open = () => {
    setForm(readDraft(leadId) || EMPTY);
    setError(null);
    setSent(false);
    setIsOpen(true);
  };

  const set = <K extends keyof LeadHandoffInput>(key: K, value: LeadHandoffInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      writeDraft(leadId, next);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.conversation_summary.trim() || !form.client_needs.trim()) {
      setError('Conte como foi a conversa e o que o cliente precisa.');
      return;
    }
    startTransition(async () => {
      const res = await createLeadHandoff(leadId, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      writeDraft(leadId, null);
      setSent(true);
      onSent?.();
    });
  };

  const priorNotes = [callNotes, leadNotes].map((n) => String(n || '').trim()).filter(Boolean);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          className ||
          'text-[10px] px-2 py-0.5 font-semibold inline-flex items-center gap-1 border bg-sky-100 text-sky-950 border-sky-700'
        }
      >
        <ClipboardList className="w-3 h-3" /> {label}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/50 md:items-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`briefing-title-${leadId}`}
        >
          <div className="os-modal-panel flex h-[100dvh] w-full flex-col md:h-auto md:max-h-[90vh] md:max-w-lg">
            <div className="flex items-start justify-between gap-2 border-b border-slate-500/30 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <h2 id={`briefing-title-${leadId}`} className="text-sm font-bold">
                  Enviar para proposta
                </h2>
                <p className="text-[11px] text-slate-400 truncate">{leadName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-slate-400 hover:text-inherit"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <ClipboardList className="w-8 h-8 text-emerald-500" />
                <p className="text-sm font-semibold">Briefing enviado.</p>
                <p className="text-xs text-slate-400">
                  O lead foi para a fila de propostas e o responsável pelos orçamentos foi avisado.
                </p>
                <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-primary text-xs min-h-11">
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  {priorNotes.length > 0 && (
                    <div className="border border-slate-500/30 px-3 py-2 text-xs">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                        Já anotado neste lead
                      </p>
                      {priorNotes.map((note, i) => (
                        <p key={i} className="whitespace-pre-wrap">
                          {note}
                        </p>
                      ))}
                    </div>
                  )}

                  {error && (
                    <p className="border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</p>
                  )}

                  <div>
                    <label
                      htmlFor={`briefing-conversa-${leadId}`}
                      className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1"
                    >
                      Como foi a conversa *
                    </label>
                    <AutoTextarea
                      id={`briefing-conversa-${leadId}`}
                      value={form.conversation_summary}
                      onChange={(v) => set('conversation_summary', v)}
                      placeholder="Com quem falou, o que chamou atenção, objeções..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`briefing-precisa-${leadId}`}
                      className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1"
                    >
                      O que o cliente precisa *
                    </label>
                    <AutoTextarea
                      id={`briefing-precisa-${leadId}`}
                      value={form.client_needs}
                      onChange={(v) => set('client_needs', v)}
                      placeholder="O problema que quer resolver, funcionalidades citadas..."
                    />
                  </div>

                  <ChoiceGroup
                    label="Tipo de sistema"
                    options={SYSTEM_TYPE_OPTIONS}
                    value={form.system_type}
                    onChange={(v) => set('system_type', v)}
                  />

                  <div>
                    <label
                      htmlFor={`briefing-hoje-${leadId}`}
                      className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1"
                    >
                      Como o cliente faz hoje
                    </label>
                    <input
                      id={`briefing-hoje-${leadId}`}
                      value={form.current_process || ''}
                      onChange={(e) => set('current_process', e.target.value)}
                      placeholder="Planilha, papel, outro sistema..."
                      className="cnpja-input text-base md:text-sm rounded-lg w-full min-h-11"
                    />
                  </div>

                  <ChoiceGroup
                    label="Orçamento que o cliente imagina"
                    options={BUDGET_OPTIONS}
                    value={form.budget_range}
                    onChange={(v) => set('budget_range', v)}
                  />

                  <ChoiceGroup
                    label="Prazo / urgência"
                    options={URGENCY_OPTIONS}
                    value={form.urgency}
                    onChange={(v) => set('urgency', v)}
                  />

                  <div>
                    <label
                      htmlFor={`briefing-decide-${leadId}`}
                      className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1"
                    >
                      Quem decide
                    </label>
                    <input
                      id={`briefing-decide-${leadId}`}
                      value={form.decision_maker || ''}
                      onChange={(e) => set('decision_maker', e.target.value)}
                      placeholder="Nome e cargo"
                      className="cnpja-input text-base md:text-sm rounded-lg w-full min-h-11"
                    />
                  </div>

                  <ChoiceGroup
                    label="Temperatura"
                    options={TEMPERATURE_OPTIONS}
                    value={form.temperature}
                    onChange={(v) => set('temperature', v)}
                  />
                </div>

                <div className="grid grid-cols-[1fr_2fr] gap-2 md:flex border-t border-slate-500/30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="cnpja-button-secondary text-sm min-h-11"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="cnpja-button-primary text-sm min-h-11 md:ml-auto"
                  >
                    {isPending ? 'Enviando...' : 'Enviar briefing'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
