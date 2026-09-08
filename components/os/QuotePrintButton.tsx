'use client';

export function QuotePrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="cnpja-button-primary text-sm">
      Gerar PDF / Imprimir
    </button>
  );
}
