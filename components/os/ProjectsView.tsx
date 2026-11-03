'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewProjectModal } from '@/components/os/NewProjectModal';
import { OsEmpty, OsPage, OsPageCount, OsPageHeader } from '@/components/os/OsPage';
import { OsFilterBar } from '@/components/os/OsFilterBar';
import { ProjectStatusBadge, projectStatusList } from '@/components/os/project-status';
import Link from 'next/link';
import { formatDateBR } from '@/lib/utils';

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
  const [status, setStatus] = useState('');
  const createdId = searchParams.get('created') || '';
  const created = projects.find((p) => p.id === createdId);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (status && p.status !== status) return false;
      if (!term) return true;
      return [p.name, p.description, p.client?.name, p.client?.company]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [projects, q, status]);

  return (
    <OsPage>
      <OsPageHeader
        title="Projetos"
        description="Abra o projeto para ver status, demandas e cobranças."
      >
        <NewProjectModal clients={clients} members={members} />
      </OsPageHeader>

      <OsFilterBar
        className="os-xl-sheet"
        search={{ value: q, onChange: setQ, placeholder: 'Projeto ou cliente' }}
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: projectStatusList().map((item) => ({ value: item.id, label: item.label })),
          },
        ]}
        onClear={() => {
          setQ('');
          setStatus('');
        }}
        resultCount={filtered.length}
      />

      {created ? (
        <p className="quote-banner quote-banner--ok">
          Projeto criado a partir do orçamento aprovado: <strong>{created.name}</strong>
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
                <div className="os-mobile-card-sub os-mobile-card-sub--clamp">
                  {p.client?.name || 'Cliente'}
                  {p.client?.company ? ` (${p.client.company})` : ''}
                  {p.description ? ` · ${p.description}` : ''}
                </div>
                <div className="os-mobile-card-row">
                  <span className="font-mono text-emerald-400 font-bold">
                    {econ.recurring ? `R$ ${money(econ.monthly)}/mês` : `R$ ${money(econ.value)}`}
                  </span>
                  {econ.recurring ? (
                    <span className="text-slate-400">Próximo vencimento {formatDateBR(p.next_billing_date, '—')}</span>
                  ) : null}
                </div>
                <div className="os-mobile-card-actions os-mobile-card-actions--grid os-mobile-card-actions--row">
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
        <OsEmpty
          title={projects.length === 0 ? 'Nenhum projeto ainda.' : 'Nenhum projeto com esses filtros.'}
          hint={
            projects.length === 0
              ? 'Aprove um orçamento ou use Novo projeto.'
              : 'Limpe a busca ou escolha outro status.'
          }
        />
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
                      {formatDateBR(p.next_billing_date)}
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
                  {projects.length === 0 ? 'Nenhum projeto ainda.' : 'Nenhum projeto com esses filtros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </OsPage>
  );
}
