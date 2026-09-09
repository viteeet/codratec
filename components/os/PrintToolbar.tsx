'use client';

import { useEffect } from 'react';
import { Printer, X } from 'lucide-react';

export function PrintToolbar({
  title,
  subtitle,
  autoPrint = false,
}: {
  title: string;
  subtitle?: string;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 450);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <header className="a4-print-toolbar">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="a4-print-toolbar__actions">
        <button type="button" className="a4-print-btn a4-print-btn--primary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
        <button
          type="button"
          className="a4-print-btn"
          onClick={() => {
            if (window.history.length > 1) window.close();
            else window.history.back();
          }}
        >
          <X className="w-4 h-4" />
          Fechar
        </button>
      </div>
    </header>
  );
}
