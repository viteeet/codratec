'use client';

import { useEffect, useState, useTransition } from 'react';
import { getLeadEmails, syncBrevoEmailEvents } from '@/actions/email';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';

function formatWhen(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function LeadEmailLog({ leadId }: { leadId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = async () => {
    const data = await getLeadEmails(leadId);
    setRows(data);
  };

  useEffect(() => {
    reload();
  }, [leadId]);

  return (
    <div className="rl-act">
      <div className="rl-log-bar">
        <span>E-mails</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await syncBrevoEmailEvents(7);
              if (res && 'error' in res && res.error) setError(res.error);
              await reload();
            });
          }}
        >
          {isPending ? '…' : 'Atualizar'}
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {rows.length === 0 ? (
        <p className="rl-log-head">Nenhum disparo</p>
      ) : (
        <ul className="rl-log">
          {rows.map((row) => {
            const status = (row.status || 'ENVIADO') as EmailTrackStatus;
            const detail = row.subject || row.to_email || '—';
            return (
              <li key={row.id} className="rl-log-row" title={row.bounce_reason || row.to_email || ''}>
                <span>{EMAIL_STATUS_LABEL[status] || status}</span>
                <em>{detail}</em>
                <time>{formatWhen(row.opened_at || row.delivered_at || row.sent_at)}</time>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
