'use client';

import { useEffect, useState, useTransition } from 'react';
import { LeadCardActions } from '@/components/os/LeadCardActions';
import { SendLeadEmailButton } from '@/components/os/SendLeadEmailButton';
import { updateLead, deleteLead } from '@/actions/os';
import { LeadHistoryPanel } from '@/components/os/LeadHistoryPanel';
import { X, Phone, ExternalLink, Copy, Pencil, Trash2, Save } from 'lucide-react';

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
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>(() => toForm(lead));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setForm(toForm(lead));
    setEditing(false);
    setError(null);
  }, [lead?.id]);

  const { primary, secondary } = leadTitle(editing ? { ...lead, ...form } : lead);
  const phone = lead.whatsapp || lead.phone;
  const cnae = formatCnae(lead.cnae_code);
  const city = lead.city ? `${lead.city}${lead.state ? `/${lead.state}` : ''}` : null;

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
      setEditing(false);
    });
  };

  const handleDelete = () => {
    const ok = window.confirm(
      `Excluir o lead "${primary}"?\n\nEsta ação não pode ser desfeita.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onDeleted?.(lead.id);
      onClose();
    });
  };

  const fieldCls =
    'w-full h-7 border border-[color:var(--rl-drawer-border)] bg-[color:var(--rl-drawer-input)] px-1.5 text-[12px] text-[color:var(--rl-drawer-ink)]';

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/25"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <aside
        className="rl-drawer fixed z-50 inset-x-0 bottom-0 top-[env(safe-area-inset-top,0px)] h-[calc(100dvh-env(safe-area-inset-top,0px))] max-h-none w-full max-w-none overflow-y-auto border-t shadow-xl rounded-none pb-[env(safe-area-inset-bottom)] md:inset-auto md:top-[32px] md:bottom-[28px] md:right-0 md:left-auto md:h-auto md:w-full md:max-w-[360px] md:max-h-none md:rounded-none md:border-t-0 md:border-l md:pb-0"
        style={{ fontFamily: 'Calibri, Carlito, Segoe UI, Arial, sans-serif', fontSize: 12 }}
      >
        <div className="rl-drawer-head sticky top-0 z-10 border-b px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="rl-drawer-title text-[15px] font-semibold leading-snug">{primary}</h2>
              {secondary && <p className="rl-drawer-muted text-[11px] mt-0.5">{secondary}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rl-btn-on-dark inline-flex min-h-11 items-center gap-1 px-3 text-xs font-semibold"
                  title="Editar lead"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm(toForm(lead));
                    setError(null);
                  }}
                  className="inline-flex min-h-11 items-center border border-[#666] bg-[color:var(--rl-drawer-input)] px-3 text-xs font-semibold text-[color:var(--rl-drawer-ink)]"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 min-w-11 border border-[color:var(--rl-drawer-border)] bg-[color:var(--rl-drawer-input)] text-[color:var(--rl-drawer-ink)] items-center justify-center"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 space-y-4">
          {error && (
            <p className="border border-rose-300 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">
              {error}
            </p>
          )}

          {!editing && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex border border-[color:var(--rl-drawer-border)] rl-drawer-head px-1.5 py-0.5 text-[10px] font-semibold">
                {STATUS_LABEL[lead.status] || lead.status || '—'}
              </span>
              {lead.person_type && (
                <span className="text-[10px] rl-drawer-muted border border-[color:var(--rl-drawer-border)] px-1.5 py-0.5">
                  {lead.person_type}
                </span>
              )}
              {lead.source && (
                <span className="text-[10px] rl-drawer-muted border border-[color:var(--rl-drawer-border)] px-1.5 py-0.5">
                  {lead.source}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1 border border-[color:var(--rl-drawer-border)] rl-drawer-panel p-2">
            <label className="block text-[10px] rl-drawer-muted">Atribuir a</label>
            <select
              className="rl-assign w-full"
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
          </div>

          {editing ? (
            <div className="space-y-2 border border-[color:var(--rl-drawer-border)] p-2 rl-drawer-panel">
              <p className="text-[10px] font-semibold rl-drawer-muted uppercase tracking-wide">
                Editar lead
              </p>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Nome *</span>
                <input
                  className={fieldCls}
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Nome fantasia</span>
                <input
                  className={fieldCls}
                  value={form.trade_name}
                  onChange={(e) => setField('trade_name', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Razão social</span>
                <input
                  className={fieldCls}
                  value={form.company}
                  onChange={(e) => setField('company', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">CNPJ</span>
                <input
                  className={fieldCls}
                  value={form.document}
                  onChange={(e) => setField('document', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="block space-y-0.5">
                  <span className="text-[10px] rl-drawer-muted">E-mail</span>
                  <input
                    className={fieldCls}
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] rl-drawer-muted">Telefone</span>
                  <input
                    className={fieldCls}
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">WhatsApp</span>
                <input
                  className={fieldCls}
                  value={form.whatsapp}
                  onChange={(e) => setField('whatsapp', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-[1fr_64px] gap-2">
                <label className="block space-y-0.5">
                  <span className="text-[10px] rl-drawer-muted">Cidade</span>
                  <input
                    className={fieldCls}
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] rl-drawer-muted">UF</span>
                  <input
                    className={fieldCls}
                    value={form.state}
                    maxLength={2}
                    onChange={(e) => setField('state', e.target.value.toUpperCase())}
                  />
                </label>
              </div>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">CNAE / Atividade</span>
                <input
                  className={fieldCls}
                  value={form.main_activity}
                  onChange={(e) => setField('main_activity', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Código CNAE</span>
                <input
                  className={fieldCls}
                  value={form.cnae_code}
                  onChange={(e) => setField('cnae_code', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Início da atividade</span>
                <input
                  className={fieldCls}
                  type="date"
                  value={form.opened_at}
                  onChange={(e) => setField('opened_at', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="block space-y-0.5">
                  <span className="text-[10px] rl-drawer-muted">Capital social</span>
                  <input
                    className={fieldCls}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.share_capital}
                    onChange={(e) => setField('share_capital', e.target.value)}
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] rl-drawer-muted">Faturamento</span>
                  <input
                    className={fieldCls}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.annual_revenue}
                    onChange={(e) => setField('annual_revenue', e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Status</span>
                <select
                  className={fieldCls}
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Origem</span>
                <input
                  className={fieldCls}
                  value={form.source}
                  onChange={(e) => setField('source', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] rl-drawer-muted">Observações</span>
                <textarea
                  className="w-full border border-[#8f8f8f] bg-[color:var(--rl-drawer-input)] px-1.5 py-1 text-[12px] text-[color:var(--rl-drawer-ink)] min-h-[64px]"
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSave}
                className="inline-flex h-7 w-full items-center justify-center gap-1 rl-btn-success text-[12px] font-semibold disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isPending ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          ) : (
            <dl className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] gap-x-2 gap-y-2 text-[12px]">
              <dt className="rl-drawer-muted">CNPJ</dt>
              <dd className="font-mono flex items-center gap-1">
                {formatCnpj(lead.document)}
                {lead.document && (
                  <button
                    type="button"
                    className="text-[#0563c1]"
                    onClick={() => copyText(formatCnpj(lead.document))}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </dd>

              <dt className="rl-drawer-muted">CNAE</dt>
              <dd>
                {cnae || '—'}
                {lead.main_activity ? (
                  <span className="block rl-drawer-muted mt-0.5">{lead.main_activity}</span>
                ) : null}
              </dd>

              <dt className="rl-drawer-muted">Cidade</dt>
              <dd>{city || '—'}</dd>

              <dt className="rl-drawer-muted">Abertura</dt>
              <dd>{formatDate(lead.opened_at)}</dd>

              <dt className="rl-drawer-muted">Capital</dt>
              <dd>{formatMoney(lead.share_capital)}</dd>

              <dt className="rl-drawer-muted">Faturamento</dt>
              <dd>{formatMoney(lead.annual_revenue)}</dd>

              <dt className="rl-drawer-muted">Vendedor</dt>
              <dd>{lead.assigned?.full_name || 'Fila pública'}</dd>

              <dt className="rl-drawer-muted">Telefone</dt>
              <dd>
                {phone ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-[#0563c1] font-mono">
                      {formatPhone(phone)}
                    </a>
                    {lead.whatsapp && (
                      <a
                        href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] border border-emerald-600 text-emerald-700 px-1.5 py-0.5 font-bold"
                      >
                        <Phone className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  '—'
                )}
              </dd>

              <dt className="rl-drawer-muted">E-mail</dt>
              <dd>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-[#0563c1] break-all">
                    {lead.email}
                  </a>
                ) : (
                  '—'
                )}
              </dd>

              {lead.scheduled_call_at && (
                <>
                  <dt className="rl-drawer-muted">Call</dt>
                  <dd className="rl-drawer-title">
                    {new Date(lead.scheduled_call_at).toLocaleString('pt-BR')}
                  </dd>
                </>
              )}

              {lead.call_notes && (
                <>
                  <dt className="rl-drawer-muted">Notas call</dt>
                  <dd className="whitespace-pre-wrap">{lead.call_notes}</dd>
                </>
              )}

              {lead.notes && (
                <>
                  <dt className="rl-drawer-muted">Observações</dt>
                  <dd className="whitespace-pre-wrap">{lead.notes}</dd>
                </>
              )}

              {lead.uninterest_reason && (
                <>
                  <dt className="rl-drawer-muted">Descarte</dt>
                  <dd className="text-rose-600">{lead.uninterest_reason}</dd>
                </>
              )}
            </dl>
          )}

          <LeadHistoryPanel leadId={lead.id} />

          <div className="border-t border-[color:var(--rl-drawer-border)] pt-3 space-y-2">
            <p className="text-[10px] font-semibold rl-drawer-muted uppercase tracking-wide">Ações</p>
            <div className="flex flex-wrap items-center gap-2">
              {canSendEmail && (
                <SendLeadEmailButton
                  leadId={lead.id}
                  leadName={primary}
                  leadEmail={lead.email}
                  lead={lead}
                  templates={templates}
                />
              )}
              <LeadCardActions
                leadId={lead.id}
                leadName={primary}
                currentStatus={lead.status || 'NOVO'}
                compact
              />
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-[11px] border border-rose-800 bg-rose-50 text-rose-950 px-2 py-1 font-semibold disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" /> Excluir
              </button>
            </div>
            {lead.document && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(lead.document + ' ' + primary)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] text-[#0563c1]"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buscar no Google
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
