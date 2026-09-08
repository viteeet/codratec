import type { ReactNode } from 'react';
import Link from 'next/link';
import { quoteNumberLabel } from '@/components/os/QuotePaper';

export function QuotePageHeader({
  quote,
  title,
  children,
}: {
  quote: any;
  title: string;
  children?: ReactNode;
}) {
  const client = quote.client?.name || quote.client?.company || 'Cliente';

  return (
    <header className="quote-page-header print:hidden">
      <div className="quote-page-header__crumb">
        <Link href="/orcamentos">Orçamentos</Link>
        <span aria-hidden="true">/</span>
        <span>{quoteNumberLabel(quote)}</span>
      </div>
      <div className="quote-page-header__row">
        <div>
          <h1>{title}</h1>
          <p>
            {client}
            {quote.title ? ` · ${quote.title}` : ''}
          </p>
        </div>
        <nav className="quote-page-header__actions">{children}</nav>
      </div>
    </header>
  );
}
