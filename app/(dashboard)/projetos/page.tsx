import { getProjects, getClients } from '@/actions/os';
import { NewProjectModal } from '@/components/os/NewProjectModal';
import { FolderKanban, Search, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';

export default async function ProjetosPage() {
  const projects = await getProjects();
  const clients = await getClients();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projetos & Plano de Continuidade Codratec</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de Setup, Mensalidade Recorrente, Fidelidade de 12 meses e acompanhamento de entregas.
          </p>
        </div>

        <NewProjectModal clients={clients} />
      </div>

      <div className="cnpja-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por projeto ou cliente..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((p) => {
                const setupAmount = Number(p.setup_amount || 2500);
                const monthlyAmount = Number(p.monthly_amount || 600);
                const duration = Number(p.contract_duration_months || 12);
                const yearOneTotal = setupAmount + (monthlyAmount * duration);

                return (
                  <tr key={p.id}>
                    <td className="font-semibold text-white">
                      <p>{p.name}</p>
                      {p.description && <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="text-slate-200">
                      {p.client?.name || 'Cliente'} {p.client?.company ? `(${p.client.company})` : ''}
                    </td>
                    <td className="font-mono text-emerald-400 font-bold">
                      R$ {setupAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="font-mono text-blue-400 font-semibold">
                      R$ {monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                    </td>
                    <td className="text-slate-300 font-mono text-xs">
                      <span className="cnpja-badge-info">{duration} meses</span>
                    </td>
                    <td className="text-xs font-mono text-amber-400">
                      {p.next_billing_date ? new Date(p.next_billing_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="font-mono text-purple-300 font-bold">
                      R$ {yearOneTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {p.status === 'EM_ANDAMENTO' && <span className="cnpja-badge-info">Em Andamento</span>}
                      {p.status === 'PLANEJAMENTO' && <span className="cnpja-badge-warning">Planejamento</span>}
                      {p.status === 'CONCLUIDO' && <span className="cnpja-badge-success">Concluído</span>}
                      {p.status === 'PAUSADO' && <span className="cnpja-badge-danger">Pausado</span>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  Nenhum projeto cadastrado no Plano de Continuidade. Clique no botão "Novo Projeto" para adicionar!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
