'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewProjectModal } from '@/components/os/NewProjectModal';
import { NewTaskModal } from '@/components/os/NewTaskModal';
import { OsPage, OsPageHeader } from '@/components/os/OsPage';
import { ProjectStatusBadge, projectStatusList, taskStatusLabel } from '@/components/os/project-status';
import { updateProjectStatus } from '@/actions/os';

function money(value: unknown) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function dateBr(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export function ProjectWorkspace({
  project,
  clients,
  members = [],
  justCreated = false,
}: {
  project: any;
  clients: { id: string; name: string; company?: string | null }[];
  members?: any[];
  justCreated?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const tasks = Array.isArray(project.tasks) ? project.tasks : [];
  const revenues = Array.isArray(project.revenues) ? project.revenues : [];
  const monthly = Number(project.monthly_amount) || 0;
  const openTasks = tasks.filter((t: any) => t.status !== 'DONE').length;
  const projectOption = [{ id: project.id, name: project.name }];

  return (
    <OsPage>
      <OsPageHeader
        title={project.name}
        description={
          project.client?.name
            ? `${project.client.name}${project.client.company ? ` · ${project.client.company}` : ''}`
            : 'Projeto operacional'
        }
      >
        <Link href="/projetos" className="cnpja-button-secondary text-sm">
          Lista
        </Link>
        <NewProjectModal clients={clients} members={members} project={project} />
        <NewTaskModal projects={projectOption} members={members} defaultProjectId={project.id} />
        <Link href={`/demandas?project=${project.id}`} className="cnpja-button-secondary text-sm">
          Kanban
        </Link>
      </OsPageHeader>

      {justCreated ? (
        <p className="quote-banner quote-banner--ok">
          Projeto criado. Status, equipe, demandas e financeiro ficam nesta ficha.
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="cnpja-card space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Status</p>
          <ProjectStatusBadge status={project.status} />
          <select
            value={project.status || 'PLANEJAMENTO'}
            disabled={isPending}
            onChange={(e) => {
              const next = e.target.value;
              startTransition(async () => {
                await updateProjectStatus(project.id, next);
                router.refresh();
              });
            }}
            className="cnpja-input text-xs"
            aria-label="Status do projeto"
          >
            {projectStatusList().map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="cnpja-card space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Investimento</p>
          <p className="text-xl font-bold text-white font-mono">R$ {money(project.value)}</p>
          {monthly > 0 ? (
            <p className="text-xs text-blue-300 font-mono">R$ {money(monthly)} /mês</p>
          ) : (
            <p className="text-xs text-slate-400">Projeto pontual</p>
          )}
        </div>
        <div className="cnpja-card space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Demandas</p>
          <p className="text-xl font-bold text-white">
            {openTasks} aberta{openTasks === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-slate-400">{tasks.length} no total</p>
        </div>
        <div className="cnpja-card space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Prazo</p>
          <p className="text-sm text-slate-200">Início {dateBr(project.start_date)}</p>
          <p className="text-xs text-slate-400">Previsão {dateBr(project.estimated_completion_date)}</p>
        </div>
      </div>

      <section className="cnpja-card space-y-3">
        <h2 className="text-sm font-bold text-white">Operação</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase text-slate-500">Cliente</dt>
            <dd>
              {project.client_id ? (
                <Link href={`/clientes/${project.client_id}`} className="text-blue-300 hover:underline">
                  {project.client?.name || 'Conta do cliente'}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase text-slate-500">Proposta</dt>
            <dd>
              {project.quote_id ? (
                <Link href={`/orcamentos/${project.quote_id}`} className="text-blue-300 hover:underline">
                  Ver orçamento de origem
                </Link>
              ) : (
                'Criado direto em Projetos'
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase text-slate-500">Escopo</dt>
            <dd className="text-slate-200 whitespace-pre-line">{project.description || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Demandas</h2>
          <NewTaskModal projects={projectOption} members={members} defaultProjectId={project.id} compact />
        </div>
        {tasks.length > 0 ? (
          <>
            <ul className="os-mobile-cards">
              {tasks.map((task: any) => (
                <li key={task.id} className="os-mobile-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="os-mobile-card-title">{task.title}</div>
                    <span className="cnpja-badge-info">{taskStatusLabel(task.status)}</span>
                  </div>
                  <div className="os-mobile-card-sub">
                    {task.assigned?.full_name || task.assigned?.email || 'Sem responsável'}
                    {task.due_date ? ` · ${dateBr(task.due_date)}` : ''}
                  </div>
                  <div className="os-mobile-card-actions">
                    <NewTaskModal projects={projectOption} members={members} task={task} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="cnpja-table-container">
              <table className="cnpja-table">
                <thead>
                  <tr>
                    <th>Demanda</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Responsável</th>
                    <th>Prazo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task: any) => (
                    <tr key={task.id}>
                      <td className="text-white font-semibold">{task.title}</td>
                      <td>{taskStatusLabel(task.status)}</td>
                      <td className="text-slate-300">{task.priority || 'NORMAL'}</td>
                      <td className="text-slate-300">{task.assigned?.full_name || task.assigned?.email || '—'}</td>
                      <td className="font-mono text-xs">{dateBr(task.due_date)}</td>
                      <td>
                        <NewTaskModal projects={projectOption} members={members} task={task} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 cnpja-card">Nenhuma demanda ainda. Crie a primeira para começar a execução.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white">Financeiro do projeto</h2>
        {revenues.length > 0 ? (
          <div className="cnpja-table-container">
            <table className="cnpja-table">
              <thead>
                <tr>
                  <th>Lançamento</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((row: any) => (
                  <tr key={row.id}>
                    <td className="text-white">{row.description}</td>
                    <td className="font-mono text-emerald-400">R$ {money(row.amount)}</td>
                    <td className="font-mono text-xs">{dateBr(row.due_date)}</td>
                    <td>
                      {row.status === 'PAGO' ? (
                        <span className="cnpja-badge-success">Pago</span>
                      ) : (
                        <span className="cnpja-badge-warning">{row.status || 'PENDENTE'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 cnpja-card">
            Sem lançamento ainda.{' '}
            <Link href="/financeiro" className="text-blue-300 hover:underline">
              Abrir financeiro
            </Link>
          </p>
        )}
      </section>
    </OsPage>
  );
}
