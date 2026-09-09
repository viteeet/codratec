'use client';

import { useState, useTransition } from 'react';
import { getMonthlySalesPerformance } from '@/actions/os';
import { SetGoalModal } from '@/components/os/SetGoalModal';
import { OsPage, OsPageHeader } from '@/components/os/OsPage';
import {
  Trophy,
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  UserCheck,
  Award,
  BarChart3,
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface VendedoresViewProps {
  initialPerformance: any[];
  initialYear: number;
  initialMonth: number;
}

export function VendedoresView({ initialPerformance, initialYear, initialMonth }: VendedoresViewProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [performance, setPerformance] = useState(initialPerformance);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);

    startTransition(async () => {
      const data = await getMonthlySalesPerformance(year, month);
      setPerformance(data);
    });
  };

  return (
    <OsPage>
      <OsPageHeader
        title="Consultores"
        description="Vendas x meta mensal, comissões e ranking comercial."
      >
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-md w-full sm:w-auto min-w-0">
          <Calendar className="w-4 h-4 text-blue-400 ml-1.5 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => handlePeriodChange(selectedYear, parseInt(e.target.value, 10))}
            className="cnpja-input text-xs py-1 px-2 border-0 bg-transparent min-w-0 flex-1"
          >
            {MONTH_NAMES.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handlePeriodChange(parseInt(e.target.value, 10), selectedMonth)}
            className="cnpja-input text-xs py-1 px-2 border-0 bg-transparent w-20 shrink-0"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </OsPageHeader>

      {/* Cards do Ranking de Consultores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performance.map((item, index) => {
          const isTopRank = index === 0 && item.realSalesCount > 0;
          const isSecondRank = index === 1 && item.realSalesCount > 0;

          return (
            <div
              key={item.vendedorId}
              className={`cnpja-card space-y-4 relative ${
                isTopRank ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/5 to-slate-900/90' : ''
              }`}
            >
              {/* Medalha do Ranking */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase text-sm">
                    {item.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <p className="text-[11px] text-slate-400 capitalize">
                      Consultor Comercial Codratec
                    </p>
                  </div>
                </div>

                {isTopRank ? (
                  <span className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md font-bold text-xs flex items-center gap-1">
                    <Trophy className="w-4 h-4" /> 1º Lugar
                  </span>
                ) : isSecondRank ? (
                  <span className="p-1.5 bg-slate-400/10 border border-slate-400/30 text-slate-300 rounded-md font-bold text-xs flex items-center gap-1">
                    <Award className="w-4 h-4 text-slate-300" /> 2º Lugar
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                )}
              </div>

              {/* Barra de Progresso da Meta Mensal */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-md border border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-400" /> Meta Mensal:
                  </span>
                  <span className="font-mono font-bold text-white text-right break-all">
                    {item.realSalesCount}/{item.targetSalesCount} ({item.progressPercent}%)
                  </span>
                </div>

                {/* Progresso Visual */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.progressPercent >= 100
                        ? 'bg-emerald-500'
                        : item.progressPercent >= 50
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(item.progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Informações Financeiras & Comissão */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 space-y-0.5">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Faturamento Gerado</span>
                  <p className="font-mono font-bold text-white text-sm">
                    R$ {item.totalRevenueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-500/5 rounded border border-emerald-500/20 space-y-0.5">
                  <span className="text-[10px] uppercase text-emerald-400 font-semibold flex items-center justify-between">
                    Comissão ({item.commissionRatePercent}%)
                  </span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    R$ {item.calculatedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Botão para Configurar Meta */}
              <div className="flex justify-end pt-1">
                <SetGoalModal
                  vendedorId={item.vendedorId}
                  vendedorName={item.name}
                  currentYear={selectedYear}
                  currentMonth={selectedMonth}
                  currentTargetSalesCount={item.targetSalesCount}
                  currentCommissionRatePercent={item.commissionRatePercent}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="os-desktop-block space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          Ranking de Desempenho — {MONTH_NAMES[selectedMonth - 1]}/{selectedYear}
        </h3>

        <div className="cnpja-table-container">
          <table className="cnpja-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Consultor Comercial</th>
                <th>Vendas Realizadas x Meta Mensal</th>
                <th>Progresso (%)</th>
                <th>Faturamento Gerado</th>
                <th>Comissão Calculada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((item, idx) => (
                <tr key={item.vendedorId}>
                  <td className="font-bold text-slate-400">#{idx + 1}</td>
                  <td className="font-semibold text-white">{item.name}</td>
                  <td className="font-mono text-blue-400 font-bold">
                    {item.realSalesCount} / {item.targetSalesCount} vendas
                  </td>
                  <td>
                    <span
                      className={`cnpja-badge-${
                        item.progressPercent >= 100 ? 'success' : item.progressPercent >= 50 ? 'info' : 'warning'
                      }`}
                    >
                      {item.progressPercent}%
                    </span>
                  </td>
                  <td className="font-mono text-white font-bold">
                    R$ {item.totalRevenueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-mono text-emerald-400 font-bold">
                    R$ {item.calculatedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.commissionRatePercent}%)
                  </td>
                  <td>
                    <SetGoalModal
                      vendedorId={item.vendedorId}
                      vendedorName={item.name}
                      currentYear={selectedYear}
                      currentMonth={selectedMonth}
                      currentTargetSalesCount={item.targetSalesCount}
                      currentCommissionRatePercent={item.commissionRatePercent}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OsPage>
  );
}
