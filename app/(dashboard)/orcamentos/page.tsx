import { getQuotes, getClients, getAuthProfile } from '@/actions/os';
import { QuotesView } from '@/components/os/QuotesView';
import { canCreateQuote } from '@/lib/permissions';

export default async function OrcamentosPage() {
  const profile = await getAuthProfile();
  const quotes = await getQuotes();
  const clients = await getClients();

  return (
    <QuotesView
      quotes={quotes}
      clients={clients}
      canEdit={canCreateQuote(profile?.role)}
    />
  );
}
