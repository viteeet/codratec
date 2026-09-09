import Link from 'next/link';
import { Printer } from 'lucide-react';

export function QuotePrintButton({ quoteId }: { quoteId: string }) {
  return (
    <Link
      href={`/orcamentos/${quoteId}/imprimir?auto=1`}
      target="_blank"
      rel="noreferrer"
      className="cnpja-button-primary text-sm inline-flex items-center gap-1.5"
    >
      <Printer className="w-4 h-4" />
      Imprimir / PDF A4
    </Link>
  );
}
