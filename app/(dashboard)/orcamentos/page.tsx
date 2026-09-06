import { getQuotes, getClients, getAuthProfile } from '@/actions/os';
import { NewQuoteModal } from '@/components/os/NewQuoteModal';
import { ProposalPrintModal } from '@/components/os/ProposalPrintModal';
import { ContractPrintModal } from '@/components/os/ContractPrintModal';
import { canCreateQuote } from '@/lib/permissions';
import { Search } from 'lucide-react';

export default async function OrcamentosPage() {
  const profile = await getAuthProfile();
  const quotes = await getQuotes();
  const clients = await getClients();

  const isAuthorizedToCreate = canCreateQuote(profile?.role);

  return (
    <div className="w-full h-full min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orçamentos & Contratos Comerciais</h1>
          <p className="text-xs text-slate-400 mt-1">
            Geração de Propostas Comerciais, Contratos Jurídicos com Cláusulas, emissão de PDF e aprovação de projetos.
          </p>
        </div>

        {isAuthorizedToCreate && <NewQuoteModal clients={clients} />}
      </div>

      <div className="cnpja-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número da proposta ou cliente..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>
      </div>

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Nº Documento</th>
              <th>Cliente / Contratante</th>
              <th>Título / Objeto do Projeto</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Documentos em PDF (Proposta & Contrato)</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length > 0 ? (
              quotes.map((q) => (
                <tr key={q.id}>
                  <td className="font-mono font-bold text-blue-400">
                    #ORC-{new Date().getFullYear()}-{String(q.quote_number || q.id?.substring(0, 6) || 1).padStart(3, '0')}
                  </td>
                  <td className="font-semibold text-slate-200">
                    {q.client?.name || 'Cliente'} {q.client?.company ? `(${q.client.company})` : ''}
                  </td>
                  <td>
                    <p className="font-semibold text-white">{q.title}</p>
                    {q.description && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{q.description}</p>
                    )}
                  </td>
                  <td className="font-mono text-emerald-400 font-bold text-sm">
                    R$ {Number(q.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {q.status === 'APROVADO' && <span className="cnpja-badge-success">Aprovado 🏆</span>}
                    {q.status === 'ENVIADO' && <span className="cnpja-badge-info">Enviado</span>}
                    {q.status === 'RASCUNHO' && <span className="cnpja-badge-warning">Rascunho</span>}
                    {q.status === 'RECUSADO' && <span className="cnpja-badge-danger">Recusado</span>}
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ProposalPrintModal quote={q} />
                      <ContractPrintModal quote={q} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum orçamento emitido no momento. Clique no botão "Criar Orçamento" para adicionar o primeiro!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
