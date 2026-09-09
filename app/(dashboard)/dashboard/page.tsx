import { getDashboardMetrics } from '@/actions/os';
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  FolderKanban,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardSearch } from '@/components/os/DashboardSearch';
import { OsPage, OsPageBanner } from '@/components/os/OsPage';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <OsPage>
      <OsPageBanner>
        <div className="space-y-1 z-10 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight break-words">
            Painel Operacional
          </h1>
          <p className="text-xs text-slate-400">
            Interface de alta densidade para gestão de leads, orçamentos, projetos e financeiro.
          </p>
        </div>

        <DashboardSearch />
      </OsPageBanner>

      {/* Financial Overview Cards com dados reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="cnpja-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Receita Total (Pago)</span>
            <span className="cnpja-badge-success">
              <DollarSign className="w-3.5 h-3.5" /> Recebido
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white font-mono break-all">
              R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total em caixa acumulado
            </p>
          </div>
        </div>

        <div className="cnpja-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Despesas Totais (Pago)</span>
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
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lucro Líquido</span>
            <span className="cnpja-badge-info">
              <TrendingUp className="w-3.5 h-3.5" /> Resultado
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white font-mono break-all">
              R$ {metrics.estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400">Resultado consolidado (Receitas - Despesas)</p>
          </div>
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/leads" className="cnpja-card flex items-center gap-3.5 py-4 hover:border-purple-500/40">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Leads Ativos</p>
            <p className="text-lg font-bold text-white">{metrics.activeLeadsCount}</p>
          </div>
        </Link>

        <Link href="/orcamentos" className="cnpja-card flex items-center gap-3.5 py-4 hover:border-amber-500/40">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Orçamentos Ativos</p>
            <p className="text-lg font-bold text-white">{metrics.sentQuotesCount}</p>
          </div>
        </Link>

        <Link href="/projetos" className="cnpja-card flex items-center gap-3.5 py-4 hover:border-cyan-500/40">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Projetos em Andamento</p>
            <p className="text-lg font-bold text-white">{metrics.activeProjectsCount}</p>
          </div>
        </Link>

        <Link href="/demandas" className="cnpja-card flex items-center gap-3.5 py-4 hover:border-blue-500/40">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Demandas Abertas</p>
            <p className="text-lg font-bold text-white">{metrics.openTasksCount}</p>
          </div>
        </Link>
      </div>

      {/* Data Table Preview de Projetos Recentes */}
      <div className="space-y-3">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 min-w-0">
            <FolderKanban className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">Projetos recentes</span>
          </h3>
          <Link href="/projetos" className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 shrink-0 min-h-11">
            Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="cnpja-table-container">
          <table className="cnpja-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Cliente</th>
                <th>Valor Contratado</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentProjects.length > 0 ? (
                metrics.recentProjects.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-white">{p.name}</td>
                    <td className="text-slate-300">{p.client?.name || 'Cliente'}</td>
                    <td className="font-mono text-emerald-400 font-bold">
                      R$ {Number(p.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {p.status === 'EM_ANDAMENTO' && <span className="cnpja-badge-info">Em Andamento</span>}
                      {p.status === 'PLANEJAMENTO' && <span className="cnpja-badge-warning">Planejamento</span>}
                      {p.status === 'CONCLUIDO' && <span className="cnpja-badge-success">Concluído</span>}
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
                  <div className="os-mobile-card-title">{p.name}</div>
                  {p.status === 'EM_ANDAMENTO' && <span className="cnpja-badge-info">Em Andamento</span>}
                  {p.status === 'PLANEJAMENTO' && <span className="cnpja-badge-warning">Planejamento</span>}
                  {p.status === 'CONCLUIDO' && <span className="cnpja-badge-success">Concluído</span>}
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
