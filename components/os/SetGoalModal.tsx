'use client';

import { useState, useTransition } from 'react';
import { deleteSalesGoal, setVendedorMonthlyGoal } from '@/actions/os';
import { Settings, X, Target, DollarSign } from 'lucide-react';

interface SetGoalModalProps {
  vendedorId: string;
  vendedorName: string;
  currentYear: number;
  currentMonth: number;
  currentTargetSalesCount: number;
  currentCommissionRatePercent: number;
}

export function SetGoalModal({
  vendedorId,
  vendedorName,
  currentYear,
  currentMonth,
  currentTargetSalesCount,
  currentCommissionRatePercent,
}: SetGoalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await setVendedorMonthlyGoal(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded font-medium flex items-center gap-1 transition"
      >
        <Settings className="w-3 h-3 text-blue-400" /> Configurar Meta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-none p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Meta Mensal — {vendedorName}</h2>
                  <p className="text-[11px] text-slate-400">Mês {currentMonth}/{currentYear}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="hidden" name="userId" value={vendedorId} />
              <input type="hidden" name="year" value={currentYear} />
              <input type="hidden" name="month" value={currentMonth} />

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Meta de Vendas (Vendas / Mês) *
                </label>
                <input
                  type="number"
                  name="targetSalesCount"
                  required
                  defaultValue={currentTargetSalesCount}
                  min={1}
                  className="cnpja-input text-xs font-mono font-bold text-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Comissão por Venda (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="commissionRatePercent"
                  defaultValue={currentCommissionRatePercent}
                  className="cnpja-input text-xs font-mono"
                />
              </div>

              <div className="flex justify-between gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!window.confirm('Excluir esta meta?')) return;
                    startTransition(async () => {
                      const res = await deleteSalesGoal(vendedorId, currentYear, currentMonth);
                      if (res && 'error' in res) setError(res.error);
                      else setIsOpen(false);
                    });
                  }}
                  className="text-xs text-rose-300 border border-rose-800 px-2 py-1"
                >
                  Excluir
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                    {isPending ? 'Salvando...' : 'Salvar Meta'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
