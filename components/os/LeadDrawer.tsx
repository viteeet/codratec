'use client';

import { LeadCardActions } from '@/components/os/LeadCardActions';
import { SendLeadEmailButton } from '@/components/os/SendLeadEmailButton';
import { X, Phone, ExternalLink, Copy } from 'lucide-react';

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

const STATUS_LABEL: Record<string, string> = {
  NOVO: 'Novo',
  CONTATO: 'Contato',
  QUALIFICADO: 'Qualificado',
  CALL_AGENDADA: 'Call agendada',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHO: 'Ganho',
  NAO_INTERESSADO: 'Não interessado',
  SEM_RESPOSTA: 'Sem resposta',
  FUTURO: 'Futuro',
};

export function LeadDrawer({
  lead,
  members = [],
  canSendEmail = false,
  onClose,
  onAssign,
  assigning = false,
}: {
  lead: any;
  members?: any[];
  canSendEmail?: boolean;
  onClose: () => void;
  onAssign?: (leadId: string, assignedTo: string | null) => void;
  assigning?: boolean;
}) {
  const { primary, secondary } = leadTitle(lead);
  const phone = lead.whatsapp || lead.phone;
  const cnae = formatCnae(lead.cnae_code);
  const city = lead.city ? `${lead.city}${lead.state ? `/${lead.state}` : ''}` : null;

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
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#d0d0d0] bg-[#f2f2f2] px-3 py-2">
          <div className="min-w-0 pr-6">
            <h2 className="text-[15px] font-semibold leading-snug text-[#1b365d]">{primary}</h2>
            {secondary && <p className="text-[11px] text-[#666] mt-0.5">{secondary}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 h-[22px] w-[22px] border border-[#d0d0d0] bg-white text-[#444] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-3 py-3 space-y-4">
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

          <div className="space-y-1 border border-[#d0d0d0] bg-[#fafafa] p-2">
            <label className="block text-[10px] text-[#666]">Atribuir a</label>
            <select
              className="rl-assign w-full"
              value={lead.assigned_to || ''}
              disabled={assigning || !onAssign}
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
