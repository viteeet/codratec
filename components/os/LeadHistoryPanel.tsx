'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  createLeadActivity,
  createLeadFollowup,
  deleteLeadActivity,
  deleteLeadFollowup,
  getLeadActivities,
  getLeadEmails,
  getLeadFollowups,
  syncBrevoEmailEvents,
  updateLeadActivity,
  updateLeadFollowup,
} from '@/actions/os';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';
import { Bell, Check, Mail, MessageCircle, Phone, RefreshCw, StickyNote, Users, X } from 'lucide-react';

const ACTIVITY_TYPES = [
  { type: 'LIGAÇÃO', label: 'Ligação', icon: Phone },
  { type: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
  { type: 'EMAIL', label: 'E-mail', icon: Mail },
  { type: 'REUNIÃO', label: 'Reunião', icon: Users },
  { type: 'OBSERVAÇÃO', label: 'Nota', icon: StickyNote },
] as const;

const ACTIVITY_LABEL: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((item) => [item.type, item.label]),
);

function formatWhen(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function isOverdue(value?: string | null) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

type TimelineItem =
  | { kind: 'activity'; id: string; at: string; row: any }
  | { kind: 'email'; id: string; at: string; row: any };

export function LeadHistoryPanel({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [when, setWhen] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [syncing, startSync] = useTransition();

  const reload = async () => {
    const [acts, follows, mails] = await Promise.all([
      getLeadActivities(leadId),
      getLeadFollowups(leadId),
      getLeadEmails(leadId),
    ]);
    setActivities(acts);
    setFollowups(follows);
    setEmails(mails);
  };

  useEffect(() => {
    reload();
  }, [leadId]);

  useEffect(() => {
    if (!justSaved) return;
    const id = window.setTimeout(() => setJustSaved(null), 1400);
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

  const addFollowup = () => {
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
  };

  const pending = followups
    .filter((item) => item.status === 'PENDENTE')
    .sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)));

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [
      ...activities.map((row) => ({ kind: 'activity' as const, id: `a-${row.id}`, at: row.created_at || '', row })),
      ...emails.map((row) => ({
        kind: 'email' as const,
        id: `e-${row.id}`,
        at: row.opened_at || row.delivered_at || row.sent_at || row.created_at || '',
        row,
      })),
      ...followups
        .filter((row) => row.status !== 'PENDENTE')
        .map((row) => ({ kind: 'activity' as const, id: `f-${row.id}`, at: row.scheduled_at || '', row: { ...row, followup: true } })),
    ];
    return items.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }, [activities, emails, followups]);

  return (
    <div className="rl-hist">
      <section className="rl-hist-block">
        <h3 className="rl-hist-title">Registrar contato</h3>
        {error ? <p className="rl-ficha-error">{error}</p> : null}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="O que aconteceu? (opcional)"
          className="rl-hist-note"
          rows={2}
        />
        <p className="rl-hist-hint">Registrar como</p>
        <div className="rl-hist-types">
          {ACTIVITY_TYPES.map((item) => {
            const Icon = item.icon;
            const saved = justSaved === item.type;
            return (
              <button
                key={item.type}
                type="button"
                className={saved ? 'rl-hist-type is-on' : 'rl-hist-type'}
                disabled={isPending}
                onClick={() => register(item.type, item.label)}
              >
                {saved ? <Check className="w-4 h-4" aria-hidden /> : <Icon className="w-4 h-4" aria-hidden />}
                {saved ? 'Registrado' : item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rl-hist-block">
        <h3 className="rl-hist-title">
          <Bell className="w-3.5 h-3.5" aria-hidden /> Follow-up
        </h3>
        {pending.length ? (
          <ul className="rl-follow-list">
            {pending.map((item) => (
              <li key={item.id} className={isOverdue(item.scheduled_at) ? 'rl-follow is-late' : 'rl-follow'}>
                <time>{formatWhen(item.scheduled_at)}</time>
                <span>{item.notes || 'Retomar contato'}</span>
                <button
                  type="button"
                  className="rl-follow-done"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateLeadFollowup(item.id, { status: 'CONCLUIDO' });
                      await reload();
                    })
                  }
                >
                  <Check className="w-3.5 h-3.5" aria-hidden /> Feito
                </button>
                <button
                  type="button"
                  className="rl-follow-del"
                  aria-label="Cancelar follow-up"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateLeadFollowup(item.id, { status: 'CANCELADO' });
                      await reload();
                    })
                  }
                >
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rl-hist-empty">Nenhum follow-up marcado.</p>
        )}
        <div className="rl-follow-form">
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            aria-label="Data do follow-up"
          />
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lembrete" aria-label="Lembrete do follow-up" />
          <button type="button" disabled={isPending || !when} onClick={addFollowup}>
            Agendar
          </button>
        </div>
      </section>

      <section className="rl-hist-block is-timeline">
        <div className="rl-hist-bar">
          <h3 className="rl-hist-title">Histórico{timeline.length ? ` (${timeline.length})` : ''}</h3>
          <button
            type="button"
            disabled={syncing}
            title="Atualizar status dos e-mails"
            onClick={() =>
              startSync(async () => {
                const res = await syncBrevoEmailEvents(7);
                if (res && 'error' in res && res.error) setError(res.error);
                await reload();
              })
            }
          >
            <RefreshCw className={syncing ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} aria-hidden />
            E-mails
          </button>
        </div>
        {timeline.length === 0 ? (
          <p className="rl-hist-empty">Nada registrado ainda. Use os botões acima depois de cada contato.</p>
        ) : (
          <ol className="rl-timeline">
            {timeline.map((item) => {
              if (item.kind === 'email') {
                const status = (item.row.status || 'ENVIADO') as EmailTrackStatus;
                return (
                  <li key={item.id} className={`rl-tl-item is-email is-${String(status).toLowerCase()}`} title={item.row.bounce_reason || item.row.to_email || ''}>
                    <span className="rl-tl-type">E-mail · {EMAIL_STATUS_LABEL[status] || status}</span>
                    <p className="rl-tl-text">{item.row.subject || item.row.to_email || '—'}</p>
                    <time>{formatWhen(item.at)}</time>
                  </li>
                );
              }
              const row = item.row;
              if (row.followup) {
                return (
                  <li key={item.id} className="rl-tl-item is-follow">
                    <span className="rl-tl-type">Follow-up {row.status === 'CONCLUIDO' ? 'feito' : 'cancelado'}</span>
                    <p className="rl-tl-text">{row.notes || '—'}</p>
                    <time>{formatWhen(item.at)}</time>
                    <button
                      type="button"
                      aria-label="Excluir follow-up"
                      onClick={() =>
                        startTransition(async () => {
                          await deleteLeadFollowup(row.id);
                          await reload();
                        })
                      }
                    >
                      ×
                    </button>
                  </li>
                );
              }
              return (
                <li key={item.id} className="rl-tl-item">
                  <span className="rl-tl-type">{ACTIVITY_LABEL[row.type] || row.type}</span>
                  <input
                    className="rl-tl-text"
                    defaultValue={row.description}
                    title="Clique para editar"
                    aria-label="Descrição da atividade"
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next && next !== row.description) {
                        startTransition(async () => {
                          await updateLeadActivity(row.id, next);
                          await reload();
                        });
                      }
                    }}
                  />
                  <time>{formatWhen(item.at)}</time>
                  <button
                    type="button"
                    aria-label="Excluir atividade"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteLeadActivity(row.id);
                        await reload();
                      })
                    }
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
