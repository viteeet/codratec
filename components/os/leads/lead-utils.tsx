import { type EmailTrackStatus } from '@/lib/email-status';
import { cellWhatsAppNumber, getWhatsAppUrl, LEAD_WHATSAPP_TEXT } from '@/lib/whatsapp';

export const PAGE_SIZES = [50, 100, 500] as const;

export type SortKey =
  | 'fantasia'
  | 'razao'
  | 'cnpj'
  | 'cnae'
  | 'cidade'
  | 'uf'
  | 'abertura'
  | 'capital'
  | 'fat'
  | 'status'
  | 'vend'
  | 'tel'
  | 'mail'
  | 'disparo';
export type SortState = { key: SortKey; dir: 'asc' | 'desc' } | null;

export const MAIN_PIPELINE_COLUMNS = [
  { id: 'NOVO', title: 'Novos Leads', color: 'border-blue-500' },
  { id: 'CONTATO', title: 'Contato Realizado', color: 'border-amber-500' },
  { id: 'QUALIFICADO', title: 'Qualificados', color: 'border-purple-500' },
  { id: 'CALL_AGENDADA', title: 'Call Agendada', color: 'border-indigo-500' },
  { id: 'PROPOSTA', title: 'Proposta Enviada', color: 'border-cyan-500' },
  { id: 'NEGOCIACAO', title: 'Negociação', color: 'border-orange-500' },
  { id: 'GANHO', title: 'Ganho / Fechado', color: 'border-emerald-500' },
];

export const SECONDARY_PIPELINE_COLUMNS = [
  { id: 'NAO_INTERESSADO', title: 'Não Interessados', color: 'border-rose-500' },
  { id: 'SEM_RESPOSTA', title: 'Sem Resposta', color: 'border-slate-600' },
  { id: 'FUTURO', title: 'Nutrir no Futuro', color: 'border-amber-600' },
];

export const KANBAN_COLUMNS = [...MAIN_PIPELINE_COLUMNS, ...SECONDARY_PIPELINE_COLUMNS];

export const STATUS_SHORT: Record<string, string> = {
  NOVO: 'Novo',
  CONTATO: 'Contato',
  QUALIFICADO: 'Qualificado',
  CALL_AGENDADA: 'Call',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHO: 'Ganho',
  NAO_INTERESSADO: 'Não interessado',
  SEM_RESPOSTA: 'Sem resposta',
  FUTURO: 'Futuro',
};

export const STATUS_OPTIONS = [
  ...MAIN_PIPELINE_COLUMNS.map((c) => ({
    id: c.id,
    label: STATUS_SHORT[c.id] || c.title,
  })),
  ...SECONDARY_PIPELINE_COLUMNS.map((c) => ({
    id: c.id,
    label: STATUS_SHORT[c.id] || c.title,
  })),
];

export function formatCnpj(value?: string | null) {
  if (!value) return '';
  const d = value.replace(/\D/g, '');
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatPhone(value?: string | null) {
  if (!value) return '';
  const d = value.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return value;
}

export function leadDisplay(lead: any) {
  const trade = (lead.trade_name || '').trim();
  const company = (lead.company || '').trim();
  const name = (lead.name || '').trim();
  const primary = trade || company || name || 'Sem nome';
  const secondary =
    company && company.toLowerCase() !== primary.toLowerCase() ? company : null;
  return { primary, secondary };
}

export function hasPhone(lead: any) {
  return !!(lead.whatsapp || lead.phone);
}

export function whatsappNumber(lead: any) {
  return cellWhatsAppNumber(lead.whatsapp, lead.phone);
}

export function hasWhatsApp(lead: any) {
  return !!whatsappNumber(lead) && !lead.whatsapp_invalid;
}

export function WhatsAppLink({ phone }: { phone: string }) {
  const url = getWhatsAppUrl(phone, LEAD_WHATSAPP_TEXT);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="rl-wa"
      onClick={(e) => e.stopPropagation()}
    >
      WhatsApp
    </a>
  );
}

export function hasEmail(lead: any) {
  return !!(lead.email && String(lead.email).trim());
}

export function formatMoney(value?: number | string | null) {
  if (value == null || value === '') return '';
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value?: string | null) {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return String(value);
  return `${d}/${m}/${y}`;
}

export function asNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function asDateKey(value: unknown): string | null {
  if (value == null || value === '') return null;
  const iso = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

export function hasScheduledCall(lead: any) {
  return Boolean(lead.scheduled_call_at);
}

export function normalizeSearch(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function leadSearchText(lead: any) {
  return normalizeSearch(
    [
      lead.name,
      lead.company,
      lead.trade_name,
      lead.document,
      lead.phone,
      lead.whatsapp,
      lead.email,
      lead.main_activity,
      lead.cnae_code,
      lead.city,
      lead.state,
      lead.source,
      lead.category,
      lead.niche,
      lead.notes,
      lead.status,
      lead.share_capital,
      lead.annual_revenue,
      lead.opened_at,
      STATUS_SHORT[lead.status || ''],
      lead.assigned?.full_name,
      lead.assigned?.email,
    ]
      .filter(Boolean)
      .join(' ')
  );
}

export const SORT_VALUE: Record<SortKey, (lead: any) => string | number | null> = {
  fantasia: (l) => leadDisplay(l).primary,
  razao: (l) => (l.company || l.name || l.trade_name || '').trim(),
  cnpj: (l) => (l.document || '').replace(/\D/g, ''),
  cnae: (l) => l.main_activity || l.cnae_code || '',
  cidade: (l) => l.city || '',
  uf: (l) => l.state || '',
  abertura: (l) => asDateKey(l.opened_at),
  capital: (l) => asNumber(l.share_capital),
  fat: (l) => asNumber(l.annual_revenue),
  status: (l) => STATUS_SHORT[l.status] || l.status || '',
  vend: (l) => l.assigned?.full_name || '',
  tel: (l) => l.whatsapp || l.phone || '',
  mail: (l) => l.email || '',
  disparo: (l) => l.last_email_status || '',
};

export type RevenueBucket = 'all' | 'sem' | 'micro' | 'small' | 'mid';
export type AgeBucket = 'all' | 'sem' | 'nova' | 'media' | 'madura';
export type EmailTrackFilter = 'all' | 'sem' | 'enviados' | EmailTrackStatus;

export const REVENUE_BUCKETS: { id: Exclude<RevenueBucket, 'all'>; label: string }[] = [
  { id: 'sem', label: 'Sem faturamento' },
  { id: 'micro', label: 'Até R$ 360 mil' },
  { id: 'small', label: 'R$ 360 mil – 4,8 mi' },
  { id: 'mid', label: 'Acima de R$ 4,8 mi' },
];

export const AGE_BUCKETS: { id: Exclude<AgeBucket, 'all'>; label: string }[] = [
  { id: 'sem', label: 'Sem data de abertura' },
  { id: 'nova', label: 'Até 2 anos' },
  { id: 'media', label: '2 a 10 anos' },
  { id: 'madura', label: 'Mais de 10 anos' },
];

export function revenueBucketOf(lead: any): Exclude<RevenueBucket, 'all'> {
  const n = asNumber(lead.annual_revenue);
  if (n == null) return 'sem';
  if (n < 360000) return 'micro';
  if (n < 4800000) return 'small';
  return 'mid';
}

export function companyAgeYears(openedAt: unknown): number | null {
  const key = asDateKey(openedAt);
  if (!key) return null;
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export function ageBucketOf(lead: any): Exclude<AgeBucket, 'all'> {
  const years = companyAgeYears(lead.opened_at);
  if (years == null) return 'sem';
  if (years <= 2) return 'nova';
  if (years <= 10) return 'media';
  return 'madura';
}

export function topRows(
  items: { id: string; label: string; count: number }[],
  limit = 12,
) {
  return items.slice(0, limit);
}
