import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function ContractPrintModal({ quote }: { quote: any }) {
  if (!quote?.id) return null;

  return (
    <Link
      href={`/orcamentos/${quote.id}/contrato?auto=1`}
      target="_blank"
      rel="noreferrer"
      className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-medium flex items-center gap-1 transition"
    >
      <ShieldCheck className="w-3.5 h-3.5" /> Ver contrato / PDF
    </Link>
  );
}
