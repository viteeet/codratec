'use client';

import Link from 'next/link';
import { EditClientModal } from '@/components/os/NewClientModal';
import { NewQuoteModal } from '@/components/os/NewQuoteModal';
import { NewProjectModal } from '@/components/os/NewProjectModal';
import { OsPage, OsPageHeader } from '@/components/os/OsPage';

function money(value: unknown) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function dateBr(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

function waHref(phone?: string | null) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
}

function quoteStatus(status?: string | null) {
  if (status === 'APROVADO') return <span className="cnpja-badge-success">Aprovado</span>;
  if (status === 'ENVIADO') return <span className="cnpja-badge-info">Enviado</span>;
  if (status === 'RASCUNHO') return <span className="cnpja-badge-warning">Rascunho</span>;
  if (status === 'RECUSADO') return <span className="cnpja-badge-danger">Recusado</span>;
  if (status === 'NEGOCIACAO') return <span className="cnpja-badge-info">Negociação</span>;
  return <span className="cnpja-badge-warning">{status || '—'}</span>;
}

function projectStatus(status?: string | null) {
  if (status === 'EM_ANDAMENTO') return <span className="cnpja-badge-info">Em andamento</span>;
  if (status === 'PLANEJAMENTO') return <span className="cnpja-badge-warning">Planejamento</span>;
  if (status === 'CONCLUIDO') return <span className="cnpja-badge-success">Concluído</span>;
  if (status === 'PAUSADO') return <span className="cnpja-badge-danger">Pausado</span>;
  return <span className="cnpja-badge-warning">{status || '—'}</span>;
}

export function ClientAccountView({
  client,
  clients,
  canEditQuotes,
}: {
  client: any;
  clients: { id: string; name: string; company?: string | null }[];
  canEditQuotes: boolean;
}) {
  const quotes = Array.isArray(client.quotes) ? client.quotes : [];
  const projects = Array.isArray(client.projects) ? client.projects : [];
  const revenues = Array.isArray(client.revenues) ? client.revenues : [];
  const phone = client.phone || client.whatsapp;
  const wa = waHref(phone);
  const pipeline = quotes.reduce((sum: number, q: any) => sum + Number(q.total_amount || 0), 0);
  const paid = revenues
    .filter((r: any) => r.status === 'PAGO')
    .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);

  return (
    <OsPage>
      <OsPageHeader title={client.name} description={client.company || 'Conta do cliente'}>
        <Link href="/clientes" className="cnpja-button-secondary text-sm">
          Lista
        </Link>
        <EditClientModal client={client} />
        {canEditQuotes ? <NewQuoteModal clients={clients} defaultClientId={client.id} compact /> : null}
        <NewProjectModal clients={clients} defaultClientId={client.id} compact />
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="cnpja-button-secondary text-sm text-emerald-300 border-emerald-500/40"
          >
            WhatsApp
          </a>
        ) : null}
      </OsPageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="cnpja-card space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Propostas</p>
          <p className="text-xl font-bold text-white">{quotes.length}</p>
          <p className="text-xs text-slate-400">Pipeline R$ {money(pipeline)}</p>
        </div>
        <div className="cnpja-card space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Projetos</p>
          <p className="text-xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="cnpja-card space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Recebido</p>
          <p className="text-xl font-bold text-white font-mono">R$ {money(paid)}</p>
        </div>
      </div>

      <section className="cnpja-card space-y-3">
        <h2 className="text-sm font-bold text-white">Dados da conta</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase text-slate-500">Documento</dt>
            <dd className="font-mono text-slate-200">{client.document || '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase text-slate-500">E-mail</dt>
            <dd>
              {client.email ? (
                <a href={`mailto:${client.email}`} className="text-blue-300 hover:underline">
                  {client.email}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase text-slate-500">Telefone</dt>
            <dd>
              {phone ? (
                <a href={`tel:${String(phone).replace(/\D/g, '')}`} className="text-blue-300 hover:underline font-mono">
                  {phone}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase text-slate-500">Cidade</dt>
            <dd className="text-slate-200">
              {client.city ? `${client.city}${client.state ? ` / ${client.state}` : ''}` : '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase text-slate-500">Endereço</dt>
            <dd className="text-slate-200">{client.address || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase text-slate-500">Observações</dt>
            <dd className="text-slate-200 whitespace-pre-line">{client.notes || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white">Propostas</h2>
        {quotes.length > 0 ? (
          <div className="cnpja-table-container">
            <table className="cnpja-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Título</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q: any) => (
                  <tr key={q.id}>
                    <td className="font-mono text-blue-400">
                      ORC-{new Date(q.created_at || Date.now()).getFullYear()}-
                      {String(q.quote_number || q.id?.substring(0, 6)).padStart(3, '0')}
                    </td>
                    <td className="text-white">{q.title}</td>
                    <td className="font-mono text-emerald-400">R$ {money(q.total_amount)}</td>
                    <td>{quoteStatus(q.status)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/orcamentos/${q.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-500"
                        >
                          Ver
                        </Link>
                        {canEditQuotes ? (
                          <Link
                            href={`/orcamentos/${q.id}/editar`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold bg-white text-slate-900 px-2.5 py-1 rounded"
                          >
                            Editar
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nenhuma proposta nesta conta.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white">Projetos</h2>
        {projects.length > 0 ? (
          <div className="cnpja-table-container">
            <table className="cnpja-table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Valor</th>
                  <th>Mensal</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-white font-semibold">{p.name}</td>
                    <td className="font-mono text-emerald-400">R$ {money(p.value)}</td>
                    <td className="font-mono text-blue-300">
                      {p.monthly_amount ? `R$ ${money(p.monthly_amount)}` : '—'}
                    </td>
                    <td>{projectStatus(p.status)}</td>
                    <td>
                      <Link href="/projetos" className="text-xs text-blue-300 hover:underline">
                        Ver em Projetos
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nenhum projeto nesta conta.</p>
        )}
      </section>

      {revenues.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">Receitas</h2>
          <div className="cnpja-table-container">
            <table className="cnpja-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((r: any) => (
                  <tr key={r.id}>
                    <td className="text-white">{r.description}</td>
                    <td className="font-mono text-emerald-400">R$ {money(r.amount)}</td>
                    <td className="font-mono text-xs">{dateBr(r.due_date)}</td>
                    <td>
                      {r.status === 'PAGO' ? (
                        <span className="cnpja-badge-success">Pago</span>
                      ) : (
                        <span className="cnpja-badge-warning">{r.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </OsPage>
  );
}
