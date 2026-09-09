import { Suspense } from 'react';
import { getQuotes, getClients, getAuthProfile } from '@/actions/os';
import { QuotesView } from '@/components/os/QuotesView';
import { canCreateQuote } from '@/lib/permissions';

export default async function OrcamentosPage() {
  const profile = await getAuthProfile();
  const quotes = await getQuotes();
  const clients = await getClients();

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando orçamentos...</p>}>
      <QuotesView quotes={quotes} clients={clients} canEdit={canCreateQuote(profile?.role)} />
    </Suspense>
  );
}
