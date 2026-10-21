import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}


const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Data em dd/mm/aaaa no fuso de Brasília. Colunas DATE ('2026-10-21') são lidas como data
 * pura: `new Date('2026-10-21')` vira meia-noite UTC e aparece como o dia anterior no Brasil.
 */
export function formatDateBR(value?: string | null, fallback = '—') {
  if (!value) return fallback;
  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}
