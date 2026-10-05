'use client';

import { useState, useTransition } from 'react';
import { deleteSalesGoal, setVendedorMonthlyGoal } from '@/actions/os';
import { Settings, Target, DollarSign } from 'lucide-react';
import { useConfirm, useToast } from '@/components/ui/Feedback';
import { FormError, Modal } from '@/components/ui/Modal';

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
  const confirm = useConfirm();
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await setVendedorMonthlyGoal(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        toast.success('Meta salva.');
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

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={<>Meta Mensal — {vendedorName}</>} subtitle={<>Mês {currentMonth}/{currentYear}</>}
        icon={<Target className="w-4 h-4" />} className="w-full max-w-md p-6 space-y-4"
      >
        <FormError message={error} />

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
              onClick={async () => {
                if (!(await confirm({ title: 'Excluir esta meta?' }))) return;
                startTransition(async () => {
                  const res = await deleteSalesGoal(vendedorId, currentYear, currentMonth);
                  if (res && 'error' in res) setError(res.error);
                  else {
                    toast.success('Meta excluída.');
                    setIsOpen(false);
                  }
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
      </Modal>
    </>
  );
}
