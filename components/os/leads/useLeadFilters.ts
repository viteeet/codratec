'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ageBucketOf,
  asDateKey,
  asNumber,
  hasEmail,
  hasPhone,
  hasScheduledCall,
  leadSearchText,
  normalizeSearch,
  revenueBucketOf,
  type AgeBucket,
  type EmailTrackFilter,
  type RevenueBucket,
} from '@/components/os/leads/lead-utils';

/** Estado dos filtros da tela de leads, opções dos selects e a lista já filtrada. */
export function useLeadFilters(leads: any[]) {
  const searchParams = useSearchParams();
  const [uf, setUf] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>(() =>
    (searchParams.get('status') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const [origins, setOrigins] = useState<string[]>([]);
  const [seller, setSeller] = useState('');
  const [temTelefone, setTemTelefone] = useState(false);
  const [semTelefone, setSemTelefone] = useState(false);
  const [temEmail, setTemEmail] = useState(false);
  const [semEmail, setSemEmail] = useState(false);
  const [temCall, setTemCall] = useState(false);
  const [emailTrack, setEmailTrack] = useState<EmailTrackFilter>('all');
  const [openedSince, setOpenedSince] = useState('');
  const [capitalMin, setCapitalMin] = useState('');
  const [capitalMax, setCapitalMax] = useState('');
  const [revenueMin, setRevenueMin] = useState('');
  const [revenueMax, setRevenueMax] = useState('');
  const [revenueBucket, setRevenueBucket] = useState<RevenueBucket>('all');
  const [ageBucket, setAgeBucket] = useState<AgeBucket>('all');
  const [q, setQ] = useState(() => searchParams.get('q') || '');

  const ufOptions = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.state) set.add(String(l.state).toUpperCase());
    });
    return Array.from(set).sort();
  }, [leads]);

  const cityOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      if (!l.city) return;
      if (uf && String(l.state || '').toUpperCase() !== uf) return;
      const key = String(l.city);
      map.set(key, key);
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [leads, uf]);

  const activityOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      const label = (l.main_activity || l.cnae_code || '').trim();
      if (!label) return;
      map.set(label, label);
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [leads]);

  const originOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      const value = String(l.source || '').trim();
      if (!value) return;
      const label = value.startsWith('Receita Federal') ? 'Receita Federal' : value;
      map.set(value, label);
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [leads]);

  // Texto de busca normalizado uma vez por lead, não a cada tecla.
  const searchIndex = useMemo(() => {
    const index = new Map<string, string>();
    leads.forEach((lead) => index.set(lead.id, leadSearchText(lead)));
    return index;
  }, [leads]);

  const deferredQ = useDeferredValue(q);

  const filteredLeads = useMemo(() => {
    const needle = normalizeSearch(deferredQ.trim());
    return leads.filter((lead) => {
      if (uf && String(lead.state || '').toUpperCase() !== uf) return false;
      if (cities.length > 0 && !cities.includes(String(lead.city || ''))) return false;
      if (activities.length > 0) {
        const act = (lead.main_activity || lead.cnae_code || '').trim();
        if (!activities.includes(act)) return false;
      }
      if (statuses.length > 0 && !statuses.includes(lead.status || '')) return false;
      if (origins.length > 0 && !origins.includes(String(lead.source || '').trim())) return false;
      if (seller === 'unassigned' && lead.assigned_to) return false;
      if (seller && seller !== 'unassigned' && lead.assigned_to !== seller) return false;
      if (temTelefone && !hasPhone(lead)) return false;
      if (semTelefone && hasPhone(lead)) return false;
      if (temEmail && !hasEmail(lead)) return false;
      if (semEmail && hasEmail(lead)) return false;
      if (temCall && !hasScheduledCall(lead)) return false;
      if (emailTrack === 'sem' && lead.last_email_status) return false;
      if (emailTrack === 'enviados' && !lead.last_email_status) return false;
      if (emailTrack === 'LIDO' && lead.last_email_status !== 'LIDO') return false;
      if (emailTrack === 'ENTREGUE' && !['ENTREGUE', 'LIDO'].includes(lead.last_email_status || '')) {
        return false;
      }
      if (emailTrack === 'ENVIADO' && lead.last_email_status !== 'ENVIADO') return false;
      if (emailTrack === 'REJEITADO' && lead.last_email_status !== 'REJEITADO') return false;
      if (openedSince) {
        const opened = asDateKey(lead.opened_at);
        if (!opened || opened < openedSince) return false;
      }
      const capital = asNumber(lead.share_capital);
      const capMin = asNumber(capitalMin.trim());
      const capMax = asNumber(capitalMax.trim());
      if (capMin != null && (capital == null || capital < capMin)) return false;
      if (capMax != null && (capital == null || capital > capMax)) return false;
      const revenue = asNumber(lead.annual_revenue);
      const revMin = asNumber(revenueMin.trim());
      const revMax = asNumber(revenueMax.trim());
      if (revMin != null && (revenue == null || revenue < revMin)) return false;
      if (revMax != null && (revenue == null || revenue > revMax)) return false;
      if (revenueBucket !== 'all' && revenueBucketOf(lead) !== revenueBucket) return false;
      if (ageBucket !== 'all' && ageBucketOf(lead) !== ageBucket) return false;
      if (needle && !searchIndex.get(lead.id)?.includes(needle)) return false;
      return true;
    });
  }, [leads, uf, cities, activities, statuses, origins, seller, temTelefone, semTelefone, temEmail, semEmail, temCall, emailTrack, openedSince, capitalMin, capitalMax, revenueMin, revenueMax, revenueBucket, ageBucket, deferredQ, searchIndex]);

  const activeFilterCount =
    (uf ? 1 : 0) +
    cities.length +
    activities.length +
    statuses.length +
    origins.length +
    (seller ? 1 : 0) +
    (temTelefone ? 1 : 0) +
    (semTelefone ? 1 : 0) +
    (temEmail ? 1 : 0) +
    (semEmail ? 1 : 0) +
    (temCall ? 1 : 0) +
    (emailTrack !== 'all' ? 1 : 0) +
    (openedSince ? 1 : 0) +
    (capitalMin.trim() || capitalMax.trim() ? 1 : 0) +
    (revenueMin.trim() || revenueMax.trim() ? 1 : 0) +
    (revenueBucket !== 'all' ? 1 : 0) +
    (ageBucket !== 'all' ? 1 : 0);


  const clearFilters = () => {
    setUf('');
    setCities([]);
    setActivities([]);
    setStatuses([]);
    setOrigins([]);
    setSeller('');
    setTemTelefone(false);
    setSemTelefone(false);
    setTemEmail(false);
    setSemEmail(false);
    setTemCall(false);
    setEmailTrack('all');
    setOpenedSince('');
    setCapitalMin('');
    setCapitalMax('');
    setRevenueMin('');
    setRevenueMax('');
    setRevenueBucket('all');
    setAgeBucket('all');
  };

  // Muda sempre que algum filtro muda; serve de dependência para voltar à página 1.
  const filterKey = JSON.stringify([uf, cities, activities, statuses, origins, seller, temTelefone, semTelefone, temEmail, semEmail, temCall, emailTrack, openedSince, capitalMin, capitalMax, revenueMin, revenueMax, revenueBucket, ageBucket, q]);

  return {
    uf,
    setUf,
    cities,
    setCities,
    activities,
    setActivities,
    statuses,
    setStatuses,
    origins,
    setOrigins,
    seller,
    setSeller,
    temTelefone,
    setTemTelefone,
    semTelefone,
    setSemTelefone,
    temEmail,
    setTemEmail,
    semEmail,
    setSemEmail,
    temCall,
    setTemCall,
    emailTrack,
    setEmailTrack,
    openedSince,
    setOpenedSince,
    capitalMin,
    setCapitalMin,
    capitalMax,
    setCapitalMax,
    revenueMin,
    setRevenueMin,
    revenueMax,
    setRevenueMax,
    revenueBucket,
    setRevenueBucket,
    ageBucket,
    setAgeBucket,
    q,
    setQ,
    ufOptions,
    cityOptions,
    activityOptions,
    originOptions,
    filteredLeads,
    activeFilterCount,
    clearFilters,
    filterKey,
  };
}

export type LeadFilters = ReturnType<typeof useLeadFilters>;
