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

const ACTIVITY_TYPES = ['LIGAÇÃO', 'WHATSAPP', 'EMAIL', 'REUNIÃO', 'OBSERVAÇÃO'] as const;

export function LeadHistoryPanel({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [type, setType] = useState<(typeof ACTIVITY_TYPES)[number]>('OBSERVAÇÃO');
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = async () => {
    const [acts, follows] = await Promise.all([getLeadActivities(leadId), getLeadFollowups(leadId)]);
    setActivities(acts);
    setFollowups(follows);
  };

  useEffect(() => {
    reload();
  }, [leadId]);

  return (
    <div className="border-t border-[color:var(--rl-drawer-border)] pt-3 space-y-3">
      <p className="text-[10px] font-semibold rl-drawer-muted uppercase tracking-wide">Histórico (CRUD)</p>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}

      <div className="space-y-1.5">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full h-7 border px-1.5 text-[12px]">
          {ACTIVITY_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Descreva a atividade..."
          className="w-full border px-1.5 py-1 text-[12px]"
        />
        <button
          type="button"
          disabled={isPending || !description.trim()}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await createLeadActivity(leadId, type, description);
              if (res && 'error' in res) setError(res.error);
              else {
                setDescription('');
                await reload();
              }
            });
          }}
          className="rl-btn-on-dark text-[11px] px-2 py-1"
        >
          Registrar atividade
        </button>
      </div>

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
    </div>
  );
}
