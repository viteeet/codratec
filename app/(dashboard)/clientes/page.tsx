import { Suspense } from 'react';
import { getAuthProfile, getClients } from '@/actions/os';
import { ClientsView } from '@/components/os/ClientsView';
import { canCreateQuote } from '@/lib/permissions';

export default async function ClientesPage() {
  const [clients, profile] = await Promise.all([getClients(), getAuthProfile()]);

  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Carregando clientes...</p>}>
      <ClientsView clients={clients} canEditQuotes={canCreateQuote(profile?.role)} />
    </Suspense>
  );
}
