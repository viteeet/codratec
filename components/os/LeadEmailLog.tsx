'use client';

import { useEffect, useState, useTransition } from 'react';
import { getLeadEmails, syncBrevoEmailEvents } from '@/actions/os';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';

function formatWhen(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('pt-BR');
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
    <div className="border-t border-[color:var(--rl-drawer-border)] pt-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold rl-drawer-muted uppercase tracking-wide">
          E-mails (Brevo)
        </p>
        <button
          type="button"
          disabled={isPending}
          className="rl-btn text-[10px]"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await syncBrevoEmailEvents(7);
              if (res && 'error' in res && res.error) setError(res.error);
              await reload();
            });
          }}
        >
          {isPending ? 'Atualizando…' : 'Atualizar e-mails'}
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {rows.length === 0 ? (
        <p className="text-[11px] rl-drawer-muted">Nenhum disparo registrado neste lead.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((row) => {
            const status = (row.status || 'ENVIADO') as EmailTrackStatus;
            return (
              <li key={row.id} className="border p-1.5 text-[11px] space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <strong>{EMAIL_STATUS_LABEL[status] || status}</strong>
                  <span className="rl-drawer-muted">{formatWhen(row.sent_at)}</span>
                </div>
                <p className="break-all">{row.to_email}</p>
                {row.subject ? <p>{row.subject}</p> : null}
                {row.opened_at ? <p>Lido em {formatWhen(row.opened_at)}</p> : null}
                {row.delivered_at && !row.opened_at ? (
                  <p>Entregue em {formatWhen(row.delivered_at)}</p>
                ) : null}
                {row.bounce_reason ? <p className="text-rose-700">{row.bounce_reason}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
