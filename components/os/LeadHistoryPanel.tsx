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
} from '@/actions/leads';

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

      <ul className="rl-log">
        {activities.map((item) => (
          <li key={item.id} className="rl-log-row">
            <span>{item.type === 'OBSERVAÇÃO' ? 'Nota' : item.type === 'LIGAÇÃO' ? 'Ligação' : item.type === 'REUNIÃO' ? 'Reunião' : item.type === 'EMAIL' ? 'E-mail' : 'WhatsApp'}</span>
            <input
              defaultValue={item.description}
              title={item.description}
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
            <time>
              {item.created_at
                ? new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : ''}
            </time>
            <button
              type="button"
              aria-label="Excluir atividade"
              onClick={() => {
                startTransition(async () => {
                  await deleteLeadActivity(item.id);
                  await reload();
                });
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <p className="rl-log-head">Follow-ups</p>
      <div className="rl-log-row rl-log-form">
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Data do follow-up" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nota" aria-label="Nota do follow-up" />
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
        >
          Ok
        </button>
      </div>

      <ul className="rl-log">
        {followups.map((item) => (
          <li key={item.id} className="rl-log-row is-follow">
            <span>Follow-up</span>
            <em>{item.notes || '—'}</em>
            <time>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</time>
            <select
              defaultValue={item.status}
              aria-label="Status do follow-up"
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
              aria-label="Excluir follow-up"
              onClick={() => {
                startTransition(async () => {
                  await deleteLeadFollowup(item.id);
                  await reload();
                });
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      </details>
    </div>
  );
}
