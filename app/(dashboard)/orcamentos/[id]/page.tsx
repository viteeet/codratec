import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthProfile, getQuote } from '@/actions/os';
import { QuotePaper } from '@/components/os/QuotePaper';
import { QuotePageHeader } from '@/components/os/QuotePageHeader';
import { QuotePrintButton } from '@/components/os/QuotePrintButton';
import { QuoteStatusSelect } from '@/components/os/QuoteStatusSelect';
import { canCreateQuote } from '@/lib/permissions';

export default async function QuoteViewPage({ params }: { params: { id: string } }) {
  const [quote, profile] = await Promise.all([getQuote(params.id), getAuthProfile()]);
  if (!quote) notFound();
  const canEdit = canCreateQuote(profile?.role);

  return (
    <div className="quote-page quote-page--view">
      <QuotePageHeader quote={quote} title="Documento da proposta">
        <QuoteStatusSelect
          quoteId={quote.id}
          status={quote.status}
          project={quote.project}
          canEdit={canEdit}
        />
        <Link href="/orcamentos" className="cnpja-button-secondary text-sm">
          Lista
        </Link>
        {canEdit ? (
          <Link href={`/orcamentos/${quote.id}/editar`} className="cnpja-button-secondary text-sm">
            Editar
          </Link>
        ) : null}
        <QuotePrintButton quoteId={quote.id} />
      </QuotePageHeader>

      <div className="quote-doc-stage">
        <QuotePaper quote={quote} />
      </div>
    </div>
  );
}
