import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getQuote } from '@/actions/os';
import { QuotePaper } from '@/components/os/QuotePaper';
import { QuotePageHeader } from '@/components/os/QuotePageHeader';
import { QuotePrintButton } from '@/components/os/QuotePrintButton';

export default async function QuoteViewPage({ params }: { params: { id: string } }) {
  const quote = await getQuote(params.id);
  if (!quote) notFound();

  return (
    <div className="quote-page quote-page--view">
      <QuotePageHeader quote={quote} title="Documento da proposta">
        <Link href="/orcamentos" className="cnpja-button-secondary text-sm">
          Lista
        </Link>
        <Link href={`/orcamentos/${quote.id}/editar`} className="cnpja-button-secondary text-sm">
          Editar
        </Link>
        <QuotePrintButton />
      </QuotePageHeader>

      <div className="quote-doc-stage">
        <QuotePaper quote={quote} />
      </div>
    </div>
  );
}
