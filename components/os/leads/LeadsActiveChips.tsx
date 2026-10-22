'use client';

import { OsActiveFilterChips, type OsActiveChip } from '@/components/os/OsFilterBar';
import { AGE_BUCKETS, REVENUE_BUCKETS, STATUS_SHORT } from '@/components/os/leads/lead-utils';
import type { LeadFilters } from '@/components/os/leads/useLeadFilters';

const EMAIL_TRACK_LABEL: Record<string, string> = {
  sem: 'Sem disparo',
  enviados: 'Com disparo',
  ENVIADO: 'E-mail enviado',
  ENTREGUE: 'E-mail entregue',
  LIDO: 'E-mail lido',
  REJEITADO: 'E-mail rejeitado',
};

function range(label: string, min: string, max: string) {
  if (min.trim() && max.trim()) return `${label} ${min.trim()}–${max.trim()}`;
  if (min.trim()) return `${label} ≥ ${min.trim()}`;
  return `${label} ≤ ${max.trim()}`;
}

/** Todos os filtros ativos da tela de leads como chips (barra do celular). */
export function LeadsActiveChips({ filters, members }: { filters: LeadFilters; members: any[] }) {
  const f = filters;
  const chips: OsActiveChip[] = [];

  if (f.uf) chips.push({ key: 'uf', label: `UF ${f.uf}`, onRemove: () => f.setUf('') });
  f.cities.forEach((c) =>
    chips.push({ key: `c-${c}`, label: c, onRemove: () => f.setCities((prev) => prev.filter((x) => x !== c)) }),
  );
  f.activities.forEach((a) =>
    chips.push({ key: `a-${a}`, label: a, onRemove: () => f.setActivities((prev) => prev.filter((x) => x !== a)) }),
  );
  f.statuses.forEach((s) =>
    chips.push({
      key: `st-${s}`,
      label: STATUS_SHORT[s] || s,
      onRemove: () => f.setStatuses((prev) => prev.filter((x) => x !== s)),
    }),
  );
  f.origins.forEach((o) =>
    chips.push({ key: `or-${o}`, label: o, onRemove: () => f.setOrigins((prev) => prev.filter((x) => x !== o)) }),
  );
  if (f.seller) {
    const member = members.find((m) => m.id === f.seller);
    chips.push({
      key: 'seller',
      label: f.seller === 'unassigned' ? 'Fila pública' : member?.full_name || member?.email || 'Vendedor',
      onRemove: () => f.setSeller(''),
    });
  }
  if (f.temTelefone) chips.push({ key: 'tel', label: 'Com telefone', onRemove: () => f.setTemTelefone(false) });
  if (f.semTelefone) chips.push({ key: 'semtel', label: 'Sem telefone', onRemove: () => f.setSemTelefone(false) });
  if (f.apenasWhatsapp) chips.push({ key: 'wa', label: 'Com WhatsApp', onRemove: () => f.setApenasWhatsapp(false) });
  if (f.temEmail) chips.push({ key: 'mail', label: 'Com e-mail', onRemove: () => f.setTemEmail(false) });
  if (f.semEmail) chips.push({ key: 'semmail', label: 'Sem e-mail', onRemove: () => f.setSemEmail(false) });
  if (f.temCall) chips.push({ key: 'call', label: 'Call agendada', onRemove: () => f.setTemCall(false) });
  if (f.emailTrack !== 'all') {
    chips.push({
      key: 'track',
      label: EMAIL_TRACK_LABEL[f.emailTrack] || f.emailTrack,
      onRemove: () => f.setEmailTrack('all'),
    });
  }
  if (f.openedSince) {
    chips.push({
      key: 'opened',
      label: `Abertas desde ${f.openedSince.split('-').reverse().join('/')}`,
      onRemove: () => f.setOpenedSince(''),
    });
  }
  if (f.capitalMin.trim() || f.capitalMax.trim()) {
    chips.push({
      key: 'capital',
      label: range('Capital', f.capitalMin, f.capitalMax),
      onRemove: () => {
        f.setCapitalMin('');
        f.setCapitalMax('');
      },
    });
  }
  if (f.revenueMin.trim() || f.revenueMax.trim()) {
    chips.push({
      key: 'revenue',
      label: range('Fat.', f.revenueMin, f.revenueMax),
      onRemove: () => {
        f.setRevenueMin('');
        f.setRevenueMax('');
      },
    });
  }
  if (f.revenueBucket !== 'all') {
    chips.push({
      key: 'rbucket',
      label: REVENUE_BUCKETS.find((b) => b.id === f.revenueBucket)?.label || f.revenueBucket,
      onRemove: () => f.setRevenueBucket('all'),
    });
  }
  if (f.ageBucket !== 'all') {
    chips.push({
      key: 'abucket',
      label: AGE_BUCKETS.find((b) => b.id === f.ageBucket)?.label || f.ageBucket,
      onRemove: () => f.setAgeBucket('all'),
    });
  }

  return <OsActiveFilterChips chips={chips} onClearAll={f.clearFilters} className="rl-mobile-chips" />;
}
