import { notFound } from 'next/navigation';
import { getAuthProfile, getClientAccount, getClients } from '@/actions/os';
import { ClientAccountView } from '@/components/os/ClientAccountView';
import { canCreateQuote } from '@/lib/permissions';

export default async function ClientAccountPage({ params }: { params: { id: string } }) {
  const [client, clients, profile] = await Promise.all([
    getClientAccount(params.id),
    getClients(),
    getAuthProfile(),
  ]);

  if (!client) notFound();

  return (
    <ClientAccountView
      client={client}
      clients={clients.map((c: any) => ({ id: c.id, name: c.name, company: c.company }))}
      canEditQuotes={canCreateQuote(profile?.role)}
    />
  );
}
