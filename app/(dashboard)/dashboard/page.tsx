import { getDashboardMetrics } from '@/actions/os';
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  FolderKanban,
  CheckCircle2,
  ArrowUpRight,
  Phone,
  Mail,
  Trophy,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardSearch } from '@/components/os/DashboardSearch';
import { ProjectStatusBadge } from '@/components/os/project-status';
import { OsPage, OsPageHeader, OsPageToolbar } from '@/components/os/OsPage';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <OsPage>
      <OsPageHeader
        title="Painel operacional"
        description="Gestão de leads, orçamentos, projetos e financeiro."
      />

      <OsPageToolbar>
        <DashboardSearch />
      </OsPageToolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="cnpja-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Receita total (pago)</span>
            <span className="cnpja-badge-success">
              <DollarSign className="w-3.5 h-3.5" /> Recebido
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white font-mono break-all">
              R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 os-metric-accent" /> Total em caixa acumulado
            </p>
          </div>
        </div>

        <div className="cnpja-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Despesas totais (pago)</span>
            <span className="cnpja-badge-danger">
              <DollarSign className="w-3.5 h-3.5" /> Pago
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white font-mono break-all">
              R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400">Custos e despesas operacionais</p>
          </div>
        </div>

        <div className="cnpja-card space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lucro líquido</span>
            <span className="cnpja-badge-info">
              <TrendingUp className="w-3.5 h-3.5" /> Resultado
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white font-mono break-all">
              R$ {metrics.estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400">Resultado consolidado (receitas − despesas)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/leads" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <Users className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Leads ativos</span>
            <strong className="os-metric-value">{metrics.activeLeadsCount}</strong>
          </span>
        </Link>

        <Link href="/orcamentos" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <FileText className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Orçamentos ativos</span>
            <strong className="os-metric-value">{metrics.sentQuotesCount}</strong>
          </span>
        </Link>

        <Link href="/projetos" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <FolderKanban className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Projetos em andamento</span>
            <strong className="os-metric-value">{metrics.activeProjectsCount}</strong>
          </span>
        </Link>

        <Link href="/demandas" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Demandas abertas</span>
            <strong className="os-metric-value">{metrics.openTasksCount}</strong>
          </span>
        </Link>

        <Link href="/leads" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <UserPlus className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Novos no mês</span>
            <strong className="os-metric-value">{metrics.newLeadsThisMonth}</strong>
          </span>
        </Link>

        <Link href="/leads?status=CALL_AGENDADA" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <Phone className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Calls agendadas</span>
            <strong className="os-metric-value">{metrics.scheduledCallsCount}</strong>
          </span>
        </Link>

        <Link href="/leads" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <Mail className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">E-mails lidos</span>
            <strong className="os-metric-value">{metrics.emailsReadCount}</strong>
          </span>
        </Link>

        <Link href="/leads?status=GANHO" className="cnpja-card os-metric-card">
          <span className="os-metric-icon" aria-hidden>
            <Trophy className="w-5 h-5" />
          </span>
          <span>
            <span className="os-metric-label">Leads ganhos</span>
            <strong className="os-metric-value">{metrics.wonLeadsCount}</strong>
          </span>
        </Link>
      </div>

      <div className="cnpja-card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">Funil de leads</h3>
          <Link href="/leads" className="os-text-link">
            Abrir leads
          </Link>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {metrics.leadFunnel.map((row) => (
            <li key={row.id} className="min-w-0">
              <Link href={`/leads?status=${row.id}`} className="os-funnel-cell">
                <span>{row.label}</span>
                <strong>{row.count}</strong>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 min-w-0">
            <FolderKanban className="w-4 h-4 os-metric-accent shrink-0" />
            <span className="truncate">Projetos recentes</span>
          </h3>
          <Link href="/projetos" className="os-text-link">
            Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="cnpja-table-container">
          <table className="cnpja-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Cliente</th>
                <th>Valor contratado</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentProjects.length > 0 ? (
                metrics.recentProjects.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-white">
                      <Link href={`/projetos/${p.id}`} className="hover:text-blue-300">
                        {p.name}
                      </Link>
                    </td>
                    <td className="text-slate-300">{p.client?.name || 'Cliente'}</td>
                    <td className="font-mono text-emerald-400 font-bold">
                      R$ {Number(p.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <ProjectStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum projeto cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {metrics.recentProjects.length > 0 ? (
          <ul className="os-mobile-cards">
            {metrics.recentProjects.map((p) => (
              <li key={p.id} className="os-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="os-mobile-card-title">
                    <Link href={`/projetos/${p.id}`} className="hover:text-blue-300">
                      {p.name}
                    </Link>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <div className="os-mobile-card-sub">{p.client?.name || 'Cliente'}</div>
                <div className="os-mobile-card-row">
                  <span className="font-mono text-emerald-400 font-bold">
                    R$ {Number(p.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="os-mobile-cards text-center py-8 text-slate-500">Nenhum projeto cadastrado.</p>
        )}
      </div>
    </OsPage>
  );
}
