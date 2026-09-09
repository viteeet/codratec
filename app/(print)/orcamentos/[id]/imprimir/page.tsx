import { notFound } from 'next/navigation';
import { getQuote } from '@/actions/os';
import { QuotePaper, quoteNumberLabel } from '@/components/os/QuotePaper';
import { PrintToolbar } from '@/components/os/PrintToolbar';

export default async function QuotePrintPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { auto?: string };
}) {
  const quote = await getQuote(params.id);
  if (!quote) notFound();

  const doc = quoteNumberLabel(quote);
  const client = quote.client?.name || quote.client?.company || 'Cliente';

  return (
    <>
      <PrintToolbar
        title={`Proposta ${doc}`}
        subtitle={`${client}${quote.title ? ` · ${quote.title}` : ''} · Folha A4`}
        autoPrint={searchParams.auto === '1'}
      />
      <div className="a4-sheet">
        <QuotePaper quote={quote} />
      </div>
    </>
  );
}
