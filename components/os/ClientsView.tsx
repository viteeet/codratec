'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EditClientModal, NewClientModal } from '@/components/os/NewClientModal';
import { NewQuoteModal } from '@/components/os/NewQuoteModal';
import { OsPage, OsPageCount, OsPageHeader, OsPageToolbar } from '@/components/os/OsPage';
import { Search } from 'lucide-react';

function money(value: unknown) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function waHref(phone?: string | null) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
}

function quoteStatusLabel(quotes: any[] = []) {
  if (quotes.some((q) => q.status === 'APROVADO')) return { label: 'Contrato', className: 'cnpja-badge-success' };
  if (quotes.some((q) => q.status === 'ENVIADO' || q.status === 'NEGOCIACAO')) {
    return { label: 'Em proposta', className: 'cnpja-badge-info' };
  }
  if (quotes.some((q) => q.status === 'RASCUNHO')) return { label: 'Rascunho', className: 'cnpja-badge-warning' };
  if (quotes.length === 0) return { label: 'Sem proposta', className: 'cnpja-badge-warning' };
  return { label: `${quotes.length} proposta(s)`, className: 'cnpja-badge-info' };
}

function ClientActions({
  client,
  clients,
  canEditQuotes,
}: {
  client: any;
  clients: any[];
  canEditQuotes: boolean;
}) {
  const phone = client.phone || client.whatsapp;
  const wa = waHref(phone);

  return (
    <div className="os-mobile-card-actions">
      <Link
        href={`/clientes/${client.id}`}
        className="text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-500"
      >
        Abrir conta
      </Link>
      <EditClientModal client={client} />
      {canEditQuotes ? <NewQuoteModal clients={clients} defaultClientId={client.id} compact /> : null}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded"
        >
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}

export function ClientsView({
  clients,
  canEditQuotes = false,
}: {
  clients: any[];
  canEditQuotes?: boolean;
}) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') || '');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) =>
      [c.name, c.company, c.document, c.email, c.phone, c.city, c.state, c.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [clients, q]);

  return (
    <OsPage>
      <OsPageHeader
        title="Clientes & Contas"
        description="Clique em Abrir conta para editar, ver propostas, projetos e falar com o cliente."
      >
        <NewClientModal />
      </OsPageHeader>

      <OsPageToolbar className="cnpja-card p-3">
        <div className="os-page-toolbar__field os-page-toolbar__field--search">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por razão social, CNPJ ou nome..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>
        {q.trim() ? (
          <button type="button" onClick={() => setQ('')} className="cnpja-button-secondary text-xs min-h-11">
            Limpar
          </button>
        ) : null}
      </OsPageToolbar>

      <OsPageCount>
        {filtered.length} de {clients.length} cliente{clients.length === 1 ? '' : 's'}
      </OsPageCount>

      {filtered.length > 0 ? (
        <ul className="os-mobile-cards">
          {filtered.map((c) => {
            const quotes = Array.isArray(c.quotes) ? c.quotes : [];
            const projects = Array.isArray(c.projects) ? c.projects : [];
            const status = quoteStatusLabel(quotes);
            return (
              <li key={c.id} className="os-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/clientes/${c.id}`} className="os-mobile-card-title hover:text-blue-300">
                    {c.name}
                  </Link>
                  <span className={status.className}>{status.label}</span>
                </div>
                {c.company ? <div className="os-mobile-card-sub">{c.company}</div> : null}
                <div className="os-mobile-card-row">
                  <span className="font-mono text-slate-400">{c.document || '-'}</span>
                  <span>{c.city ? `${c.city}${c.state ? ` / ${c.state}` : ''}` : '-'}</span>
                </div>
                <div className="os-mobile-card-row">
                  <span>{quotes.length} proposta{quotes.length === 1 ? '' : 's'}</span>
                  <span>{projects.length} projeto{projects.length === 1 ? '' : 's'}</span>
                </div>
                <ClientActions client={c} clients={clients} canEditQuotes={canEditQuotes} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="os-mobile-cards text-center py-8 text-slate-500">
          {clients.length === 0
            ? 'Nenhum cliente cadastrado. Clique em Novo Cliente para adicionar.'
            : 'Nenhum cliente com essa busca.'}
        </p>
      )}

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Cliente / Empresa</th>
              <th>Documento</th>
              <th>Contato</th>
              <th>Conta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const quotes = Array.isArray(c.quotes) ? c.quotes : [];
                const projects = Array.isArray(c.projects) ? c.projects : [];
                const status = quoteStatusLabel(quotes);
                const pipeline = quotes.reduce((sum: number, q: any) => sum + Number(q.total_amount || 0), 0);
                const phone = c.phone || c.whatsapp;
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/clientes/${c.id}`} className="font-semibold text-white hover:text-blue-300">
                        {c.name}
                      </Link>
                      <p className="text-[11px] text-slate-400">{c.company || '—'}</p>
                    </td>
                    <td className="font-mono text-slate-400 text-xs">{c.document || '-'}</td>
                    <td>
                      <p className="text-slate-200">{c.email || '-'}</p>
                      {phone ? <p className="text-[11px] text-slate-400 font-mono">{phone}</p> : null}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={status.className}>{status.label}</span>
                        <span className="text-[11px] text-slate-400">
                          {quotes.length} prop. · {projects.length} proj.
                          {pipeline > 0 ? ` · R$ ${money(pipeline)}` : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <ClientActions client={c} clients={clients} canEditQuotes={canEditQuotes} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  {clients.length === 0
                    ? 'Nenhum cliente cadastrado. Clique em Novo Cliente para adicionar.'
                    : 'Nenhum cliente com essa busca.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </OsPage>
  );
}
