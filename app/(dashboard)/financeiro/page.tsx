import { getFinancialData, getClients, getAuthProfile } from '@/actions/os';
import { NewFinancialModal } from '@/components/os/NewFinancialModal';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function FinanceiroPage() {
  const profile = await getAuthProfile();
  if (profile && profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const { revenues, expenses } = await getFinancialData();
  const clients = await getClients();

  const totalRevenues = revenues
    .filter((r) => r.status === 'PAGO')
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);

  const totalExpenses = expenses
    .filter((e) => e.status === 'PAGO')
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const netBalance = totalRevenues - totalExpenses;

  return (
    <div className="w-full h-full min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financeiro & Fluxo de Caixa</h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle exclusivo de receitas, despesas operacionais e demonstrativo de resultado (DRE).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <NewFinancialModal type="revenue" clients={clients} />
          <NewFinancialModal type="expense" />
        </div>
      </div>

      {/* Cards Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cnpja-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Receitas (Pago)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            R$ {totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="cnpja-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Despesas (Pago)</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-md">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="cnpja-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Saldo Líquido</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabela de Lançamentos de Receita */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Receitas Lançadas</h3>
        {revenues.length > 0 ? (
          <ul className="os-mobile-cards">
            {revenues.map((r) => (
              <li key={r.id} className="os-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="os-mobile-card-title">{r.description}</div>
                  {r.status === 'PAGO' ? (
                    <span className="cnpja-badge-success">Pago</span>
                  ) : (
                    <span className="cnpja-badge-warning">Pendente</span>
                  )}
                </div>
                {r.client?.name ? <div className="os-mobile-card-sub">{r.client.name}</div> : null}
                <div className="os-mobile-card-row">
                  <span className="cnpja-badge-info">{r.category || 'PROJETO'}</span>
                  <span>{new Date(r.due_date).toLocaleDateString('pt-BR')}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    R$ {Number(r.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="os-mobile-cards text-center py-6 text-slate-500">Nenhuma receita lançada.</p>
        )}
        <div className="cnpja-table-container">
          <table className="cnpja-table">
            <thead>
              <tr>
                <th>Descrição / Cliente</th>
                <th>Categoria</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {revenues.length > 0 ? (
                revenues.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold text-white">
                      <p>{r.description}</p>
                      {r.client?.name && <p className="text-[11px] text-slate-400">{r.client.name}</p>}
                    </td>
                    <td><span className="cnpja-badge-info">{r.category || 'PROJETO'}</span></td>
                    <td>{new Date(r.due_date).toLocaleDateString('pt-BR')}</td>
                    <td className="font-mono text-emerald-400 font-bold">
                      R$ {Number(r.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {r.status === 'PAGO' ? <span className="cnpja-badge-success">Pago</span> : <span className="cnpja-badge-warning">Pendente</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500">
                    Nenhuma receita lançada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Lançamentos de Despesa */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Despesas Lançadas</h3>
        {expenses.length > 0 ? (
          <ul className="os-mobile-cards">
            {expenses.map((e) => (
              <li key={e.id} className="os-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="os-mobile-card-title">{e.description}</div>
                  {e.status === 'PAGO' ? (
                    <span className="cnpja-badge-success">Pago</span>
                  ) : (
                    <span className="cnpja-badge-warning">Pendente</span>
                  )}
                </div>
                <div className="os-mobile-card-row">
                  <span className="cnpja-badge-danger">{e.category}</span>
                  <span>{new Date(e.due_date).toLocaleDateString('pt-BR')}</span>
                  <span className="font-mono text-rose-400 font-bold">
                    R$ {Number(e.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="os-mobile-cards text-center py-6 text-slate-500">Nenhuma despesa lançada.</p>
        )}
        <div className="cnpja-table-container">
          <table className="cnpja-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="font-semibold text-white">{e.description}</td>
                    <td><span className="cnpja-badge-danger">{e.category}</span></td>
                    <td>{new Date(e.due_date).toLocaleDateString('pt-BR')}</td>
                    <td className="font-mono text-rose-400 font-bold">
                      R$ {Number(e.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {e.status === 'PAGO' ? <span className="cnpja-badge-success">Pago</span> : <span className="cnpja-badge-warning">Pendente</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500">
                    Nenhuma despesa lançada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
