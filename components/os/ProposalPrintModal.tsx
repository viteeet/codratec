'use client';

import { useState } from 'react';
import { Printer, X, FileText, Building2 } from 'lucide-react';

interface ProposalPrintModalProps {
  quote: any;
}

export function ProposalPrintModal({ quote }: ProposalPrintModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const clientName = quote.client?.name || 'Cliente';
  const clientCompany = quote.client?.company || '';
  const clientDocument = quote.client?.document || 'Não informado';
  const quoteNumber = String(quote.quote_number || quote.id?.substring(0, 6) || '001').padStart(3, '0');
  const validUntilDate = quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('pt-BR') : '15 dias';
  const totalAmountFormatted = Number(quote.total_amount || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-2.5 py-1 rounded font-medium flex items-center gap-1 transition"
      >
        <FileText className="w-3.5 h-3.5" /> Ver Proposta / PDF
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex justify-center p-4 sm:p-8 print:p-0 print:bg-white">
          <div className="w-full max-w-5xl space-y-4 print:space-y-0">
            <div className="flex items-center justify-between rounded-md bg-slate-900 border border-slate-700 px-4 py-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Proposta Comercial #{quoteNumber}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="cnpja-button-primary text-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Gerar PDF / Imprimir
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cnpja-button-secondary text-sm"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>
              </div>
            </div>

            <article className="bg-white text-neutral-900 dark:bg-white dark:text-neutral-900 border border-neutral-200 dark:border-neutral-200 rounded-md p-8 sm:p-12 shadow-2xl space-y-10 font-sans text-base leading-7 print:border-0 print:shadow-none print:p-8">
              <div className="flex justify-between items-start gap-8 border-b border-neutral-300 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="/codratec-logo.png"
                      alt="Codratec Logo"
                      className="w-14 h-14 rounded-md object-cover border border-neutral-300 shrink-0"
                    />
                    <h1 className="text-3xl font-black tracking-wider text-neutral-900 uppercase">
                      CODRATEC
                    </h1>
                  </div>
                  <p className="text-sm text-neutral-700 font-medium">
                    Codratec Software & Soluções Digitais Ltda.
                  </p>
                  <p className="text-sm text-neutral-700">
                    contato@codratec.com.br | www.codratec.com.br
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-800">
                    PROPOSTA COMERCIAL
                  </span>
                  <p className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                    Nº ORC-{new Date().getFullYear()}-{quoteNumber}
                  </p>
                  <p className="text-sm text-neutral-700 mt-2">
                    Emissão: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-neutral-700">
                    Validade: {validUntilDate}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-md p-5 space-y-2">
                <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
                  Dados do Cliente / Contratante
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                  <div>
                    <p className="font-bold text-neutral-900 text-xl">{clientName}</p>
                    {clientCompany && (
                      <p className="text-neutral-800 font-medium flex items-center gap-1 mt-1">
                        <Building2 className="w-4 h-4 text-blue-800" /> {clientCompany}
                      </p>
                    )}
                  </div>
                  <div className="text-neutral-800">
                    <p>CNPJ/CPF: <span className="font-mono font-bold text-neutral-900">{clientDocument}</span></p>
                    {quote.client?.email && <p>E-mail: {quote.client.email}</p>}
                    {quote.client?.phone && <p>Telefone: {quote.client.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                  Objeto
                </h3>
                <h2 className="text-2xl font-bold text-neutral-900">{quote.title}</h2>
              </div>

              {quote.solicitation && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                    Solicitação
                  </h3>
                  <p className="text-neutral-900 whitespace-pre-line">
                    {quote.solicitation}
                  </p>
                </div>
              )}

              {quote.proposed_solution && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                    Solução proposta
                  </h3>
                  <p className="text-neutral-900 whitespace-pre-line">
                    {quote.proposed_solution}
                  </p>
                </div>
              )}

              {quote.general_scope && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                    Escopo geral
                  </h3>
                  <p className="text-neutral-900 whitespace-pre-line">
                    {quote.general_scope}
                  </p>
                </div>
              )}

              {!quote.solicitation && !quote.proposed_solution && !quote.general_scope && quote.description && (
                <p className="text-neutral-900 whitespace-pre-line bg-neutral-50 p-4 rounded border border-neutral-200">
                  {quote.description}
                </p>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                  Investimento
                </h3>
                <div className="border border-neutral-300 rounded-md overflow-hidden">
                  <table className="w-full text-left text-base text-neutral-900">
                    <thead className="bg-neutral-100 text-neutral-800 uppercase text-sm font-bold border-b border-neutral-300">
                      <tr>
                        <th className="p-4">Item</th>
                        <th className="p-4 text-right">Modalidade</th>
                        <th className="p-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      <tr>
                        <td className="p-4 font-semibold">
                          1. Setup / Implantação Inicial
                          <p className="text-sm text-neutral-600 font-normal mt-1">
                            Desenvolvimento sob medida, configuração de ambiente, banco de dados, publicação e treinamento inicial.
                          </p>
                        </td>
                        <td className="p-4 text-right font-mono">
                          Taxa única
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-lg">
                          R$ {Number(quote.setup_amount || 2500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">
                          2. Plano de Continuidade Codratec
                          <p className="text-sm text-neutral-600 font-normal mt-1">
                            Hospedagem inclusa, suporte técnico, correção de bugs, backups automáticos e manutenção contínua.
                          </p>
                        </td>
                        <td className="p-4 text-right font-mono">
                          Mensal ({quote.contract_duration_months || 12}m)
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-lg text-blue-800">
                          R$ {Number(quote.monthly_amount || 600).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
                  <h4 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
                    Condições de pagamento
                  </h4>
                  <p className="text-neutral-900">
                    {quote.payment_terms || `Setup de R$ ${Number(quote.setup_amount || 2500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no aceite + Plano de Continuidade de R$ ${Number(quote.monthly_amount || 600).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês com contrato de fidelidade de ${quote.contract_duration_months || 12} meses.`}
                  </p>
                </div>

                <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
                  <h4 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
                    Investimento total
                  </h4>
                  <p className="text-3xl font-bold font-mono text-neutral-900">
                    R$ {totalAmountFormatted}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Impostos e licenças inclusos na proposta.
                  </p>
                </div>
              </div>

              <div className="pt-12 grid grid-cols-2 gap-12 border-t border-neutral-300 text-center">
                <div className="space-y-1">
                  <div className="border-b border-neutral-800 mb-2 w-3/4 mx-auto"></div>
                  <p className="text-base font-bold text-neutral-900">Codratec Software House</p>
                  <p className="text-sm text-neutral-600">Representante Comercial</p>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-neutral-800 mb-2 w-3/4 mx-auto"></div>
                  <p className="text-base font-bold text-neutral-900">{clientName}</p>
                  <p className="text-sm text-neutral-600">Aceite do Contratante</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}
    </>
  );
}
