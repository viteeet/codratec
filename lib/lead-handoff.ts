import type { LeadHandoff, LeadHandoffStatus } from '@/types/database';

type Option<T extends string> = { id: T; label: string };

export const SYSTEM_TYPE_OPTIONS: Option<NonNullable<LeadHandoff['system_type']>>[] = [
  { id: 'SITE', label: 'Site' },
  { id: 'SISTEMA_WEB', label: 'Sistema web' },
  { id: 'APP', label: 'App' },
  { id: 'AUTOMACAO', label: 'Automação' },
  { id: 'INTEGRACAO', label: 'Integração' },
  { id: 'OUTRO', label: 'Outro' },
];

export const BUDGET_OPTIONS: Option<NonNullable<LeadHandoff['budget_range']>>[] = [
  { id: 'ATE_5K', label: 'Até R$ 5 mil' },
  { id: '5K_15K', label: 'R$ 5–15 mil' },
  { id: '15K_50K', label: 'R$ 15–50 mil' },
  { id: 'ACIMA_50K', label: 'Acima de R$ 50 mil' },
  { id: 'NAO_INFORMADO', label: 'Não disse' },
];

export const URGENCY_OPTIONS: Option<NonNullable<LeadHandoff['urgency']>>[] = [
  { id: 'URGENTE', label: 'Urgente' },
  { id: 'ATE_3_MESES', label: 'Até 3 meses' },
  { id: 'SEM_PRESSA', label: 'Sem pressa' },
];

export const TEMPERATURE_OPTIONS: Option<NonNullable<LeadHandoff['temperature']>>[] = [
  { id: 'QUENTE', label: 'Quente' },
  { id: 'MORNO', label: 'Morno' },
  { id: 'FRIO', label: 'Frio' },
];

export const HANDOFF_STATUS_LABEL: Record<LeadHandoffStatus, string> = {
  ENVIADO: 'Enviado',
  EM_ANALISE: 'Em análise',
  PRECISA_INFO: 'Precisa de info',
  ORCAMENTO_CRIADO: 'Orçamento criado',
  CANCELADO: 'Cancelado',
};

export const OPEN_HANDOFF_STATUSES: LeadHandoffStatus[] = ['ENVIADO', 'EM_ANALISE', 'PRECISA_INFO'];

export function optionLabel<T extends string>(options: Option<T>[], id?: string | null) {
  if (!id) return null;
  return options.find((o) => o.id === id)?.label || id;
}

/** Quente primeiro, depois o que espera há mais tempo. */
export function sortHandoffQueue<T extends Pick<LeadHandoff, 'temperature' | 'created_at'>>(items: T[]) {
  const weight = (t?: string | null) => (t === 'QUENTE' ? 0 : t === 'MORNO' ? 1 : t === 'FRIO' ? 3 : 2);
  return [...items].sort((a, b) => {
    const w = weight(a.temperature) - weight(b.temperature);
    if (w !== 0) return w;
    return String(a.created_at || '').localeCompare(String(b.created_at || ''));
  });
}
