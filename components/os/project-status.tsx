const PROJECT_STATUSES = [
  { id: 'PLANEJAMENTO', label: 'Planejamento', kind: 'warning' },
  { id: 'EM_ANDAMENTO', label: 'Em andamento', kind: 'info' },
  { id: 'PAUSADO', label: 'Pausado', kind: 'danger' },
  { id: 'AGUARDANDO_CLIENTE', label: 'Aguardando cliente', kind: 'warning' },
  { id: 'CONCLUIDO', label: 'Concluído', kind: 'success' },
  { id: 'CANCELADO', label: 'Cancelado', kind: 'danger' },
] as const;

const TASK_STATUSES: Record<string, string> = {
  BACKLOG: 'Backlog',
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  BLOCKED: 'Bloqueado',
  REVIEW: 'Revisão',
  DONE: 'Concluído',
};

const BADGE: Record<string, string> = {
  success: 'cnpja-badge-success',
  warning: 'cnpja-badge-warning',
  danger: 'cnpja-badge-danger',
  info: 'cnpja-badge-info',
};

export function projectStatusList() {
  return PROJECT_STATUSES;
}

export function ProjectStatusBadge({ status }: { status?: string | null }) {
  const item = PROJECT_STATUSES.find((row) => row.id === status);
  return <span className={BADGE[item?.kind || 'warning']}>{item?.label || status || '—'}</span>;
}

export function taskStatusLabel(status?: string | null) {
  return TASK_STATUSES[status || ''] || status || '—';
}

const REVENUE_STATUSES: Record<string, { label: string; kind: keyof typeof BADGE }> = {
  PAGO: { label: 'Pago', kind: 'success' },
  PENDENTE: { label: 'Pendente', kind: 'warning' },
  ATRASADO: { label: 'Atrasado', kind: 'danger' },
  CANCELADO: { label: 'Cancelado', kind: 'danger' },
};

/** Status de receita ou despesa (Pago, Pendente, Atrasado, Cancelado). */
export function FinancialStatusBadge({ status }: { status?: string | null }) {
  const item = REVENUE_STATUSES[status || 'PENDENTE'];
  return <span className={BADGE[item?.kind || 'warning']}>{item?.label || status || '—'}</span>;
}

export function financialStatusKind(status?: string | null) {
  return REVENUE_STATUSES[status || 'PENDENTE']?.kind || 'warning';
}

const TASK_PRIORITIES: Record<string, string> = {
  BAIXA: 'Baixa',
  NORMAL: 'Normal',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export function taskPriorityLabel(priority?: string | null) {
  return TASK_PRIORITIES[priority || 'NORMAL'] || priority || 'Normal';
}
