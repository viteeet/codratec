'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  createLeadActivity,
  createLeadFollowup,
  deleteLeadActivity,
  deleteLeadFollowup,
  getLeadActivities,
  getLeadFollowups,
  updateLeadActivity,
  updateLeadFollowup,
} from '@/actions/os';

const ACTIVITY_TYPES = [
  { type: 'LIGAÇÃO', label: 'Ligação' },
  { type: 'WHATSAPP', label: 'WhatsApp' },
  { type: 'EMAIL', label: 'E-mail' },
  { type: 'REUNIÃO', label: 'Reunião' },
  { type: 'OBSERVAÇÃO', label: 'Nota' },
] as const;

export function LeadHistoryPanel({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [when, setWhen] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = async () => {
    const [acts, follows] = await Promise.all([getLeadActivities(leadId), getLeadFollowups(leadId)]);
    setActivities(acts);
    setFollowups(follows);
  };

  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    reload();
  }, [leadId]);

  useEffect(() => {
    if (!justSaved) return;
    setShowLog(true);
    const id = window.setTimeout(() => setJustSaved(null), 1200);
    return () => window.clearTimeout(id);
  }, [justSaved]);

  const register = (type: string, label: string) => {
    setError(null);
    setJustSaved(null);
    startTransition(async () => {
      const text = description.trim() || label;
      const res = await createLeadActivity(leadId, type, text);
      if (res && 'error' in res) setError(res.error);
      else {
        setDescription('');
        setJustSaved(type);
        await reload();
      }
    });
  };

  return (
    <div className="rl-act">
      <p className="rl-act-label">Registrar atividade</p>
      {error ? <p className="rl-ficha-error">{error}</p> : null}
      <div className="rl-act-row">
        {ACTIVITY_TYPES.map((item) => (
          <button
            key={item.type}
            type="button"
            className={justSaved === item.type ? 'rl-act-btn is-on' : 'rl-act-btn'}
            disabled={isPending}
            onClick={() => register(item.type, item.label)}
          >
            {justSaved === item.type ? 'Ok' : item.label}
          </button>
        ))}
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Detalhe opcional"
        className="rl-act-note"
      />

      <details
        className="rl-act-list"
        open={showLog}
        onToggle={(e) => setShowLog((e.currentTarget as HTMLDetailsElement).open)}
      >
      <summary>Histórico{activities.length ? ` (${activities.length})` : ''}</summary>

      <ul className="space-y-1.5">
        {activities.map((item) => (
          <li key={item.id} className="border p-1.5 text-[11px] space-y-1">
            <p className="font-semibold">{item.type}</p>
            <textarea
              defaultValue={item.description}
              rows={2}
              className="w-full border px-1 py-0.5 text-[11px]"
              onBlur={(e) => {
                const next = e.target.value.trim();
                if (next && next !== item.description) {
                  startTransition(async () => {
                    await updateLeadActivity(item.id, next);
                    await reload();
                  });
                }
              }}
            />
            <button
              type="button"
              className="text-rose-700"
              onClick={() => {
                startTransition(async () => {
                  await deleteLeadActivity(item.id);
                  await reload();
                });
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>

      <p className="text-[10px] font-semibold rl-drawer-muted uppercase tracking-wide">Follow-ups</p>
      <div className="space-y-1.5">
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full h-7 border px-1.5 text-[12px]" />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas do follow-up"
          className="w-full h-7 border px-1.5 text-[12px]"
        />
        <button
          type="button"
          disabled={isPending || !when}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await createLeadFollowup(leadId, new Date(when).toISOString(), notes);
              if (res && 'error' in res) setError(res.error);
              else {
                setWhen('');
                setNotes('');
                await reload();
              }
            });
          }}
          className="rl-btn-on-dark text-[11px] px-2 py-1"
        >
          Criar follow-up
        </button>
      </div>

      <ul className="space-y-1.5">
        {followups.map((item) => (
          <li key={item.id} className="border p-1.5 text-[11px] flex flex-wrap items-center gap-2">
            <span>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('pt-BR') : '—'}</span>
            <select
              defaultValue={item.status}
              className="h-6 border text-[11px]"
              onChange={(e) => {
                startTransition(async () => {
                  await updateLeadFollowup(item.id, { status: e.target.value });
                  await reload();
                });
              }}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <button
              type="button"
              className="text-rose-700"
              onClick={() => {
                startTransition(async () => {
                  await deleteLeadFollowup(item.id);
                  await reload();
                });
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
      </details>
    </div>
  );
}
