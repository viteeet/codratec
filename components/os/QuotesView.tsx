'use client';

import { useMemo, useState } from 'react';
import { EditQuoteModal, NewQuoteModal } from '@/components/os/NewQuoteModal';
import { ProposalPrintModal } from '@/components/os/ProposalPrintModal';
import { ContractPrintModal } from '@/components/os/ContractPrintModal';
import { Search } from 'lucide-react';

function quoteStatus(status?: string | null) {
  if (status === 'APROVADO') return <span className="cnpja-badge-success">Aprovado</span>;
  if (status === 'ENVIADO') return <span className="cnpja-badge-info">Enviado</span>;
  if (status === 'RASCUNHO') return <span className="cnpja-badge-warning">Rascunho</span>;
  if (status === 'RECUSADO') return <span className="cnpja-badge-danger">Recusado</span>;
  return null;
}

function quoteNumber(q: { quote_number?: number | null; id?: string | null }) {
  return `#ORC-${new Date().getFullYear()}-${String(q.quote_number || q.id?.substring(0, 6) || 1).padStart(3, '0')}`;
}

function money(value: unknown) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

type ClientItem = { id: string; name: string; company?: string | null };

export function QuotesView({
  quotes,
  clients,
  canEdit,
}: {
  quotes: any[];
  clients: ClientItem[];
  canEdit: boolean;
}) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [clientId, setClientId] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return quotes.filter((item) => {
      if (status && item.status !== status) return false;
      if (clientId && item.client_id !== clientId) return false;
      if (!term) return true;
      const blob = [
        quoteNumber(item),
        item.quote_number,
        item.title,
        item.solicitation,
        item.proposed_solution,
        item.general_scope,
        item.description,
        item.client?.name,
        item.client?.company,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(term);
    });
  }, [quotes, q, status, clientId]);

  const hasFilters = Boolean(q.trim() || status || clientId);

  return (
    <div className="w-full h-full min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orçamentos & Contratos Comerciais</h1>
          <p className="text-xs text-slate-400 mt-1">
            Geração de Propostas Comerciais, Contratos Jurídicos com Cláusulas, emissão de PDF e aprovação de projetos.
          </p>
        </div>

        {canEdit && <NewQuoteModal clients={clients} />}
      </div>

      <div className="cnpja-card p-3 flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="relative w-full lg:flex-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Buscar
          </label>
          <Search className="w-4 h-4 text-slate-500 absolute left-3 bottom-2.5" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Número, cliente, título ou texto da proposta..."
            className="cnpja-input pl-9 text-xs w-full"
          />
        </div>
        <div className="w-full lg:w-48">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="cnpja-input text-xs w-full">
            <option value="">Todos</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADO">Enviado</option>
            <option value="APROVADO">Aprovado</option>
            <option value="RECUSADO">Recusado</option>
          </select>
        </div>
        <div className="w-full lg:w-64">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Cliente
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="cnpja-input text-xs w-full"
          >
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setStatus('');
              setClientId('');
            }}
            className="cnpja-button-secondary text-xs h-[34px]"
          >
            Limpar
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        {filtered.length} de {quotes.length} proposta{quotes.length === 1 ? '' : 's'}
      </p>

      {filtered.length > 0 ? (
        <ul className="os-mobile-cards">
          {filtered.map((item) => (
            <li key={item.id} className="os-mobile-card">
              <div className="flex items-start justify-between gap-2">
                <div className="font-mono font-bold text-blue-400">{quoteNumber(item)}</div>
                {quoteStatus(item.status)}
              </div>
              <div className="os-mobile-card-title mt-1">{item.title}</div>
              {item.solicitation ? (
                <div className="os-mobile-card-sub">{item.solicitation}</div>
              ) : item.description ? (
                <div className="os-mobile-card-sub">{item.description}</div>
              ) : null}
              <div className="os-mobile-card-sub">
                {item.client?.name || 'Cliente'}
                {item.client?.company ? ` (${item.client.company})` : ''}
              </div>
              <div className="os-mobile-card-row">
                <span className="font-mono text-emerald-400 font-bold">R$ {money(item.total_amount)}</span>
              </div>
              <div className="os-mobile-card-actions">
                {canEdit && <EditQuoteModal clients={clients} quote={item} />}
                <ProposalPrintModal quote={item} />
                <ContractPrintModal quote={item} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="os-mobile-cards text-center py-8 text-slate-500">
          {quotes.length === 0
            ? 'Nenhum orçamento emitido no momento.'
            : 'Nenhuma proposta com esses filtros.'}
        </p>
      )}

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
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono font-bold text-blue-400">{quoteNumber(item)}</td>
                  <td className="font-semibold text-slate-200">
                    {item.client?.name || 'Cliente'} {item.client?.company ? `(${item.client.company})` : ''}
                  </td>
                  <td>
                    <p className="font-semibold text-white">{item.title}</p>
                    {(item.solicitation || item.description) && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        {item.solicitation || item.description}
                      </p>
                    )}
                  </td>
                  <td className="font-mono text-emerald-400 font-bold text-sm">R$ {money(item.total_amount)}</td>
                  <td>{quoteStatus(item.status)}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {canEdit && <EditQuoteModal clients={clients} quote={item} />}
                      <ProposalPrintModal quote={item} />
                      <ContractPrintModal quote={item} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  {quotes.length === 0
                    ? 'Nenhum orçamento emitido no momento. Clique no botão "Criar Orçamento" para adicionar o primeiro!'
                    : 'Nenhuma proposta com esses filtros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
