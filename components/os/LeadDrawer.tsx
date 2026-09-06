'use client';

import { useEffect, useState, useTransition } from 'react';
import { LeadCardActions } from '@/components/os/LeadCardActions';
import { SendLeadEmailButton } from '@/components/os/SendLeadEmailButton';
import { updateLead, deleteLead } from '@/actions/os';
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
    notes: lead.notes || '',
    source: lead.source || '',
    status: lead.status || 'NOVO',
  };
}

export function LeadDrawer({
  lead,
  members = [],
  canSendEmail = false,
  onClose,
  onAssign,
  onUpdated,
  onDeleted,
  assigning = false,
}: {
  lead: any;
  members?: any[];
  canSendEmail?: boolean;
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
    'w-full h-7 border border-[#8f8f8f] bg-white px-1.5 text-[12px] text-[#222]';

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/25"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <aside
        className="fixed z-50 top-[32px] bottom-[28px] right-0 w-full max-w-[360px] overflow-y-auto border-l border-[#d0d0d0] bg-white text-[#222] shadow-xl"
        style={{ fontFamily: 'Calibri, Carlito, Segoe UI, Arial, sans-serif', fontSize: 12 }}
      >
        <div className="sticky top-0 z-10 border-b border-[#d0d0d0] bg-[#f2f2f2] px-3 py-2">
          <div className="flex items-start justify-between gap-2 pr-6">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold leading-snug text-[#1b365d]">{primary}</h2>
              {secondary && <p className="text-[11px] text-[#666] mt-0.5">{secondary}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex h-[22px] items-center gap-1 border border-[#1b365d] bg-[#1b365d] px-1.5 text-[10px] font-semibold text-white"
                  title="Editar lead"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm(toForm(lead));
                    setError(null);
                  }}
                  className="inline-flex h-[22px] items-center border border-[#8f8f8f] bg-white px-1.5 text-[10px]"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-[22px] w-[22px] border border-[#d0d0d0] bg-white text-[#444] flex items-center justify-center"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
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
              <span className="inline-flex border border-[#d0d0d0] bg-[#f2f2f2] px-1.5 py-0.5 text-[10px] font-semibold">
                {STATUS_LABEL[lead.status] || lead.status || '—'}
              </span>
              {lead.person_type && (
                <span className="text-[10px] text-[#666] border border-[#d0d0d0] px-1.5 py-0.5">
                  {lead.person_type}
                </span>
              )}
              {lead.source && (
                <span className="text-[10px] text-[#666] border border-[#d0d0d0] px-1.5 py-0.5">
                  {lead.source}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1 border border-[#d0d0d0] bg-[#fafafa] p-2">
            <label className="block text-[10px] text-[#666]">Atribuir a</label>
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
            <div className="space-y-2 border border-[#d0d0d0] p-2 bg-[#fafafa]">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wide">
                Editar lead
              </p>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Nome *</span>
                <input
                  className={fieldCls}
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Nome fantasia</span>
                <input
                  className={fieldCls}
                  value={form.trade_name}
                  onChange={(e) => setField('trade_name', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Razão social</span>
                <input
                  className={fieldCls}
                  value={form.company}
                  onChange={(e) => setField('company', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">CNPJ</span>
                <input
                  className={fieldCls}
                  value={form.document}
                  onChange={(e) => setField('document', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-[#666]">E-mail</span>
                  <input
                    className={fieldCls}
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-[#666]">Telefone</span>
                  <input
                    className={fieldCls}
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">WhatsApp</span>
                <input
                  className={fieldCls}
                  value={form.whatsapp}
                  onChange={(e) => setField('whatsapp', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-[1fr_64px] gap-2">
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-[#666]">Cidade</span>
                  <input
                    className={fieldCls}
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-[#666]">UF</span>
                  <input
                    className={fieldCls}
                    value={form.state}
                    maxLength={2}
                    onChange={(e) => setField('state', e.target.value.toUpperCase())}
                  />
                </label>
              </div>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">CNAE / Atividade</span>
                <input
                  className={fieldCls}
                  value={form.main_activity}
                  onChange={(e) => setField('main_activity', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Código CNAE</span>
                <input
                  className={fieldCls}
                  value={form.cnae_code}
                  onChange={(e) => setField('cnae_code', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Status</span>
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
                <span className="text-[10px] text-[#666]">Origem</span>
                <input
                  className={fieldCls}
                  value={form.source}
                  onChange={(e) => setField('source', e.target.value)}
                />
              </label>
              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Observações</span>
                <textarea
                  className="w-full border border-[#8f8f8f] bg-white px-1.5 py-1 text-[12px] min-h-[64px]"
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSave}
                className="inline-flex h-7 w-full items-center justify-center gap-1 bg-[#217346] text-white text-[12px] font-semibold disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isPending ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          ) : (
            <dl className="grid grid-cols-[88px_1fr] gap-x-2 gap-y-2 text-[12px]">
              <dt className="text-[#666]">CNPJ</dt>
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

              <dt className="text-[#666]">CNAE</dt>
              <dd>
                {cnae || '—'}
                {lead.main_activity ? (
                  <span className="block text-[#666] mt-0.5">{lead.main_activity}</span>
                ) : null}
              </dd>

              <dt className="text-[#666]">Cidade</dt>
              <dd>{city || '—'}</dd>

              <dt className="text-[#666]">Vendedor</dt>
              <dd>{lead.assigned?.full_name || 'Fila pública'}</dd>

              <dt className="text-[#666]">Telefone</dt>
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

              <dt className="text-[#666]">E-mail</dt>
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
                  <dt className="text-[#666]">Call</dt>
                  <dd className="text-[#1b365d]">
                    {new Date(lead.scheduled_call_at).toLocaleString('pt-BR')}
                  </dd>
                </>
              )}

              {lead.call_notes && (
                <>
                  <dt className="text-[#666]">Notas call</dt>
                  <dd className="whitespace-pre-wrap">{lead.call_notes}</dd>
                </>
              )}

              {lead.notes && (
                <>
                  <dt className="text-[#666]">Observações</dt>
                  <dd className="whitespace-pre-wrap">{lead.notes}</dd>
                </>
              )}

              {lead.uninterest_reason && (
                <>
                  <dt className="text-[#666]">Descarte</dt>
                  <dd className="text-rose-600">{lead.uninterest_reason}</dd>
                </>
              )}
            </dl>
          )}

          <div className="border-t border-[#d0d0d0] pt-3 space-y-2">
            <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wide">Ações</p>
            <div className="flex flex-wrap items-center gap-2">
              {canSendEmail && (
                <SendLeadEmailButton
                  leadId={lead.id}
                  leadName={primary}
                  leadEmail={lead.email}
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
                className="inline-flex items-center gap-1 text-[11px] border border-rose-700 text-rose-700 px-2 py-1 font-semibold disabled:opacity-50"
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
