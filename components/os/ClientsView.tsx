'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EditClientModal, NewClientModal } from '@/components/os/NewClientModal';
import { NewQuoteModal } from '@/components/os/NewQuoteModal';
import { CodratecLogo } from '@/components/CodratecLogo';
import { OsPage } from '@/components/os/OsPage';
import { Building2, MapPin, MessageCircle, Search, X } from 'lucide-react';

type StageId = 'all' | 'contrato' | 'proposta' | 'rascunho' | 'vazio';

function money(value: unknown) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function waHref(phone?: string | null) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
}

function formatCnpj(value?: string | null) {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatPhone(value?: string | null) {
  if (!value) return null;
  const d = value.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return value;
}

function initials(name?: string | null) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'CT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function accountStage(quotes: any[] = []): { id: Exclude<StageId, 'all'>; label: string; tone: string } {
  if (quotes.some((q) => q.status === 'APROVADO')) {
    return { id: 'contrato', label: 'Contrato', tone: 'success' };
  }
  if (quotes.some((q) => q.status === 'ENVIADO' || q.status === 'NEGOCIACAO')) {
    return { id: 'proposta', label: 'Em proposta', tone: 'info' };
  }
  if (quotes.some((q) => q.status === 'RASCUNHO')) {
    return { id: 'rascunho', label: 'Rascunho', tone: 'warning' };
  }
  return { id: 'vazio', label: 'Sem proposta', tone: 'muted' };
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
    <div className="os-account-actions">
      <Link href={`/clientes/${client.id}`} className="os-account-open">
        Abrir conta
      </Link>
      <EditClientModal client={client} />
      {canEditQuotes ? <NewQuoteModal clients={clients} defaultClientId={client.id} compact /> : null}
      {wa ? (
        <a href={wa} target="_blank" rel="noreferrer" className="os-account-wa">
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}

const STAGE_FILTERS: { id: StageId; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'contrato', label: 'Contrato' },
  { id: 'proposta', label: 'Em proposta' },
  { id: 'rascunho', label: 'Rascunho' },
  { id: 'vazio', label: 'Sem proposta' },
];

export function ClientsView({
  clients,
  canEditQuotes = false,
}: {
  clients: any[];
  canEditQuotes?: boolean;
}) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') || '');
  const [stage, setStage] = useState<StageId>('all');

  const catalog = useMemo(() => {
    return clients.map((c) => {
      const quotes = Array.isArray(c.quotes) ? c.quotes : [];
      const projects = Array.isArray(c.projects) ? c.projects : [];
      const pipeline = quotes.reduce((sum: number, item: any) => sum + Number(item.total_amount || 0), 0);
      return { client: c, quotes, projects, pipeline, stage: accountStage(quotes) };
    });
  }, [clients]);

  const kpis = useMemo(() => {
    return {
      total: catalog.length,
      contrato: catalog.filter((item) => item.stage.id === 'contrato').length,
      proposta: catalog.filter((item) => item.stage.id === 'proposta').length,
      pipeline: catalog.reduce((sum, item) => sum + item.pipeline, 0),
    };
  }, [catalog]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return catalog.filter((item) => {
      if (stage !== 'all' && item.stage.id !== stage) return false;
      if (!term) return true;
      const c = item.client;
      return [c.name, c.company, c.document, c.email, c.phone, c.whatsapp, c.city, c.state, c.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [catalog, q, stage]);

  const emptyMessage =
    clients.length === 0
      ? 'Nenhuma conta ainda. Cadastre o primeiro cliente para abrir o livro comercial.'
      : 'Nenhuma conta com esses filtros.';

  return (
    <OsPage className="os-accounts">
      <header className="os-accounts-hero">
        <div className="os-accounts-hero__brand">
          <CodratecLogo variant="wordmark" className="os-accounts-logo" />
          <p>Livro de contas comerciais</p>
        </div>
        <div className="os-accounts-hero__copy">
          <h1>Clientes &amp; Contas</h1>
          <p>Abra a ficha para propostas, projetos e contato. Cada linha é uma conta, não um cadastro solto.</p>
        </div>
        <div className="os-accounts-hero__cta">
          <NewClientModal />
        </div>
      </header>

      <section className="os-accounts-kpis" aria-label="Resumo das contas">
        <div>
          <span>Contas</span>
          <strong>{kpis.total}</strong>
        </div>
        <div>
          <span>Contratos</span>
          <strong>{kpis.contrato}</strong>
        </div>
        <div>
          <span>Em proposta</span>
          <strong>{kpis.proposta}</strong>
        </div>
        <div>
          <span>Pipeline</span>
          <strong>R$ {money(kpis.pipeline)}</strong>
        </div>
      </section>

      <div className="os-accounts-toolbar">
        <label className="os-accounts-search">
          <Search className="w-4 h-4" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar razão social, CNPJ, cidade ou e-mail"
            aria-label="Buscar contas"
          />
          {q ? (
            <button type="button" onClick={() => setQ('')} aria-label="Limpar busca">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </label>
        <div className="os-accounts-filters" role="tablist" aria-label="Situação comercial">
          {STAGE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={stage === item.id}
              className={stage === item.id ? 'is-active' : ''}
              onClick={() => setStage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="os-accounts-count">
        {filtered.length} de {clients.length} conta{clients.length === 1 ? '' : 's'}
      </p>

      {filtered.length === 0 ? (
        <div className="os-accounts-empty">
          <Building2 className="w-8 h-8" aria-hidden />
          <p>{emptyMessage}</p>
          {clients.length === 0 ? <NewClientModal /> : null}
        </div>
      ) : (
        <ul className="os-accounts-list">
          {filtered.map(({ client: c, quotes, projects, pipeline, stage: status }) => {
            const phone = formatPhone(c.phone || c.whatsapp);
            const place = [c.city, c.state].filter(Boolean).join('/');
            return (
              <li key={c.id} className="os-account">
                <Link href={`/clientes/${c.id}`} className="os-account-identity">
                  <span className="os-account-mark" aria-hidden>
                    {initials(c.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="os-account-name">{c.name}</span>
                    <span className="os-account-meta">
                      {c.company || 'Sem razão social'}
                      <span>·</span>
                      {formatCnpj(c.document)}
                    </span>
                  </span>
                </Link>

                <div className="os-account-stage">
                  <span className={`os-account-badge is-${status.tone}`}>{status.label}</span>
                  <span>
                    {quotes.length} proposta{quotes.length === 1 ? '' : 's'}
                    <span aria-hidden> · </span>
                    {projects.length} projeto{projects.length === 1 ? '' : 's'}
                  </span>
                  {pipeline > 0 ? <strong>R$ {money(pipeline)}</strong> : <span>Sem valor em pipeline</span>}
                </div>

                <div className="os-account-contact">
                  <span>{c.email || 'Sem e-mail'}</span>
                  {phone ? (
                    <span className="font-mono">{phone}</span>
                  ) : (
                    <span>Sem telefone</span>
                  )}
                  {place ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden />
                      {place}
                    </span>
                  ) : null}
                </div>

                <ClientActions client={c} clients={clients} canEditQuotes={canEditQuotes} />
              </li>
            );
          })}
        </ul>
      )}
    </OsPage>
  );
}
