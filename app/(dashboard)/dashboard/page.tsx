import { getDashboardMetrics } from '@/actions/os';
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  FolderKanban,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="w-full h-full min-h-0 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/80 p-6 rounded-md relative overflow-hidden backdrop-blur-md">
        <div className="space-y-1 z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Painel Operacional
          </h1>
          <p className="text-xs text-slate-400">
            Interface de alta densidade para gestão de leads, orçamentos, projetos e financeiro.
          </p>
        </div>

        {/* Quick Search Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, projeto ou lead..."
              className="cnpja-input pl-9 text-xs"
            />
          </div>
        </div>
      </div>

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
            <p className="text-2xl font-bold text-white font-mono">
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
            <p className="text-2xl font-bold text-white font-mono">
              R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400">Custos e despesas operacionais</p>
          </div>
        </div>

        <div className="cnpja-card space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lucro Líquido</span>
            <span className="cnpja-badge-info">
              <TrendingUp className="w-3.5 h-3.5" /> Resultado
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white font-mono">
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-blue-400" />
            Visão Geral de Projetos Recentes
          </h3>
          <Link href="/projetos" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
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
    </div>
  );
}
