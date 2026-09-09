import { notFound } from 'next/navigation';
import { getQuote } from '@/actions/os';
import { ContractPaper } from '@/components/os/ContractPaper';
import { PrintToolbar } from '@/components/os/PrintToolbar';

export default async function ContractPrintPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { auto?: string };
}) {
  const quote = await getQuote(params.id);
  if (!quote) notFound();

  const number = String(quote.quote_number || quote.id?.substring(0, 6) || '001').padStart(3, '0');
  const client = quote.client?.company || quote.client?.name || 'Cliente';

  return (
    <>
      <PrintToolbar
        title={`Contrato CT-${new Date().getFullYear()}-${number}`}
        subtitle={`${client} · Folha A4`}
        autoPrint={searchParams.auto === '1'}
      />
      <div className="a4-sheet">
        <ContractPaper quote={quote} />
      </div>
    </>
  );
}
