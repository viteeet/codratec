'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateLeadHandoffStatus } from '@/actions/os';
import {
  BUDGET_OPTIONS,
  HANDOFF_STATUS_LABEL,
  SYSTEM_TYPE_OPTIONS,
  TEMPERATURE_OPTIONS,
  URGENCY_OPTIONS,
  optionLabel,
  sortHandoffQueue,
} from '@/lib/lead-handoff';
import type { LeadHandoffStatus } from '@/types/database';
import { OsPageCount } from '@/components/os/OsPage';
import { ChevronDown, ChevronUp, Flame, ExternalLink } from 'lucide-react';

function waitingFor(iso?: string | null) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return 'agora há pouco';
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days === 1 ? '' : 's'}`;
}

const TEMPERATURE_CLS: Record<string, string> = {
  QUENTE: 'border-rose-600 text-rose-500',
  MORNO: 'border-amber-600 text-amber-500',
  FRIO: 'border-sky-600 text-sky-500',
};

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="whitespace-pre-wrap text-xs mt-0.5">{value}</dd>
    </div>
  );
}

function HandoffCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(item.status === 'ENVIADO');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lead = item.lead || {};
  const company = lead.trade_name || lead.company || lead.name || 'Lead';
  const contact = lead.name && lead.name !== company ? lead.name : null;
  const requester = item.requester?.full_name || item.requester?.email || 'Comercial';
  const leadHref = `/leads?q=${encodeURIComponent(lead.company || lead.name || '')}`;

  const setStatus = (status: LeadHandoffStatus) => {
    if (status === 'CANCELADO' && !window.confirm(`Tirar "${company}" da fila de propostas?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await updateLeadHandoffStatus(item.id, status);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <li className="os-mobile-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="os-mobile-card-title flex items-center gap-1.5">
            {item.temperature === 'QUENTE' && <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" aria-hidden />}
            <span className="truncate">{company}</span>
          </div>
          <div className="os-mobile-card-sub">
            {contact ? `${contact} · ` : ''}
            enviado por {requester} {waitingFor(item.created_at)}
          </div>
        </div>
        <span className="shrink-0 border border-slate-500/50 px-1.5 py-0.5 text-[10px] font-semibold">
          {HANDOFF_STATUS_LABEL[item.status as LeadHandoffStatus] || item.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-semibold">
        {item.temperature && (
          <span className={`border px-1.5 py-0.5 ${TEMPERATURE_CLS[item.temperature] || ''}`}>
            {optionLabel(TEMPERATURE_OPTIONS, item.temperature)}
          </span>
        )}
        {item.system_type && (
          <span className="border border-slate-500/50 px-1.5 py-0.5">
            {optionLabel(SYSTEM_TYPE_OPTIONS, item.system_type)}
          </span>
        )}
        {item.budget_range && (
          <span className="border border-slate-500/50 px-1.5 py-0.5">
            {optionLabel(BUDGET_OPTIONS, item.budget_range)}
          </span>
        )}
        {item.urgency && (
          <span className="border border-slate-500/50 px-1.5 py-0.5">
            {optionLabel(URGENCY_OPTIONS, item.urgency)}
          </span>
        )}
      </div>

      <p className={`text-xs mt-2 whitespace-pre-wrap ${expanded ? '' : 'line-clamp-2'}`}>{item.client_needs}</p>

      {expanded && (
        <dl className="mt-3 space-y-2 border-t border-slate-500/30 pt-3">
          <Detail label="Como foi a conversa" value={item.conversation_summary} />
          <Detail label="Como faz hoje" value={item.current_process} />
          <Detail label="Quem decide" value={item.decision_maker} />
          <Detail label="Notas da call" value={lead.call_notes} />
          <Detail label="Observações do lead" value={lead.notes} />
          <Detail
            label="Contato"
            value={[lead.whatsapp || lead.phone, lead.email, lead.city && `${lead.city}${lead.state ? `/${lead.state}` : ''}`]
              .filter(Boolean)
              .join(' · ')}
          />
        </dl>
      )}

      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

      <div className="os-mobile-card-actions mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="cnpja-button-secondary text-xs min-h-11 inline-flex items-center gap-1"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Menos' : 'Ver briefing'}
        </button>
        {item.status === 'ENVIADO' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus('EM_ANALISE')}
            className="cnpja-button-primary text-xs min-h-11"
          >
            Assumir
          </button>
        )}
        <Link href={leadHref} className="cnpja-button-secondary text-xs min-h-11 inline-flex items-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" /> Lead
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus('CANCELADO')}
          className="text-xs min-h-11 px-2 text-rose-500 ml-auto"
        >
          Tirar da fila
        </button>
      </div>
    </li>
  );
}

export function HandoffQueue({ handoffs }: { handoffs: any[] }) {
  const sorted = sortHandoffQueue(handoffs);
  return (
    <>
      <OsPageCount>
        {handoffs.length} lead{handoffs.length === 1 ? '' : 's'} aguardando proposta
      </OsPageCount>
      {sorted.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((item) => (
            <HandoffCard key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <p className="text-center py-8 text-sm text-slate-500">
          Nenhum lead na fila. Quando o comercial enviar um briefing, ele aparece aqui.
        </p>
      )}
    </>
  );
}
