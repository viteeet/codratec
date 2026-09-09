'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewProjectModal } from '@/components/os/NewProjectModal';
import { OsPage, OsPageCount, OsPageHeader, OsPageToolbar } from '@/components/os/OsPage';
import { Search } from 'lucide-react';

function statusBadge(status?: string | null) {
  if (status === 'EM_ANDAMENTO') return <span className="cnpja-badge-info">Em Andamento</span>;
  if (status === 'PLANEJAMENTO') return <span className="cnpja-badge-warning">Planejamento</span>;
  if (status === 'CONCLUIDO') return <span className="cnpja-badge-success">Concluído</span>;
  if (status === 'PAUSADO') return <span className="cnpja-badge-danger">Pausado</span>;
  return null;
}

function money(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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
        description="Setup, mensalidade recorrente, fidelidade de 12 meses e acompanhamento de entregas."
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

      <OsPageCount>
        {filtered.length} de {projects.length} projeto{projects.length === 1 ? '' : 's'}
      </OsPageCount>

      {filtered.length > 0 ? (
        <ul className="os-mobile-cards">
          {filtered.map((p) => {
            const setupAmount = Number(p.setup_amount || 2500);
            const monthlyAmount = Number(p.monthly_amount || 600);
            const duration = Number(p.contract_duration_months || 12);
            const yearOneTotal = setupAmount + monthlyAmount * duration;
            return (
              <li key={p.id} className="os-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="os-mobile-card-title">{p.name}</div>
                  {statusBadge(p.status)}
                </div>
                {p.description ? <div className="os-mobile-card-sub">{p.description}</div> : null}
                <div className="os-mobile-card-sub">
                  {p.client?.name || 'Cliente'}
                  {p.client?.company ? ` (${p.client.company})` : ''}
                </div>
                <div className="os-mobile-card-row">
                  <span className="font-mono text-emerald-400 font-bold">Setup R$ {money(setupAmount)}</span>
                  <span className="font-mono text-blue-400 font-semibold">R$ {money(monthlyAmount)}/mês</span>
                </div>
                <div className="os-mobile-card-row">
                  <span className="cnpja-badge-info">{duration} meses</span>
                  <span className="text-amber-400 font-mono">
                    {p.next_billing_date ? new Date(p.next_billing_date).toLocaleDateString('pt-BR') : '-'}
                  </span>
                  <span className="font-mono text-purple-300 font-bold">Ano 1 R$ {money(yearOneTotal)}</span>
                </div>
                <div className="pt-1">
                  <NewProjectModal clients={clients} members={members} project={p} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="os-mobile-cards text-center py-8 text-slate-500">
          {projects.length === 0
            ? 'Nenhum projeto cadastrado no Plano de Continuidade.'
            : 'Nenhum projeto com essa busca.'}
        </p>
      )}

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Projeto / Escopo</th>
              <th>Cliente / Contratante</th>
              <th>Setup (Implantação)</th>
              <th>Plano Mensal (Recorrência)</th>
              <th>Fidelidade</th>
              <th>Próximo Vencimento</th>
              <th>Valor Ano 1</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => {
                const setupAmount = Number(p.setup_amount || 2500);
                const monthlyAmount = Number(p.monthly_amount || 600);
                const duration = Number(p.contract_duration_months || 12);
                const yearOneTotal = setupAmount + monthlyAmount * duration;

                return (
                  <tr key={p.id}>
                    <td className="font-semibold text-white">
                      <p>{p.name}</p>
                      {p.description && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</p>
                      )}
                    </td>
                    <td className="text-slate-200">
                      {p.client?.name || 'Cliente'} {p.client?.company ? `(${p.client.company})` : ''}
                    </td>
                    <td className="font-mono text-emerald-400 font-bold">R$ {money(setupAmount)}</td>
                    <td className="font-mono text-blue-400 font-semibold">R$ {money(monthlyAmount)} /mês</td>
                    <td className="text-slate-300 font-mono text-xs">
                      <span className="cnpja-badge-info">{duration} meses</span>
                    </td>
                    <td className="text-xs font-mono text-amber-400">
                      {p.next_billing_date ? new Date(p.next_billing_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="font-mono text-purple-300 font-bold">R$ {money(yearOneTotal)}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td>
                      <NewProjectModal clients={clients} members={members} project={p} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-500">
                  {projects.length === 0
                    ? 'Nenhum projeto cadastrado no Plano de Continuidade. Clique no botão "Novo Projeto" para adicionar!'
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
