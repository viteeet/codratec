'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { SendLeadEmailButton } from '@/components/os/SendLeadEmailButton';
import { ScheduleCallModal } from '@/components/os/ScheduleCallModal';
import {
  updateLead,
  deleteLead,
  createLeadActivity,
  markLeadWhatsappInvalid,
  updateLeadStatus,
  markLeadUninterested,
} from '@/actions/os';
import { LeadHistoryPanel } from '@/components/os/LeadHistoryPanel';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';
import {
  X,
  Phone,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  Mail,
  MessageCircle,
  Check,
} from 'lucide-react';
import { cellWhatsAppNumber, getWhatsAppUrl, LEAD_WHATSAPP_TEXT } from '@/lib/whatsapp';

function formatCnpj(value?: string | null) {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatPhone(value?: string | null) {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return value;
}

function formatCnae(value?: string | null) {
  if (!value) return null;
  const d = value.replace(/\D/g, '');
  if (d.length !== 7) return value;
  return `${d.slice(0, 4)}-${d.slice(4, 5)}/${d.slice(5)}`;
}

function formatMoney(value?: number | string | null) {
  if (value == null || value === '') return '—';
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const iso = String(value).slice(0, 10);
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return String(value);
  return `${d}/${m}/${y}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('pt-BR');
}

function samePhone(a?: string | null, b?: string | null) {
  const da = String(a || '').replace(/\D/g, '');
  const db = String(b || '').replace(/\D/g, '');
  return Boolean(da && db && da === db);
}

function moneyInput(value?: number | string | null) {
  if (value == null || value === '') return '';
  return String(value);
}

function dateInput(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* ignore */
  }
}

function leadTitle(lead: any) {
  const trade = (lead.trade_name || '').trim();
  const company = (lead.company || '').trim();
  const name = (lead.name || '').trim();
  const primary = trade || company || name || 'Sem nome';
  const secondary =
    company && company.toLowerCase() !== primary.toLowerCase() ? company : null;
  return { primary, secondary };
}

const STATUS_OPTIONS = [
  { id: 'NOVO', label: 'Novo' },
  { id: 'CONTATO', label: 'Contato' },
  { id: 'QUALIFICADO', label: 'Qualificado' },
  { id: 'CALL_AGENDADA', label: 'Call agendada' },
  { id: 'PROPOSTA', label: 'Proposta' },
  { id: 'NEGOCIACAO', label: 'Negociação' },
  { id: 'GANHO', label: 'Ganho' },
  { id: 'NAO_INTERESSADO', label: 'Não interessado' },
  { id: 'SEM_RESPOSTA', label: 'Sem resposta' },
  { id: 'FUTURO', label: 'Futuro' },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.id, s.label]),
);

const PIPELINE = ['NOVO', 'CONTATO', 'QUALIFICADO', 'CALL_AGENDADA', 'PROPOSTA', 'NEGOCIACAO', 'GANHO'];
const CLOSED = ['SEM_RESPOSTA', 'FUTURO', 'NAO_INTERESSADO'];

type NextStep = { status: string; label: string } | null;

function nextStep(status: string): NextStep {
  switch (status) {
    case 'NOVO':
      return { status: 'CONTATO', label: 'Marcar contato feito' };
    case 'CONTATO':
      return { status: 'QUALIFICADO', label: 'Qualificar lead' };
    case 'QUALIFICADO':
      return { status: 'CALL_AGENDADA', label: 'Agendar call' };
    case 'CALL_AGENDADA':
      return { status: 'PROPOSTA', label: 'Mover para proposta' };
    case 'PROPOSTA':
      return { status: 'NEGOCIACAO', label: 'Mover para negociação' };
    case 'NEGOCIACAO':
      return { status: 'GANHO', label: 'Marcar como ganho' };
    case 'SEM_RESPOSTA':
    case 'FUTURO':
    case 'NAO_INTERESSADO':
      return { status: 'CONTATO', label: 'Reabrir lead' };
    default:
      return null;
  }
}

type Ask = 'wa' | 'call' | 'discard' | 'delete' | 'won' | null;

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'rl-fd is-wide' : 'rl-fd'}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rl-fd-copy"
      aria-label={label}
      title={label}
      onClick={async () => {
        await copyText(value);
        setDone(true);
        window.setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
    </button>
  );
}

type EditForm = {
  name: string;
  trade_name: string;
  company: string;
  document: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  main_activity: string;
  cnae_code: string;
  share_capital: string;
  annual_revenue: string;
  opened_at: string;
  notes: string;
  source: string;
  status: string;
  niche: string;
  category: string;
};

function toForm(lead: any): EditForm {
  return {
    name: lead.name || '',
    trade_name: lead.trade_name || '',
    company: lead.company || '',
    document: lead.document || '',
    email: lead.email || '',
    phone: lead.phone || '',
    whatsapp: lead.whatsapp || '',
    city: lead.city || '',
    state: lead.state || '',
    main_activity: lead.main_activity || '',
    cnae_code: lead.cnae_code || '',
    share_capital: moneyInput(lead.share_capital),
    annual_revenue: moneyInput(lead.annual_revenue),
    opened_at: dateInput(lead.opened_at),
    notes: lead.notes || '',
    source: lead.source || '',
    status: lead.status || 'NOVO',
    niche: lead.niche || '',
    category: lead.category || '',
  };
}

export function LeadDrawer({
  lead,
  members = [],
  canSendEmail = false,
  templates = [],
  onClose,
  onAssign,
  onUpdated,
  onDeleted,
  assigning = false,
  position = -1,
  total = 0,
  onPrev,
  onNext,
}: {
  lead: any;
  members?: any[];
  canSendEmail?: boolean;
  templates?: import('@/actions/os').EmailTemplateRow[];
  onClose: () => void;
  onAssign?: (leadId: string, assignedTo: string | null) => void;
  onUpdated?: (lead: any) => void;
  onDeleted?: (leadId: string) => void;
  assigning?: boolean;
  position?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>(() => toForm(lead));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ask, setAsk] = useState<Ask>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [discardReason, setDiscardReason] = useState('');
  const [historyTick, setHistoryTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canPrev = position > 0;
  const canNext = position >= 0 && position < total - 1;

  useEffect(() => {
    setForm(toForm(lead));
    setEditing(false);
    setError(null);
    setAsk(null);
    setAskError(null);
    setDiscardReason('');
    scrollRef.current?.scrollTo({ top: 0 });
  }, [lead?.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (event.key === 'Escape') {
        event.preventDefault();
        if (ask) {
          setAsk(null);
          return;
        }
        onClose();
        return;
      }
      if (ask || typing || editing) return;
      if (event.key === 'ArrowLeft' && canPrev) {
        event.preventDefault();
        onPrev?.();
      }
      if (event.key === 'ArrowRight' && canNext) {
        event.preventDefault();
        onNext?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ask, canNext, canPrev, editing, onClose, onNext, onPrev]);

  const { primary, secondary } = leadTitle(editing ? { ...lead, ...form } : lead);
  const status: string = lead.status || 'NOVO';
  const stageIndex = PIPELINE.indexOf(status);
  const closed = CLOSED.includes(status);
  const next = nextStep(status);
  const phone = lead.phone || '';
  const whatsapp = lead.whatsapp || '';
  const cellWhatsapp = cellWhatsAppNumber(whatsapp, phone);
  const whatsappInvalid = Boolean(lead.whatsapp_invalid);
  const cnae = formatCnae(lead.cnae_code);
  const city = lead.city ? `${lead.city}${lead.state ? `/${lead.state}` : ''}` : null;
  const contactName = (lead.name || '').trim();
  const showContact =
    contactName &&
    contactName.toLowerCase() !== (lead.trade_name || '').trim().toLowerCase() &&
    contactName.toLowerCase() !== (lead.company || '').trim().toLowerCase();
  const niche = (lead.niche || lead.category || '').trim();
  const showNiche = niche && niche.toLowerCase() !== String(lead.main_activity || '').trim().toLowerCase();
  const emailStatus = lead.last_email_status as EmailTrackStatus | undefined;
  const emailBounced = emailStatus === 'REJEITADO';

  const companyFacts: { label: string; value: string | null; wide?: boolean }[] = [
    { label: 'Abertura', value: lead.opened_at ? formatDate(lead.opened_at) : null },
    { label: 'Capital social', value: lead.share_capital != null && lead.share_capital !== '' ? formatMoney(lead.share_capital) : null },
    { label: 'Faturamento', value: lead.annual_revenue != null && lead.annual_revenue !== '' ? formatMoney(lead.annual_revenue) : null },
    { label: 'Nicho', value: niche ? (showNiche ? niche : '') : null },
    { label: 'Origem', value: (lead.source || '').trim() || null },
  ];
  const missingFacts = companyFacts.filter((fact) => fact.value === null || fact.value === '—').map((fact) => fact.label);

  const setField = (key: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const refreshHistory = () => setHistoryTick((tick) => tick + 1);

  const closeAsk = () => {
    setAsk(null);
    setAskError(null);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateLead(lead.id, form);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res.lead) onUpdated?.(res.lead);
      else onUpdated?.({ ...lead, ...form });
      setEditing(false);
    });
  };

  const changeStatus = (nextStatus: string) => {
    if (nextStatus === status) return;
    if (nextStatus === 'GANHO') {
      setAsk('won');
      return;
    }
    if (nextStatus === 'NAO_INTERESSADO') {
      setDiscardReason('');
      setAsk('discard');
      return;
    }
    applyStatus(nextStatus);
  };

  const applyStatus = (nextStatus: string) => {
    setError(null);
    setAskError(null);
    startTransition(async () => {
      const res = await updateLeadStatus(lead.id, nextStatus);
      if (res && 'error' in res && res.error) {
        if (ask) setAskError(res.error);
        else setError(res.error);
        return;
      }
      onUpdated?.({ ...lead, status: nextStatus, updated_at: new Date().toISOString() });
      setAsk(null);
    });
  };

  const confirmDiscard = () => {
    setAskError(null);
    startTransition(async () => {
      const reason = discardReason.trim();
      const res = await markLeadUninterested(lead.id, reason || undefined);
      if (res && 'error' in res && res.error) {
        setAskError(res.error);
        return;
      }
      onUpdated?.({ ...lead, status: 'NAO_INTERESSADO', uninterest_reason: reason || lead.uninterest_reason, updated_at: new Date().toISOString() });
      setAsk(null);
    });
  };

  const confirmDelete = () => {
    setAskError(null);
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (res?.error) {
        setAskError(res.error);
        return;
      }
      setAsk(null);
      onDeleted?.(lead.id);
      onClose();
    });
  };

  const logActivity = (type: string, text: string) => {
    setAskError(null);
    startTransition(async () => {
      const res = await createLeadActivity(lead.id, type, text);
      if (res && 'error' in res) {
        setAskError(res.error);
        return;
      }
      setAsk(null);
      refreshHistory();
    });
  };

  const markWhatsappInvalid = () => {
    setAskError(null);
    startTransition(async () => {
      const res = await markLeadWhatsappInvalid(lead.id);
      if (res && 'error' in res) {
        setAskError(res.error);
        return;
      }
      onUpdated?.({ ...(res.lead || lead), whatsapp_invalid: true });
      setAsk(null);
      refreshHistory();
    });
  };

  const onScheduled = (scheduledAt: string, notes: string) => {
    onUpdated?.({
      ...lead,
      status: 'CALL_AGENDADA',
      scheduled_call_at: scheduledAt,
      call_notes: notes || null,
      updated_at: new Date().toISOString(),
    });
  };

  const mark = primary
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase();

  const scheduleButton = (className: string, label: React.ReactNode) => (
    <ScheduleCallModal
      leadId={lead.id}
      leadName={primary}
      triggerClassName={className}
      triggerLabel={label}
      onScheduled={onScheduled}
    />
  );

  const nextButton = !next ? null : next.status === 'CALL_AGENDADA' ? (
    scheduleButton(
      'rl-ficha-next',
      <>
        <Calendar className="w-4 h-4" aria-hidden /> {next.label}
      </>,
    )
  ) : (
    <button type="button" className="rl-ficha-next" disabled={isPending} onClick={() => changeStatus(next.status)}>
      {next.label} <ArrowRight className="w-4 h-4" aria-hidden />
    </button>
  );

  const pager = (variant: 'head' | 'foot') => (
    <nav className={`rl-ficha-pager is-${variant}`} aria-label="Navegar leads">
      <button type="button" disabled={!canPrev} onClick={onPrev} aria-label="Lead anterior" title="Lead anterior (←)">
        <ChevronLeft className="w-5 h-5" aria-hidden />
        <span>Anterior</span>
      </button>
      <p>
        {position >= 0 ? (
          <>
            <strong>{position + 1}</strong> de {total.toLocaleString('pt-BR')}
          </>
        ) : (
          'Fora do filtro'
        )}
      </p>
      <button type="button" disabled={!canNext} onClick={onNext} aria-label="Próximo lead" title="Próximo lead (→)">
        <span>Próximo</span>
        <ChevronRight className="w-5 h-5" aria-hidden />
      </button>
    </nav>
  );

  return (
    <>
      <button type="button" className="rl-ficha-backdrop" aria-label="Fechar ficha" onClick={onClose} />
      <aside className="rl-drawer rl-ficha" role="dialog" aria-modal="true" aria-label={`Ficha do lead ${primary}`}>
        <div className="rl-ficha-head">
          <span className="rl-ficha-mark" aria-hidden>
            {mark || 'LD'}
          </span>
          <div className="rl-ficha-id">
            <h2>{primary}</h2>
            <p>
              {[secondary, city, lead.document ? formatCnpj(lead.document) : null].filter(Boolean).join(' · ') || 'Sem dados da empresa'}
            </p>
            <div className="rl-ficha-tags">
              {lead.source ? <span>{lead.source}</span> : null}
              {emailBounced ? <span className="is-warn">E-mail rejeitado</span> : null}
              {whatsappInvalid ? <span className="is-warn">WhatsApp inválido</span> : null}
            </div>
          </div>
          {pager('head')}
          <button type="button" className="rl-ficha-close" onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rl-ficha-stage">
          <ol className="rl-stage-steps" aria-label="Etapa do funil">
            {PIPELINE.map((id, index) => {
              const state = closed ? 'is-idle' : index < stageIndex ? 'is-done' : index === stageIndex ? 'is-current' : 'is-idle';
              const label = (
                <>
                  <i aria-hidden>{index < stageIndex && !closed ? <Check className="w-3 h-3" /> : index + 1}</i>
                  {STATUS_LABEL[id]}
                </>
              );
              return (
                <li key={id} className={state}>
                  {id === 'CALL_AGENDADA' && status !== id ? (
                    scheduleButton('rl-stage-btn', label)
                  ) : (
                    <button
                      type="button"
                      className="rl-stage-btn"
                      aria-current={index === stageIndex ? 'step' : undefined}
                      disabled={isPending}
                      onClick={() => changeStatus(id)}
                    >
                      {label}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="rl-stage-out" role="group" aria-label="Encerrar lead">
            {CLOSED.map((id) => (
              <button
                key={id}
                type="button"
                className={status === id ? 'is-current' : undefined}
                aria-pressed={status === id}
                disabled={isPending}
                onClick={() => changeStatus(id)}
              >
                {id === 'NAO_INTERESSADO' ? 'Descartar' : STATUS_LABEL[id]}
              </button>
            ))}
          </div>
          <label className="rl-stage-select">
            <span>Etapa</span>
            <select value={status} disabled={isPending} onChange={(e) => changeStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {nextButton ? <div className="rl-stage-next">{nextButton}</div> : null}
        </div>

        <div className="rl-ficha-actions">
          {nextButton ? <div className="rl-actions-next">{nextButton}</div> : null}
          {phone ? (
            <a
              className="rl-ficha-act"
              href={`tel:${phone.replace(/\D/g, '')}`}
              onClick={() => {
                setAskError(null);
                setAsk('call');
              }}
            >
              <Phone className="w-4 h-4" aria-hidden />
              <span>Ligar</span>
            </a>
          ) : (
            <span className="rl-ficha-act is-off" title="Sem telefone">
              <Phone className="w-4 h-4" aria-hidden />
              <span>Ligar</span>
            </span>
          )}
          {cellWhatsapp && !whatsappInvalid ? (
            <a
              className="rl-ficha-act is-wa"
              href={getWhatsAppUrl(cellWhatsapp, LEAD_WHATSAPP_TEXT) ?? '#'}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                setAskError(null);
                setAsk('wa');
              }}
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              <span>WhatsApp</span>
            </a>
          ) : (
            <span className="rl-ficha-act is-off" title={whatsappInvalid ? 'Número marcado como inválido' : 'Sem celular'}>
              <MessageCircle className="w-4 h-4" aria-hidden />
              <span>WhatsApp</span>
            </span>
          )}
          {lead.email && canSendEmail ? (
            <SendLeadEmailButton
              leadId={lead.id}
              leadName={primary}
              leadEmail={lead.email}
              lead={lead}
              templates={templates}
              triggerClassName="rl-ficha-act"
              triggerLabel={
                <>
                  <Mail className="w-4 h-4" aria-hidden />
                  <span>E-mail</span>
                </>
              }
              onSent={refreshHistory}
            />
          ) : lead.email ? (
            <a className="rl-ficha-act" href={`mailto:${lead.email}`}>
              <Mail className="w-4 h-4" aria-hidden />
              <span>E-mail</span>
            </a>
          ) : (
            <span className="rl-ficha-act is-off" title="Sem e-mail">
              <Mail className="w-4 h-4" aria-hidden />
              <span>E-mail</span>
            </span>
          )}
          {next?.status === 'CALL_AGENDADA'
            ? null
            : scheduleButton(
                'rl-ficha-act',
                <>
                  <Calendar className="w-4 h-4" aria-hidden />
                  <span>Agendar call</span>
                </>,
              )}
        </div>

        <div className="rl-ficha-scroll" ref={scrollRef}>
          {error ? <p className="rl-ficha-error">{error}</p> : null}

          <div className="rl-ficha-body">
            <div className="rl-ficha-main">
              {editing ? (
                <>
                  <div className="rl-ficha-bar">
                    <strong>Editando ficha</strong>
                    <button
                      type="button"
                      className="rl-ficha-edit"
                      onClick={() => {
                        setEditing(false);
                        setForm(toForm(lead));
                        setError(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="button" className="rl-ficha-save" disabled={isPending} onClick={handleSave}>
                      <Save className="w-3.5 h-3.5" />
                      {isPending ? 'Salvando…' : 'Salvar'}
                    </button>
                  </div>
                  <div className="rl-ficha-grid">
                    <label className="rl-ficha-cell">
                      <span>Nome do contato</span>
                      <input value={form.name} onChange={(e) => setField('name', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Fantasia</span>
                      <input value={form.trade_name} onChange={(e) => setField('trade_name', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell is-wide">
                      <span>Razão social</span>
                      <input value={form.company} onChange={(e) => setField('company', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>CNPJ</span>
                      <input value={form.document} onChange={(e) => setField('document', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>E-mail</span>
                      <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Telefone</span>
                      <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>WhatsApp</span>
                      <input type="tel" value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Cidade</span>
                      <input value={form.city} onChange={(e) => setField('city', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>UF</span>
                      <input
                        value={form.state}
                        maxLength={2}
                        onChange={(e) => setField('state', e.target.value.toUpperCase())}
                      />
                    </label>
                    <label className="rl-ficha-cell is-wide">
                      <span>Atividade</span>
                      <input value={form.main_activity} onChange={(e) => setField('main_activity', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>CNAE</span>
                      <input value={form.cnae_code} onChange={(e) => setField('cnae_code', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Abertura</span>
                      <input type="date" value={form.opened_at} onChange={(e) => setField('opened_at', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Capital social</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={form.share_capital}
                        onChange={(e) => setField('share_capital', e.target.value)}
                      />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Faturamento</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={form.annual_revenue}
                        onChange={(e) => setField('annual_revenue', e.target.value)}
                      />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Origem</span>
                      <input value={form.source} onChange={(e) => setField('source', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Categoria</span>
                      <input value={form.category} onChange={(e) => setField('category', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell">
                      <span>Nicho</span>
                      <input value={form.niche} onChange={(e) => setField('niche', e.target.value)} />
                    </label>
                    <label className="rl-ficha-cell is-wide">
                      <span>Observações</span>
                      <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {lead.scheduled_call_at || lead.uninterest_reason ? (
                    <div className="rl-ficha-alerts">
                      {lead.scheduled_call_at ? (
                        <p className="rl-ficha-alert is-call">
                          <Calendar className="w-4 h-4" aria-hidden />
                          <span>
                            Call em <strong>{formatDateTime(lead.scheduled_call_at)}</strong>
                            {lead.call_notes ? ` · ${lead.call_notes}` : ''}
                          </span>
                        </p>
                      ) : null}
                      {lead.uninterest_reason ? (
                        <p className="rl-ficha-alert is-warn">
                          <span>
                            Descartado: <strong>{lead.uninterest_reason}</strong>
                          </span>
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <section className="rl-ficha-sec">
                    <h3>Contato</h3>
                    <dl className="rl-fd-list">
                      <Field label="Pessoa">{showContact ? contactName : <em>Não informado</em>}</Field>
                      <Field label="Telefone">
                        {phone ? (
                          <>
                            <a href={`tel:${phone.replace(/\D/g, '')}`}>{formatPhone(phone)}</a>
                            <CopyButton value={formatPhone(phone)} label="Copiar telefone" />
                          </>
                        ) : (
                          <em>Sem telefone</em>
                        )}
                      </Field>
                      <Field label="WhatsApp">
                        {whatsappInvalid ? (
                          <em className="is-warn">Número inválido</em>
                        ) : cellWhatsapp ? (
                          samePhone(phone, cellWhatsapp) ? 'Mesmo do telefone' : formatPhone(cellWhatsapp)
                        ) : (
                          <em>Sem celular</em>
                        )}
                      </Field>
                      <Field label="E-mail">
                        {lead.email ? (
                          <>
                            <span className={emailBounced ? 'rl-fd-ellipsis is-warn' : 'rl-fd-ellipsis'} title={lead.email}>
                              {lead.email}
                            </span>
                            <CopyButton value={lead.email} label="Copiar e-mail" />
                          </>
                        ) : (
                          <em>Sem e-mail</em>
                        )}
                      </Field>
                      <Field label="Vendedor">
                        <select
                          className="rl-fd-select"
                          value={lead.assigned_to || ''}
                          disabled={assigning || !onAssign || isPending}
                          onChange={(e) => onAssign?.(lead.id, e.target.value ? e.target.value : null)}
                          aria-label="Vendedor responsável"
                        >
                          <option value="">Fila pública</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name || m.email}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </dl>
                  </section>

                  <section className="rl-ficha-sec">
                    <h3>Observações</h3>
                    {lead.notes ? (
                      <p className="rl-ficha-notes">{lead.notes}</p>
                    ) : (
                      <button type="button" className="rl-ficha-notes is-empty" onClick={() => setEditing(true)}>
                        Nenhuma observação. Clique para adicionar.
                      </button>
                    )}
                  </section>

                  <section className="rl-ficha-sec">
                    <h3>Empresa</h3>
                    <dl className="rl-fd-list">
                      <Field label="Razão social" wide>
                        {(lead.company || '').trim() || <em>Não informada</em>}
                      </Field>
                      <Field label="CNPJ">
                        {lead.document ? (
                          <>
                            <span className="rl-fd-nowrap">{formatCnpj(lead.document)}</span>
                            <CopyButton value={formatCnpj(lead.document)} label="Copiar CNPJ" />
                            <a
                              className="rl-fd-copy"
                              href={`https://www.google.com/search?q=${encodeURIComponent(lead.document + ' ' + primary)}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Buscar no Google"
                              title="Buscar no Google"
                            >
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                            </a>
                          </>
                        ) : (
                          <em>Sem CNPJ</em>
                        )}
                      </Field>
                      <Field label="Cidade">{city || <em>Não informada</em>}</Field>
                      <Field label="Atividade" wide>
                        {lead.main_activity ? (
                          <span className="rl-fd-wrap">
                            {lead.main_activity}
                            {cnae ? <small> · CNAE {cnae}</small> : null}
                          </span>
                        ) : (
                          <em>Não informada</em>
                        )}
                      </Field>
                      {companyFacts
                        .filter((fact) => fact.value && fact.value !== '—')
                        .map((fact) => (
                          <Field key={fact.label} label={fact.label}>
                            {fact.value}
                          </Field>
                        ))}
                    </dl>
                    {missingFacts.length ? <p className="rl-fd-missing">Sem informação: {missingFacts.join(', ')}</p> : null}
                  </section>

                  <footer className="rl-ficha-foot">
                    <p>
                      Cadastrado em {formatDateTime(lead.created_at)}
                      <br />
                      Atualizado em {formatDateTime(lead.updated_at)}
                    </p>
                    <div>
                      <button type="button" className="rl-ficha-edit" onClick={() => setEditing(true)}>
                        <Pencil className="w-3.5 h-3.5" /> Editar ficha
                      </button>
                      <button
                        type="button"
                        className="rl-ficha-delete"
                        disabled={isPending}
                        onClick={() => {
                          setAskError(null);
                          setAsk('delete');
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </footer>
                </>
              )}
            </div>

            <div className="rl-ficha-side">
              <LeadHistoryPanel key={`${lead.id}-${historyTick}`} leadId={lead.id} />
            </div>
          </div>
        </div>

        {pager('foot')}

        {ask ? (
          <div className="rl-wa-ask" role="dialog" aria-modal="true" aria-label="Confirmação">
            <div className="rl-wa-ask-card">
              {ask === 'wa' ? (
                <>
                  <p>Conseguiu enviar a mensagem no WhatsApp?</p>
                  {askError ? <strong>{askError}</strong> : null}
                  <div className="rl-wa-ask-actions">
                    <button type="button" className="is-yes" disabled={isPending} onClick={() => logActivity('WHATSAPP', 'Mensagem enviada')}>
                      Sim, registrar
                    </button>
                    <button type="button" className="is-no" disabled={isPending} onClick={markWhatsappInvalid}>
                      Não, número inválido
                    </button>
                  </div>
                  <button type="button" className="rl-wa-ask-skip" onClick={closeAsk}>
                    Agora não
                  </button>
                </>
              ) : null}
              {ask === 'call' ? (
                <>
                  <p>Como foi a ligação?</p>
                  {askError ? <strong>{askError}</strong> : null}
                  <div className="rl-wa-ask-actions">
                    <button type="button" className="is-yes" disabled={isPending} onClick={() => logActivity('LIGAÇÃO', 'Atendeu')}>
                      Atendeu
                    </button>
                    <button type="button" className="is-no" disabled={isPending} onClick={() => logActivity('LIGAÇÃO', 'Não atendeu')}>
                      Não atendeu
                    </button>
                  </div>
                  <button type="button" className="rl-wa-ask-skip" onClick={closeAsk}>
                    Não liguei
                  </button>
                </>
              ) : null}
              {ask === 'won' ? (
                <>
                  <p>Marcar &quot;{primary}&quot; como ganho?</p>
                  <small>O lead vira cliente automaticamente.</small>
                  {askError ? <strong>{askError}</strong> : null}
                  <div className="rl-wa-ask-actions">
                    <button type="button" className="is-yes" disabled={isPending} onClick={() => applyStatus('GANHO')}>
                      Marcar ganho
                    </button>
                    <button type="button" className="is-neutral" disabled={isPending} onClick={closeAsk}>
                      Cancelar
                    </button>
                  </div>
                </>
              ) : null}
              {ask === 'discard' ? (
                <>
                  <p>Descartar este lead?</p>
                  <textarea
                    className="rl-wa-ask-input"
                    value={discardReason}
                    onChange={(e) => setDiscardReason(e.target.value)}
                    placeholder="Motivo (opcional)"
                    rows={2}
                    autoFocus
                  />
                  {askError ? <strong>{askError}</strong> : null}
                  <div className="rl-wa-ask-actions">
                    <button type="button" className="is-no" disabled={isPending} onClick={confirmDiscard}>
                      Descartar
                    </button>
                    <button type="button" className="is-neutral" disabled={isPending} onClick={closeAsk}>
                      Cancelar
                    </button>
                  </div>
                </>
              ) : null}
              {ask === 'delete' ? (
                <>
                  <p>Excluir &quot;{primary}&quot;?</p>
                  <small>Esta ação não pode ser desfeita.</small>
                  {askError ? <strong>{askError}</strong> : null}
                  <div className="rl-wa-ask-actions">
                    <button type="button" className="is-no" disabled={isPending} onClick={confirmDelete}>
                      Excluir
                    </button>
                    <button type="button" className="is-neutral" disabled={isPending} onClick={closeAsk}>
                      Cancelar
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
