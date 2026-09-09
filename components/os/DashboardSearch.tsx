'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const DESTINATIONS = [
  { href: '/leads', label: 'Leads' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/projetos', label: 'Projetos' },
  { href: '/orcamentos', label: 'Orçamentos' },
  { href: '/demandas', label: 'Demandas' },
] as const;

export function DashboardSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [dest, setDest] = useState<(typeof DESTINATIONS)[number]['href']>('/leads');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `${dest}?q=${encodeURIComponent(term)}` : dest);
  }

  return (
    <form onSubmit={onSubmit} className="os-page-search z-10">
      <div className="relative min-w-0">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente, projeto ou lead..."
          className="cnpja-input pl-9 text-xs"
        />
      </div>
      <select
        value={dest}
        onChange={(e) => setDest(e.target.value as (typeof DESTINATIONS)[number]['href'])}
        className="cnpja-input text-xs"
        aria-label="Onde buscar"
      >
        {DESTINATIONS.map((item) => (
          <option key={item.href} value={item.href}>
            {item.label}
          </option>
        ))}
      </select>
      <button type="submit" className="cnpja-button-primary text-xs">
        Buscar
      </button>
    </form>
  );
}
