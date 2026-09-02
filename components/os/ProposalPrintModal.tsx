'use client';

import { useState } from 'react';
import { Printer, X, FileText, CheckCircle2, Building2 } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex justify-center p-4 sm:p-6 print:p-0 print:bg-white">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-md p-6 sm:p-10 shadow-2xl space-y-8 print:border-0 print:shadow-none print:bg-white print:text-black print:p-0 print:m-0">
            {/* Barra de Ações (Oculta na impressão) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Proposta Comercial #{quoteNumber}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="cnpja-button-primary text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Gerar PDF / Imprimir
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cnpja-button-secondary text-xs"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>
              </div>
            </div>

            {/* DOCUMENTO DA PROPOSTA COMERCIAL (Estilizado para Tela & PDF Impresso) */}
            <div className="space-y-8 text-slate-100 print:text-black font-sans">
              {/* Cabeçalho da Proposta */}
              <div className="flex justify-between items-start border-b border-slate-800 print:border-gray-300 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src="/codratec-logo.png"
                      alt="Codratec Logo"
                      className="w-10 h-10 rounded-md object-cover border border-slate-800 print:border-gray-400 shrink-0"
                    />
                    <h1 className="text-2xl font-black tracking-wider text-white print:text-black uppercase">
                      CODRATEC
                    </h1>
                  </div>
                  <p className="text-xs text-slate-400 print:text-gray-600 font-medium">
                    Codratec Software & Soluções Digitais Ltda.
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-gray-600">
                    contato@codratec.com.br | www.codratec.com.br
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-black">
                    PROPOSTA COMERCIAL
                  </span>
                  <p className="text-xl font-bold font-mono text-white print:text-black mt-1">
                    Nº ORC-{new Date().getFullYear()}-{quoteNumber}
                  </p>
                  <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                    Emissão: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-400 print:text-gray-600">
                    Validade: {validUntilDate}
                  </p>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-md p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider">
                  Dados do Cliente / Contratante
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-white print:text-black text-sm">{clientName}</p>
                    {clientCompany && (
                      <p className="text-slate-300 print:text-gray-800 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400 print:text-black" /> {clientCompany}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 print:text-gray-600">CNPJ/CPF: <span className="font-mono font-bold text-slate-200 print:text-black">{clientDocument}</span></p>
                    {quote.client?.email && <p className="text-slate-400 print:text-gray-600">E-mail: {quote.client.email}</p>}
                    {quote.client?.phone && <p className="text-slate-400 print:text-gray-600">Telefone: {quote.client.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Título & Objeto do Contrato */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider">
                  Objeto do Projeto
                </h3>
                <h2 className="text-lg font-bold text-white print:text-black">{quote.title}</h2>
                {quote.description && (
                  <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed whitespace-pre-line bg-slate-950/40 print:bg-transparent p-3 rounded border border-slate-900 print:border-0">
                    {quote.description}
                  </p>
                )}
              </div>

              {/* Tabela de Investimento - Plano de Continuidade Codratec */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider">
                  Discriminação do Investimento & Plano de Continuidade Codratec
                </h3>
                <div className="border border-slate-800 print:border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-gray-700 uppercase text-[11px] font-bold border-b border-slate-800 print:border-gray-300">
                      <tr>
                        <th className="p-3">Etapa / Serviço</th>
                        <th className="p-3 text-right">Modalidade</th>
                        <th className="p-3 text-right">Valor do Investimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                      <tr>
                        <td className="p-3 font-semibold text-slate-200 print:text-black">
                          1. Setup / Implantação Inicial
                          <p className="text-[11px] text-slate-400 print:text-gray-600 font-normal mt-0.5">
                            Desenvolvimento sob medida, configuração de ambiente, banco de dados, publicação e treinamento inicial.
                          </p>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-black">
                          Taxa Única de Entrada
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-black text-sm">
                          R$ {Number(quote.setup_amount || 2500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-200 print:text-black">
                          2. Plano de Continuidade Codratec
                          <p className="text-[11px] text-slate-400 print:text-gray-600 font-normal mt-0.5">
                            Hospedagem inclusa, suporte técnico, correção de bugs, backups automáticos e manutenção contínua.
                          </p>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-black">
                          Recorrência Mensal ({quote.contract_duration_months || 12}m)
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-blue-400 print:text-black text-sm">
                          R$ {Number(quote.monthly_amount || 600).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Condições de Pagamento & Termos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-md space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider">
                    Condições de Pagamento & Fidelidade
                  </h4>
                  <p className="text-xs text-slate-300 print:text-gray-800">
                    {quote.payment_terms || `Setup de R$ ${Number(quote.setup_amount || 2500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no aceite + Plano de Continuidade de R$ ${Number(quote.monthly_amount || 600).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês com contrato de fidelidade de ${quote.contract_duration_months || 12} meses.`}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-md space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider">
                    Investimento Total
                  </h4>
                  <p className="text-xl font-bold font-mono text-emerald-400 print:text-black">
                    R$ {totalAmountFormatted}
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-gray-600">
                    * Impostos e licenças inclusos na proposta.
                  </p>
                </div>
              </div>

              {/* Assinatura / Aceite Comercial */}
              <div className="pt-12 grid grid-cols-2 gap-12 border-t border-slate-800 print:border-gray-300 text-center">
                <div className="space-y-1">
                  <div className="border-b border-slate-700 print:border-black mb-2 w-3/4 mx-auto"></div>
                  <p className="text-xs font-bold text-white print:text-black">Codratec Software House</p>
                  <p className="text-[11px] text-slate-400 print:text-gray-600">Representante Comercial</p>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-slate-700 print:border-black mb-2 w-3/4 mx-auto"></div>
                  <p className="text-xs font-bold text-white print:text-black">{clientName}</p>
                  <p className="text-[11px] text-slate-400 print:text-gray-600">Aceite do Contratante</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
