import { Suspense } from 'react';
import Link from 'next/link';
import { getAuthProfile } from '@/actions/auth';
import { getClients } from '@/actions/clients';
import { getHandoffQueue } from '@/actions/handoffs';
import { getQuotes } from '@/actions/quotes';
import { QuotesView } from '@/components/os/QuotesView';
import { HandoffQueue } from '@/components/os/HandoffQueue';
import { OsPage, OsPageHeader } from '@/components/os/OsPage';
import { canCreateQuote } from '@/lib/permissions';

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-11 items-center px-3 text-xs font-semibold border-b-2 ${
        active ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-inherit'
      }`}
    >
      {children}
    </Link>
  );
}

export default async function OrcamentosPage({ searchParams }: { searchParams?: { aba?: string } }) {
  const profile = await getAuthProfile();
  const canEdit = canCreateQuote(profile?.role);
  const handoffs = canEdit ? await getHandoffQueue() : [];
  const showQueue = canEdit && searchParams?.aba === 'propostas';

  const tabs = canEdit ? (
    <nav className="flex gap-1 border-b border-slate-500/30 mb-3 overflow-x-auto" aria-label="Seções de orçamentos">
      <TabLink href="/orcamentos" active={!showQueue}>
        Orçamentos
      </TabLink>
      <TabLink href="/orcamentos?aba=propostas" active={showQueue}>
        Propostas a fazer{handoffs.length > 0 ? ` (${handoffs.length})` : ''}
      </TabLink>
    </nav>
  ) : null;

  if (showQueue) {
    return (
      <>
        {tabs}
        <OsPage>
          <OsPageHeader
            title="Propostas a fazer"
            description="Leads que o comercial enviou com o briefing da conversa. Quentes e mais antigos primeiro."
          />
          <HandoffQueue handoffs={handoffs} />
        </OsPage>
      </>
    );
  }

  const quotes = await getQuotes();
  const clients = await getClients();

  return (
    <>
      {tabs}
      <Suspense fallback={<p className="text-sm text-slate-400">Carregando orçamentos...</p>}>
        <QuotesView quotes={quotes} clients={clients} canEdit={canEdit} />
      </Suspense>
    </>
  );
}
