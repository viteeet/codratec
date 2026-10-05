'use client';

import { useMemo, useState, useTransition } from 'react';
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
import { OsPageCount, OsPageToolbar } from '@/components/os/OsPage';
import { ChevronDown, ChevronUp, Flame, ExternalLink, Search } from 'lucide-react';
import { useConfirm, useToast } from '@/components/ui/Feedback';

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
  const confirm = useConfirm();
  const toast = useToast();
  const lead = item.lead || {};
  const company = lead.trade_name || lead.company || lead.name || 'Lead';
  const contact = lead.name && lead.name !== company ? lead.name : null;
  const requester = item.requester?.full_name || item.requester?.email || 'Comercial';
  const leadHref = `/leads?q=${encodeURIComponent(lead.company || lead.name || '')}`;

  const setStatus = async (status: LeadHandoffStatus) => {
    if (
      status === 'CANCELADO' &&
      !(await confirm({ title: `Tirar "${company}" da fila de propostas?`, confirmLabel: 'Tirar da fila' }))
    )
      return;
    setError(null);
    startTransition(async () => {
      const res = await updateLeadHandoffStatus(item.id, status);
      if (res?.error) setError(res.error);
      else toast.success(status === 'CANCELADO' ? 'Lead tirado da fila.' : 'Fila atualizada.');
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

      <div className="os-mobile-card-actions os-mobile-card-actions--grid mt-3 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="cnpja-button-secondary text-xs min-h-11 inline-flex items-center justify-center gap-1"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Menos' : 'Ver briefing'}
        </button>
        {item.status === 'ENVIADO' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus('EM_ANALISE')}
            className="cnpja-button-primary text-xs min-h-11 justify-center"
          >
            Assumir
          </button>
        )}
        <Link href={leadHref} className="cnpja-button-secondary text-xs min-h-11 inline-flex items-center justify-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" /> Lead
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus('CANCELADO')}
          className="text-xs min-h-11 px-2 border border-rose-500/40 text-rose-500 md:border-0 md:ml-auto"
        >
          Tirar da fila
        </button>
      </div>
    </li>
  );
}

const FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'QUENTE', label: 'Quentes' },
  { id: 'ENVIADO', label: 'Novos' },
  { id: 'EM_ANALISE', label: 'Em análise' },
] as const;

export function HandoffQueue({ handoffs }: { handoffs: any[] }) {
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const items = handoffs.filter((h) => {
      if (filter === 'QUENTE' && h.temperature !== 'QUENTE') return false;
      if ((filter === 'ENVIADO' || filter === 'EM_ANALISE') && h.status !== filter) return false;
      if (!term) return true;
      return [h.lead?.name, h.lead?.company, h.lead?.trade_name, h.client_needs, h.conversation_summary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
    return sortHandoffQueue(items);
  }, [handoffs, filter, q]);

  return (
    <>
      {handoffs.length > 0 && (
        <>
          <OsPageToolbar>
            <div className="os-page-toolbar__field os-page-toolbar__field--search flex-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Empresa, contato ou necessidade..."
                  className="cnpja-input pl-9 text-base md:text-xs w-full"
                />
              </div>
            </div>
          </OsPageToolbar>
          <div className="os-chip-bar" role="tablist" aria-label="Filtrar fila de propostas">
            {FILTERS.map((f) => (
              <button
                key={f.id || 'todos'}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={filter === f.id ? 'is-active' : undefined}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}
      <OsPageCount>
        {visible.length === handoffs.length
          ? `${handoffs.length} lead${handoffs.length === 1 ? '' : 's'} aguardando proposta`
          : `${visible.length} de ${handoffs.length} leads`}
      </OsPageCount>
      {visible.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <HandoffCard key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <p className="text-center py-8 text-sm text-slate-500">
          {handoffs.length === 0
            ? 'Nenhum lead na fila. Quando o comercial enviar um briefing, ele aparece aqui.'
            : 'Nenhum lead com esse filtro.'}
        </p>
      )}
    </>
  );
}
