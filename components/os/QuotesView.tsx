'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NewQuoteModal } from '@/components/os/NewQuoteModal';
import { ContractPrintModal } from '@/components/os/ContractPrintModal';
import { QuoteStatusSelect } from '@/components/os/QuoteStatusSelect';
import { OsPage, OsPageCount, OsPageHeader } from '@/components/os/OsPage';
import { OsFilterBar } from '@/components/os/OsFilterBar';

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
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') || '');
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


  return (
    <OsPage>
      <OsPageHeader
        title="Orçamentos"
        description="Depois do envio, o desfecho é recusar ou aprovar — aprovar cria o projeto."
      >
        {canEdit ? <NewQuoteModal clients={clients} /> : null}
      </OsPageHeader>

      <OsFilterBar
        className="os-xl-sheet"
        search={{ value: q, onChange: setQ, placeholder: 'Número, cliente, título ou texto da proposta...' }}
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: 'RASCUNHO', label: 'Rascunho' },
              { value: 'ENVIADO', label: 'Enviado' },
              { value: 'NEGOCIACAO', label: 'Negociação' },
              { value: 'APROVADO', label: 'Aprovado' },
              { value: 'RECUSADO', label: 'Recusado' },
            ],
          },
          {
            id: 'client',
            label: 'Cliente',
            value: clientId,
            onChange: setClientId,
            options: clients.map((c) => ({
              value: c.id,
              label: `${c.name} ${c.company ? `(${c.company})` : ''}`.trim(),
            })),
          },
        ]}
        onClear={() => {
          setQ('');
          setStatus('');
          setClientId('');
        }}
        resultCount={filtered.length}
      />

      <OsPageCount>
        {filtered.length} de {quotes.length} proposta{quotes.length === 1 ? '' : 's'}
      </OsPageCount>

      {filtered.length > 0 ? (
        <ul className="os-mobile-cards">
          {filtered.map((item) => (
            <li key={item.id} className="os-mobile-card">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-xs font-bold text-blue-400">{quoteNumber(item)}</div>
                <span className="font-mono text-sm text-emerald-400 font-bold">R$ {money(item.total_amount)}</span>
              </div>
              <div className="os-mobile-card-title mt-0.5">{item.title}</div>
              <div className="os-mobile-card-sub os-mobile-card-sub--clamp">
                {item.client?.name || 'Cliente'}
                {item.client?.company ? ` (${item.client.company})` : ''}
                {item.solicitation || item.description ? ` · ${item.solicitation || item.description}` : ''}
              </div>
              <div className="os-mobile-card-outcome">
                <QuoteStatusSelect
                  quoteId={item.id}
                  status={item.status}
                  project={item.project}
                  canEdit={canEdit}
                />
              </div>
              <div className="os-mobile-card-actions os-mobile-card-actions--grid os-mobile-card-actions--row">
                <QuoteRowActions quoteId={item.id} quote={item} canEdit={canEdit} compact />
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
              <th>Status / desfecho</th>
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
                  <td>
                    <QuoteStatusSelect
                      quoteId={item.id}
                      status={item.status}
                      project={item.project}
                      canEdit={canEdit}
                    />
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <QuoteRowActions quoteId={item.id} quote={item} canEdit={canEdit} />
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
    </OsPage>
  );
}

function QuoteRowActions({
  quoteId,
  quote,
  canEdit,
  compact = false,
}: {
  quoteId: string;
  quote: any;
  canEdit: boolean;
  /** Rótulos curtos para o card do celular. */
  compact?: boolean;
}) {
  return (
    <>
      {canEdit && (
        <Link
          href={`/orcamentos/${quoteId}/editar`}
          target="_blank"
          rel="noreferrer"
          className="cnpja-button-secondary text-xs min-h-11"
        >
          Editar
        </Link>
      )}
      <Link
        href={`/orcamentos/${quoteId}`}
        target="_blank"
        rel="noreferrer"
        className="cnpja-button-primary text-xs min-h-11"
      >
        {compact ? 'Ver' : 'Ver proposta'}
      </Link>
      <Link
        href={`/orcamentos/${quoteId}/imprimir?auto=1`}
        target="_blank"
        rel="noreferrer"
        className="cnpja-button-secondary text-xs min-h-11"
      >
        {compact ? 'Imprimir' : 'Imprimir A4'}
      </Link>
      <ContractPrintModal quote={quote} compact={compact} />
    </>
  );
}
