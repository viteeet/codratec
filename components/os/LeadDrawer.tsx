'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { LeadCardActions } from '@/components/os/LeadCardActions';
import { SendLeadEmailButton } from '@/components/os/SendLeadEmailButton';
import { getOpenLeadHandoff } from '@/actions/handoffs';
import { updateLead, deleteLead, createLeadActivity, markLeadWhatsappInvalid } from '@/actions/leads';
import { HANDOFF_STATUS_LABEL } from '@/lib/lead-handoff';
import type { LeadHandoffStatus } from '@/types/database';
import { LeadHistoryPanel } from '@/components/os/LeadHistoryPanel';
import { LeadEmailLog } from '@/components/os/LeadEmailLog';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';
import { X, Phone, ExternalLink, Copy, Pencil, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { cellWhatsAppNumber, getWhatsAppUrl, LEAD_WHATSAPP_TEXT } from '@/lib/whatsapp';
import { useConfirm, useToast } from '@/components/ui/Feedback';

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
  templates?: import('@/actions/email').EmailTemplateRow[];
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
  const confirm = useConfirm();
  const toast = useToast();
  const [openHandoff, setOpenHandoff] = useState<{ status: string } | null>(null);
  const [waAsk, setWaAsk] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canPrev = position > 0;
  const canNext = position >= 0 && position < total - 1;

  useEffect(() => {
    setForm(toForm(lead));
    setEditing(false);
    setError(null);
    setWaAsk(false);
    setWaError(null);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [lead?.id]);

  useEffect(() => {
    let active = true;
    setOpenHandoff(null);
    if (!lead?.id) return;
    getOpenLeadHandoff(lead.id).then((h) => {
      if (active) setOpenHandoff(h);
    });
    return () => {
      active = false;
    };
  }, [lead?.id]);

  const handleBriefingSent = () => {
    setOpenHandoff({ status: 'ENVIADO' });
    if (!['PROPOSTA', 'NEGOCIACAO', 'GANHO'].includes(lead.status)) {
      onUpdated?.({ ...lead, status: 'PROPOSTA' });
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (event.key === 'Escape') {
        event.preventDefault();
        if (waAsk) {
          setWaAsk(false);
          return;
        }
        onClose();
        return;
      }
      if (waAsk || typing) return;
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
  }, [canNext, canPrev, onClose, onNext, onPrev, waAsk]);

  const { primary, secondary } = leadTitle(editing ? { ...lead, ...form } : lead);
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

  const setField = (key: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      toast.success('Lead atualizado.');
      setEditing(false);
    });
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: `Excluir o lead "${primary}"?`, description: 'Esta ação não pode ser desfeita.' });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onDeleted?.(lead.id);
      toast.success('Lead excluído.');
      onClose();
    });
  };

  const confirmWhatsappSent = () => {
    setWaError(null);
    startTransition(async () => {
      const res = await createLeadActivity(lead.id, 'WHATSAPP', 'Mensagem enviada');
      if (res && 'error' in res) {
        setWaError(res.error);
        return;
      }
      setWaAsk(false);
      setHistoryTick((tick) => tick + 1);
    });
  };

  const markWhatsappInvalid = () => {
    setWaError(null);
    startTransition(async () => {
      const res = await markLeadWhatsappInvalid(lead.id);
      if (res && 'error' in res) {
        setWaError(res.error);
        return;
      }
      onUpdated?.({ ...(res.lead || lead), whatsapp_invalid: true });
      setWaAsk(false);
      setHistoryTick((tick) => tick + 1);
    });
  };

  const shown = editing ? { ...lead, ...form } : lead;
  const mark = primary
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <button type="button" className="rl-ficha-backdrop" aria-label="Fechar ficha" onClick={onClose} />
      <aside className="rl-drawer rl-ficha" role="dialog" aria-modal="true" aria-label="Ficha do lead">
        <header className="rl-ficha-head">
          <span className="rl-ficha-mark" aria-hidden>
            {mark || 'LD'}
          </span>
          <div className="min-w-0">
            <h2>{primary}</h2>
            {secondary ? <p>{secondary}</p> : null}
            <div className="rl-ficha-tags">
              <em>{STATUS_LABEL[shown.status] || shown.status || 'Sem status'}</em>
              {openHandoff ? (
                <span className="rl-ficha-handoff">
                  Briefing: {HANDOFF_STATUS_LABEL[openHandoff.status as LeadHandoffStatus] || openHandoff.status}
                </span>
              ) : null}
              {shown.source ? <span>{shown.source}</span> : null}
              {shown.person_type ? <span>{shown.person_type}</span> : null}
            </div>
          </div>
          <button type="button" className="rl-ficha-close" onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </header>

        <nav className="rl-ficha-pager" aria-label="Navegar leads">
          <button type="button" className="rl-ficha-pager-btn" disabled={!canPrev} onClick={onPrev}>
            <ChevronLeft className="w-5 h-5" aria-hidden />
            Anterior
          </button>
          <p>
            {position >= 0 ? (
              <>
                <strong>{position + 1}</strong>
                <span> de {total}</span>
              </>
            ) : (
              <span>Fora do filtro</span>
            )}
          </p>
          <button type="button" className="rl-ficha-pager-btn is-next" disabled={!canNext} onClick={onNext}>
            Próximo
            <ChevronRight className="w-5 h-5" aria-hidden />
          </button>
        </nav>

        <div className="rl-ficha-scroll" ref={scrollRef}>
          {error ? <p className="rl-ficha-error">{error}</p> : null}

          <div className="rl-ficha-body">
          <div className="rl-ficha-main">
          <div className="rl-ficha-quick">
            {phone ? (
              <a className="rl-ficha-act" href={`tel:${phone.replace(/\D/g, '')}`}>
                <Phone className="w-3.5 h-3.5" aria-hidden />
                Ligar
                <small>{formatPhone(phone)}</small>
              </a>
            ) : (
              <span className="rl-ficha-act is-off">
                <Phone className="w-3.5 h-3.5" aria-hidden />
                Ligar
                <small>Sem telefone</small>
              </span>
            )}
            {cellWhatsapp && !whatsappInvalid ? (
              <a
                className="rl-ficha-act is-wa"
                href={getWhatsAppUrl(cellWhatsapp, LEAD_WHATSAPP_TEXT) ?? '#'}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setWaError(null);
                  setWaAsk(true);
                }}
              >
                WhatsApp
                <small>{samePhone(phone, cellWhatsapp) ? 'Mesmo número' : formatPhone(cellWhatsapp)}</small>
              </a>
            ) : (
              <span className="rl-ficha-act is-off">
                WhatsApp
                <small>{whatsappInvalid ? 'Número inválido' : 'Sem celular'}</small>
              </span>
            )}
            {lead.email ? (
              <a className="rl-ficha-act" href={`mailto:${lead.email}`}>
                E-mail
                <small>{lead.email}</small>
              </a>
            ) : (
              <span className="rl-ficha-act is-off">
                E-mail
                <small>Sem e-mail</small>
              </span>
            )}
          </div>

          <div className="rl-ficha-bar">
            {!editing ? (
              <button type="button" className="rl-ficha-edit" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" /> Editar ficha
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="rl-ficha-grid">
            <label className="rl-ficha-cell is-wide">
              <span>Vendedor</span>
              <select
                value={lead.assigned_to || ''}
                disabled={assigning || !onAssign || isPending}
                onChange={(e) => onAssign?.(lead.id, e.target.value ? e.target.value : null)}
              >
                <option value="">Fila pública</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>
            </label>

            {editing ? (
              <>
                <label className="rl-ficha-cell">
                  <span>Nome</span>
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
                  <span>Status</span>
                  <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="rl-ficha-cell is-wide">
                  <span>E-mail</span>
                  <input value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </label>
                <label className="rl-ficha-cell">
                  <span>Telefone</span>
                  <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </label>
                <label className="rl-ficha-cell">
                  <span>WhatsApp</span>
                  <input value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} />
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
                  <span>Capital</span>
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
              </>
            ) : (
              <>
                <div className="rl-ficha-cell">
                  <span>Fantasia</span>
                  <strong>{(lead.trade_name || '').trim() || '—'}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Contato</span>
                  <strong>{showContact ? contactName : '—'}</strong>
                </div>
                <div className="rl-ficha-cell is-wide">
                  <span>Razão social</span>
                  <strong>{(lead.company || '').trim() || '—'}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>CNPJ</span>
                  <strong className="rl-ficha-copy">
                    {formatCnpj(lead.document)}
                    {lead.document ? (
                      <button type="button" onClick={() => copyText(formatCnpj(lead.document))} aria-label="Copiar CNPJ">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Cidade</span>
                  <strong>{city || '—'}</strong>
                </div>
                <div className="rl-ficha-cell is-wide">
                  <span>Atividade</span>
                  <strong>
                    {lead.main_activity || '—'}
                    {cnae ? <small>{cnae}</small> : null}
                  </strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Abertura</span>
                  <strong>{formatDate(lead.opened_at)}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Nicho</span>
                  <strong>{(lead.niche || lead.category || '').trim() || '—'}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Capital</span>
                  <strong>{formatMoney(lead.share_capital)}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Faturamento</span>
                  <strong>{formatMoney(lead.annual_revenue)}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Call</span>
                  <strong>{lead.scheduled_call_at ? formatDateTime(lead.scheduled_call_at) : '—'}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Disparo</span>
                  <strong>
                    {lead.last_email_status
                      ? EMAIL_STATUS_LABEL[lead.last_email_status as EmailTrackStatus] || lead.last_email_status
                      : 'Sem disparo'}
                    {lead.last_email_at ? <small>{formatDateTime(lead.last_email_at)}</small> : null}
                  </strong>
                </div>
                <div className="rl-ficha-cell is-wide">
                  <span>Observações</span>
                  <strong>{lead.notes || '—'}</strong>
                </div>
                {lead.call_notes ? (
                  <div className="rl-ficha-cell is-wide">
                    <span>Notas da call</span>
                    <strong>{lead.call_notes}</strong>
                  </div>
                ) : null}
                {lead.uninterest_reason ? (
                  <div className="rl-ficha-cell is-wide">
                    <span>Descarte</span>
                    <strong className="is-warn">{lead.uninterest_reason}</strong>
                  </div>
                ) : null}
                <div className="rl-ficha-cell">
                  <span>Cadastro</span>
                  <strong>{formatDateTime(lead.created_at)}</strong>
                </div>
                <div className="rl-ficha-cell">
                  <span>Atualizado</span>
                  <strong>{formatDateTime(lead.updated_at)}</strong>
                </div>
              </>
            )}
          </div>
          </div>

          <div className="rl-ficha-side">
          <LeadHistoryPanel key={`${lead.id}-${historyTick}`} leadId={lead.id} />
          <div className="rl-ficha-extra">
            <LeadEmailLog leadId={lead.id} />
          </div>

          <div className="rl-ficha-tools">
            {canSendEmail ? (
              <SendLeadEmailButton
                leadId={lead.id}
                leadName={primary}
                leadEmail={lead.email}
                lead={lead}
                templates={templates}
              />
            ) : null}
            <LeadCardActions
              leadId={lead.id}
              leadName={primary}
              currentStatus={lead.status || 'NOVO'}
              leadNotes={lead.notes}
              callNotes={lead.call_notes}
              hasOpenHandoff={Boolean(openHandoff)}
              onBriefingSent={handleBriefingSent}
              compact
            />
            <button type="button" className="rl-ficha-delete" disabled={isPending} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
            {lead.document ? (
              <a
                className="rl-ficha-google"
                href={`https://www.google.com/search?q=${encodeURIComponent(lead.document + ' ' + primary)}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buscar no Google
              </a>
            ) : null}
          </div>
          </div>
          </div>
        </div>
        {waAsk ? (
          <div className="rl-wa-ask" role="dialog" aria-modal="true" aria-label="Confirmar envio no WhatsApp">
            <div className="rl-wa-ask-card">
              <p>Conseguiu enviar a mensagem?</p>
              {waError ? <strong>{waError}</strong> : null}
              <div className="rl-wa-ask-actions">
                <button type="button" className="is-yes" disabled={isPending} onClick={confirmWhatsappSent}>
                  Sim
                </button>
                <button type="button" className="is-no" disabled={isPending} onClick={markWhatsappInvalid}>
                  Não
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
