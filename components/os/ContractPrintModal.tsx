'use client';

import { useState } from 'react';
import { ShieldCheck, Printer, X, FileText, CheckCircle2, Building2 } from 'lucide-react';

interface ContractPrintModalProps {
  quote: any;
}

export function ContractPrintModal({ quote }: ContractPrintModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const clientName = quote.client?.name || 'CONTRATANTE';
  const clientCompany = quote.client?.company || clientName;
  const clientDocument = quote.client?.document || 'CNPJ/CPF NÃO INFORMADO';
  const clientCity = quote.client?.city || 'Nova Iguaçu';
  const clientState = quote.client?.state || 'RJ';
  const contractNumber = String(quote.quote_number || quote.id?.substring(0, 6) || '001').padStart(3, '0');
  const year = new Date().getFullYear();

  const totalAmountFormatted = Number(quote.total_amount || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-medium flex items-center gap-1 transition"
      >
        <ShieldCheck className="w-3.5 h-3.5" /> Ver Contrato / PDF
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex justify-center p-4 sm:p-6 print:p-0 print:bg-white">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-md p-6 sm:p-10 shadow-2xl space-y-8 print:border-0 print:shadow-none print:bg-white print:text-black print:p-0 print:m-0">
            {/* Barra de Ações (Oculta na Impressão) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Contrato Jurídico de Prestação de Serviços #{contractNumber}</h2>
                  <p className="text-[11px] text-slate-400">Documento formal com cláusulas de escopo, LGPD, garantia e propriedade intelectual</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="cnpja-button-primary text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                >
                  <Printer className="w-4 h-4" /> Gerar PDF do Contrato
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cnpja-button-secondary text-xs"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>
              </div>
            </div>

            {/* DOCUMENTO JURÍDICO DO CONTRATO (Formatado para Tela & PDF Impresso) */}
            <div className="space-y-6 text-slate-200 print:text-black font-sans text-xs leading-relaxed">
              {/* Cabeçalho do Contrato */}
              <div className="text-center border-b border-slate-800 print:border-gray-400 pb-6 space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src="/codratec-logo.png"
                    alt="Codratec Logo"
                    className="w-10 h-10 rounded-md object-cover border border-slate-800 print:border-gray-400 shrink-0"
                  />
                  <h1 className="text-xl font-black text-white print:text-black tracking-widest uppercase">
                    CODRATEC SOFTWARE HOUSE
                  </h1>
                </div>
                <h2 className="text-base font-bold text-emerald-400 print:text-black uppercase tracking-wide">
                  CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO DE SOFTWARE E TECNOLOGIA
                </h2>
                <p className="text-[11px] font-mono text-slate-400 print:text-gray-600">
                  CONTRATO Nº CT-{year}-{contractNumber}
                </p>
              </div>

              {/* Qualificação das Partes */}
              <div className="space-y-3 bg-slate-950/60 print:bg-gray-50 p-4 rounded-md border border-slate-800 print:border-gray-300">
                <h3 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] border-b border-slate-800 print:border-gray-300 pb-1">
                  QUALIFICAÇÃO DAS PARTES
                </h3>

                <p>
                  <strong>CONTRATADA:</strong> <strong>CODRATEC SOFTWARE & SOLUÇÕES DIGITAIS LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o número comercial ativo, com sede operacional em Nova Iguaçu/RJ, doravante denominada simplesmente <strong>CONTRATADA</strong>.
                </p>

                <p>
                  <strong>CONTRATANTE:</strong> <strong>{clientCompany.toUpperCase()}</strong>, inscrita no CNPJ/CPF sob o nº <strong>{clientDocument}</strong>, com sede/domicílio em {clientCity}/{clientState}, doravante denominada simplesmente <strong>CONTRATANTE</strong>.
                </p>

                <p className="italic text-slate-400 print:text-gray-700 text-[11px]">
                  As partes acima qualificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços de Tecnologia, mediante as seguintes cláusulas e condições:
                </p>
              </div>

              {/* Cláusula 1 - Do Objeto */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA PRIMEIRA — DO OBJETO DO CONTRATO
                </h3>
                <p>
                  1.1. O presente instrumento tem por objeto a prestação de serviços técnicos especializados de arquitetura, desenvolvimento de software sob medida, engenharia de sistemas e licenciamento da aplicação intitulada: <strong>"{quote.title}"</strong>.
                </p>
                {quote.description && (
                  <div className="bg-slate-950/40 print:bg-transparent p-3 rounded border border-slate-900 print:border-0 text-slate-300 print:text-gray-800">
                    <strong>Resumo do Escopo Contratado:</strong>
                    <p className="mt-1 whitespace-pre-line">{quote.description}</p>
                  </div>
                )}
              </div>

              {/* Cláusula 2 - Das Obrigações da Contratada */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA SEGUNDA — DAS OBRIGAÇÕES DA CONTRATADA (CODRATEC)
                </h3>
                <p>2.1. A <strong>CONTRATADA</strong> se obriga a executar os serviços de desenvolvimento com estrita observância às melhores práticas de engenharia de software, segurança de dados e padrões de qualidade.</p>
                <p>2.2. Entregar o projeto no prazo estipulado de <strong>{quote.delivery_deadline_days || 30} dias úteis</strong>, contados a partir do recebimento da primeira parcela e do envio de todas as informações necessárias pelo <strong>CONTRATANTE</strong>.</p>
                <p>2.3. Prestar suporte técnico corretivo para resolução de eventuais falhas operacionais (bugs) decorrentes do escopo contratado pelo período de garantia estipulado neste contrato.</p>
              </div>

              {/* Cláusula 3 - Das Obrigações do Contratante */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DO CONTRATANTE
                </h3>
                <p>3.1. O <strong>CONTRATANTE</strong> compromete-se a fornecer tempestivamente todas as informações, marcas, logotipos, acessos e conteúdos institucionais indispensáveis ao desenvolvimento do sistema.</p>
                <p>3.2. Efetuar o pagamento dos valores acordados nas datas de vencimento estipuladas na Cláusula Quarta.</p>
                <p>3.3. Testar e validar os módulos disponibilizados em ambiente de homologação no prazo máximo de 5 (cinco) dias úteis após cada entrega parcial.</p>
              </div>

              {/* Cláusula 4 - Do Valor, Plano de Continuidade e Pagamento */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA QUARTA — DO VALOR, PLANO DE CONTINUIDADE E CONDIÇÕES DE PAGAMENTO
                </h3>
                <p>
                  4.1. <strong>Do Setup de Implantação:</strong> Pelos serviços de desenvolvimento sob medida, configuração de ambiente e publicação inicial, o <strong>CONTRATANTE</strong> pagará à <strong>CONTRATADA</strong> o valor único de <strong>R$ {Number(quote.setup_amount || 2500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> no ato da assinatura.
                </p>
                <p>
                  4.2. <strong>Do Plano de Continuidade Codratec:</strong> O <strong>CONTRATANTE</strong> contratará o Plano de Continuidade no valor mensal de <strong>R$ {Number(quote.monthly_amount || 600).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</strong>, o qual abrange a infraestrutura de hospedagem em nuvem, suporte técnico corretivo, aplicação de patches de segurança, backups diários e monitoramento operacional.
                </p>
                <p>
                  4.3. <strong>Da Fidelidade e Vigência:</strong> Este contrato possui prazo de vigência e fidelidade mínima de <strong>{quote.contract_duration_months || 12} ({quote.contract_duration_months || 12 === 12 ? 'doze' : quote.contract_duration_months}) meses</strong> a contar da assinatura. A rescisão antecipada por iniciativa do CONTRATANTE sujeitará à multa moratória compensatória equivalente a 30% (trinta por cento) sobre o saldo de mensalidades vincendas até o término do contrato.
                </p>
                <p>
                  4.4. O atraso em qualquer pagamento sujeitará o débito à incidência de multa de 2% (dois por cento) e juros de mora de 1% (um por cento) ao mês.
                </p>
              </div>

              {/* Cláusula 5 - Propriedade Intelectual & Código-Fonte */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA QUINTA — DA PROPRIEDADE INTELECTUAL E DIREITO DE USO
                </h3>
                <p>
                  5.1. Mediante a quitação integral do valor estabelecido neste contrato, o <strong>CONTRATANTE</strong> passará a deter a licença de uso exclusiva ou propriedade da solução desenvolvida sob medida.
                </p>
                <p>
                  5.2. Componentes de código de terceiros, bibliotecas open-source e infraestruturas padrão da <strong>CONTRATADA</strong> permanecem sob suas respectivas licenças originais.
                </p>
              </div>

              {/* Cláusula 6 - Confidencialidade & LGPD */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA SEXTA — DA CONFIDENCIALIDADE E PROTEÇÃO DE DADOS (LGPD)
                </h3>
                <p>
                  6.1. As partes comprometem-se a manter absoluto sigilo sobre todas as informações estratégicas, comerciais e técnicas trocadas em razão deste contrato.
                </p>
                <p>
                  6.2. As partes declaram-se cientes e em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), garantindo a privacidade e segurança do tratamento de dados pessoais.
                </p>
              </div>

              {/* Cláusula 7 - Garantia */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA SÉTIMA — DA GARANTIA E SUPORTE
                </h3>
                <p>
                  7.1. A <strong>CONTRATADA</strong> concede garantia de 90 (noventa) dias para correção sem custos adicionais de desconformidades ou vícios de programação (bugs) em relação ao escopo aprovado, contados a partir da data de entrega do sistema.
                </p>
              </div>

              {/* Cláusula 8 - Do Foro */}
              <div className="space-y-2">
                <h3 className="font-bold text-blue-400 print:text-black uppercase text-xs">
                  CLÁUSULA OITAVA — DO FORO
                </h3>
                <p>
                  8.1. Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o Foro da Comarca de Nova Iguaçu/RJ, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
                </p>
              </div>

              {/* Fechamento & Assinaturas */}
              <div className="pt-8 space-y-6">
                <p className="text-center font-medium">
                  E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma.
                </p>

                <p className="text-right font-mono text-[11px] text-slate-400 print:text-gray-700">
                  {clientCity}/{clientState}, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                </p>

                <div className="pt-10 grid grid-cols-2 gap-12 text-center border-t border-slate-800 print:border-gray-400">
                  <div className="space-y-1">
                    <div className="border-b border-slate-700 print:border-black mb-2 w-3/4 mx-auto"></div>
                    <p className="font-bold text-white print:text-black text-xs">CODRATEC SOFTWARE HOUSE LTDA</p>
                    <p className="text-[11px] text-slate-400 print:text-gray-600">Contratada</p>
                  </div>

                  <div className="space-y-1">
                    <div className="border-b border-slate-700 print:border-black mb-2 w-3/4 mx-auto"></div>
                    <p className="font-bold text-white print:text-black text-xs">{clientCompany.toUpperCase()}</p>
                    <p className="text-[11px] text-slate-400 print:text-gray-600">Contratante — Representante Legal</p>
                  </div>
                </div>

                {/* Testemunhas */}
                <div className="pt-6 grid grid-cols-2 gap-12 text-center text-[10px] text-slate-400 print:text-gray-600">
                  <div>
                    <div className="border-b border-slate-800 print:border-gray-400 mb-1 w-2/3 mx-auto"></div>
                    <p>Testemunha 1 (Nome e CPF)</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-800 print:border-gray-400 mb-1 w-2/3 mx-auto"></div>
                    <p>Testemunha 2 (Nome e CPF)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
