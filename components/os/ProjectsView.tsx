'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewProjectModal } from '@/components/os/NewProjectModal';
import { OsPage, OsPageCount, OsPageHeader, OsPageToolbar } from '@/components/os/OsPage';
import { ProjectStatusBadge } from '@/components/os/project-status';
import { Search } from 'lucide-react';
import Link from 'next/link';

function money(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function projectEconomics(p: any) {
  const setup = Number(p.setup_amount) || 0;
  const monthly = Number(p.monthly_amount) || 0;
  const duration = Number(p.contract_duration_months) || 0;
  const value = Number(p.value) || 0;
  const recurring = monthly > 0;
  const yearOne = recurring ? setup + monthly * (duration || 12) : value;
  return { setup, monthly, duration: duration || (recurring ? 12 : 0), value, recurring, yearOne };
}

export function ProjectsView({
  projects,
  clients,
  members = [],
}: {
  projects: any[];
  clients: any[];
  members?: any[];
}) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') || '');
  const createdId = searchParams.get('created') || '';
  const created = projects.find((p) => p.id === createdId);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((p) =>
      [p.name, p.description, p.status, p.client?.name, p.client?.company]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [projects, q]);

  return (
    <OsPage>
      <OsPageHeader
        title="Projetos"
        description="Aprove uma proposta para nascer o projeto, ou crie um direto. Abra a ficha para status, demandas e financeiro."
      >
        <NewProjectModal clients={clients} members={members} />
      </OsPageHeader>

      <OsPageToolbar className="cnpja-card p-3">
        <div className="os-page-toolbar__field os-page-toolbar__field--search">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por projeto ou cliente..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>
        {q.trim() ? (
          <button type="button" onClick={() => setQ('')} className="cnpja-button-secondary text-xs min-h-11">
            Limpar
          </button>
        ) : null}
      </OsPageToolbar>

      {created ? (
        <p className="quote-banner quote-banner--ok">
          Projeto criado a partir da proposta aprovada: <strong>{created.name}</strong>
        </p>
      ) : null}

      <OsPageCount>
        {filtered.length} de {projects.length} projeto{projects.length === 1 ? '' : 's'}
      </OsPageCount>

      {filtered.length > 0 ? (
        <ul className="os-mobile-cards">
          {filtered.map((p) => {
            const econ = projectEconomics(p);
            return (
              <li key={p.id} className={`os-mobile-card${p.id === createdId ? ' quote-outcome--created' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="os-mobile-card-title">
                    <Link href={`/projetos/${p.id}`} className="hover:text-blue-300">
                      {p.name}
                    </Link>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </div>
                {p.description ? <div className="os-mobile-card-sub">{p.description}</div> : null}
                <div className="os-mobile-card-sub">
                  {p.client?.name || 'Cliente'}
                  {p.client?.company ? ` (${p.client.company})` : ''}
                </div>
                {econ.recurring ? (
                  <>
                    <div className="os-mobile-card-row">
                      <span className="font-mono text-emerald-400 font-bold">Setup R$ {money(econ.setup)}</span>
                      <span className="font-mono text-blue-400 font-semibold">R$ {money(econ.monthly)}/mês</span>
                    </div>
                    <div className="os-mobile-card-row">
                      <span className="cnpja-badge-info">{econ.duration} meses</span>
                      <span className="text-amber-400 font-mono">
                        {p.next_billing_date ? new Date(p.next_billing_date).toLocaleDateString('pt-BR') : '-'}
                      </span>
                      <span className="font-mono text-purple-300 font-bold">Ano 1 R$ {money(econ.yearOne)}</span>
                    </div>
                  </>
                ) : (
                  <div className="os-mobile-card-row">
                    <span className="font-mono text-emerald-400 font-bold">Investimento R$ {money(econ.value)}</span>
                  </div>
                )}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <Link href={`/projetos/${p.id}`} className="cnpja-button-primary text-xs min-h-11">
                    Abrir
                  </Link>
                  <NewProjectModal clients={clients} members={members} project={p} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="os-mobile-cards text-center py-8 text-slate-500">
          {projects.length === 0
            ? 'Nenhum projeto ainda. Aprove uma proposta ou clique em Novo Projeto.'
            : 'Nenhum projeto com essa busca.'}
        </p>
      )}

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Projeto / Escopo</th>
              <th>Cliente / Contratante</th>
              <th>Investimento</th>
              <th>Recorrência</th>
              <th>Prazo</th>
              <th>Próximo vencimento</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => {
                const econ = projectEconomics(p);

                return (
                  <tr key={p.id} className={p.id === createdId ? 'quote-outcome--created' : undefined}>
                    <td className="font-semibold text-white">
                      <p>
                        <Link href={`/projetos/${p.id}`} className="hover:text-blue-300">
                          {p.name}
                        </Link>
                      </p>
                      {p.description && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</p>
                      )}
                    </td>
                    <td className="text-slate-200">
                      {p.client?.name || 'Cliente'} {p.client?.company ? `(${p.client.company})` : ''}
                    </td>
                    <td className="font-mono text-emerald-400 font-bold">R$ {money(econ.recurring ? econ.setup : econ.value)}</td>
                    <td className="font-mono text-blue-400 font-semibold">
                      {econ.recurring ? `R$ ${money(econ.monthly)} /mês` : '—'}
                    </td>
                    <td className="text-slate-300 font-mono text-xs">
                      {econ.recurring ? <span className="cnpja-badge-info">{econ.duration} meses</span> : 'Pontual'}
                    </td>
                    <td className="text-xs font-mono text-amber-400">
                      {p.next_billing_date ? new Date(p.next_billing_date).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="font-mono text-purple-300 font-bold">R$ {money(econ.yearOne)}</td>
                    <td>
                      <ProjectStatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/projetos/${p.id}`} className="cnpja-button-primary text-xs min-h-11">
                          Abrir
                        </Link>
                        <NewProjectModal clients={clients} members={members} project={p} />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-500">
                  {projects.length === 0
                    ? 'Nenhum projeto ainda. Aprove uma proposta ou clique em Novo Projeto.'
                    : 'Nenhum projeto com essa busca.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </OsPage>
  );
}
