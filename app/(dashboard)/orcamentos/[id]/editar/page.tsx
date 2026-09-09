import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthProfile, getClients, getQuote } from '@/actions/os';
import { QuoteEditForm } from '@/components/os/QuoteEditForm';
import { QuotePageHeader } from '@/components/os/QuotePageHeader';
import { QuotePrintButton } from '@/components/os/QuotePrintButton';
import { canCreateQuote } from '@/lib/permissions';

export default async function QuoteEditPage({ params }: { params: { id: string } }) {
  const [quote, clients, profile] = await Promise.all([
    getQuote(params.id),
    getClients(),
    getAuthProfile(),
  ]);

  if (!quote) notFound();
  if (!canCreateQuote(profile?.role)) {
    return <p className="text-sm text-rose-600 dark:text-rose-300">Você não tem permissão para editar propostas.</p>;
  }

  return (
    <div className="quote-page quote-page--edit">
      <QuotePageHeader quote={quote} title="Editar proposta">
        <Link href="/orcamentos" className="cnpja-button-secondary text-sm">
          Lista
        </Link>
        <Link href={`/orcamentos/${quote.id}`} className="cnpja-button-secondary text-sm">
          Ver documento
        </Link>
        <QuotePrintButton quoteId={quote.id} />
      </QuotePageHeader>

      <div className="quote-edit-shell">
        <QuoteEditForm quote={quote} clients={clients} />
      </div>
    </div>
  );
}
