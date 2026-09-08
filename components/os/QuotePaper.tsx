import { Building2 } from 'lucide-react';

export function quoteNumberLabel(quote: { quote_number?: number | null; id?: string | null }) {
  return `ORC-${new Date().getFullYear()}-${String(quote.quote_number || quote.id?.substring(0, 6) || 1).padStart(3, '0')}`;
}

function money(value: unknown) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function QuotePaper({ quote }: { quote: any }) {
  const clientName = quote.client?.name || 'Cliente';
  const clientCompany = quote.client?.company || '';
  const clientDocument = quote.client?.document || 'Não informado';
  const validUntilDate = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString('pt-BR')
    : '15 dias';

  return (
    <article className="quote-paper border border-neutral-200 rounded-md p-8 sm:p-12 space-y-10 font-sans text-base leading-7 print:border-0 print:shadow-none">
      <div className="flex justify-between items-start gap-8 border-b border-neutral-300 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/codratec-logo.png"
              alt="Codratec"
              className="w-14 h-14 rounded-md object-cover border border-neutral-300 shrink-0"
            />
            <h1 className="text-3xl font-black tracking-wider uppercase">CODRATEC</h1>
          </div>
          <p className="text-sm font-medium">Codratec Software & Soluções Digitais Ltda.</p>
          <p className="text-sm">contato@codratec.com.br | www.codratec.com.br</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-bold uppercase tracking-wider text-blue-800">
            PROPOSTA COMERCIAL
          </span>
          <p className="text-2xl font-bold font-mono mt-1">Nº {quoteNumberLabel(quote)}</p>
          <p className="text-sm mt-2">Emissão: {new Date(quote.created_at || Date.now()).toLocaleDateString('pt-BR')}</p>
          <p className="text-sm">Validade: {validUntilDate}</p>
        </div>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-5 space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
          Dados do Cliente / Contratante
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-xl">{clientName}</p>
            {clientCompany ? (
              <p className="font-medium flex items-center gap-1 mt-1">
                <Building2 className="w-4 h-4 text-blue-800" /> {clientCompany}
              </p>
            ) : null}
          </div>
          <div>
            <p>
              CNPJ/CPF: <span className="font-mono font-bold">{clientDocument}</span>
            </p>
            {quote.client?.email ? <p>E-mail: {quote.client.email}</p> : null}
            {quote.client?.phone ? <p>Telefone: {quote.client.phone}</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800">Objeto</h3>
        <h2 className="text-2xl font-bold">{quote.title}</h2>
      </div>

      {quote.solicitation ? (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800">Solicitação</h3>
          <p className="whitespace-pre-line">{quote.solicitation}</p>
        </div>
      ) : null}

      {quote.proposed_solution ? (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800">Solução proposta</h3>
          <p className="whitespace-pre-line">{quote.proposed_solution}</p>
        </div>
      ) : null}

      {quote.general_scope ? (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800">Escopo geral</h3>
          <p className="whitespace-pre-line">{quote.general_scope}</p>
        </div>
      ) : null}

      {!quote.solicitation && !quote.proposed_solution && !quote.general_scope && quote.description ? (
        <p className="whitespace-pre-line bg-neutral-50 p-4 rounded border border-neutral-200">
          {quote.description}
        </p>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800">Investimento</h3>
        <div className="border border-neutral-300 rounded-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-neutral-100 uppercase text-sm font-bold border-b border-neutral-300">
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
                  <p className="text-sm font-normal text-neutral-600 mt-1">
                    Desenvolvimento sob medida, configuração de ambiente, banco de dados, publicação e treinamento inicial.
                  </p>
                </td>
                <td className="p-4 text-right font-mono">Taxa única</td>
                <td className="p-4 text-right font-mono font-bold text-lg">R$ {money(quote.setup_amount ?? 2500)}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">
                  2. Plano de Continuidade Codratec
                  <p className="text-sm font-normal text-neutral-600 mt-1">
                    Hospedagem inclusa, suporte técnico, correção de bugs, backups automáticos e manutenção contínua.
                  </p>
                </td>
                <td className="p-4 text-right font-mono">Mensal ({quote.contract_duration_months || 12}m)</td>
                <td className="p-4 text-right font-mono font-bold text-lg text-blue-800">
                  R$ {money(quote.monthly_amount ?? 600)} /mês
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700">Condições de pagamento</h4>
          <p>
            {quote.payment_terms ||
              `Setup de R$ ${money(quote.setup_amount ?? 2500)} no aceite + Plano de Continuidade de R$ ${money(quote.monthly_amount ?? 600)}/mês com contrato de fidelidade de ${quote.contract_duration_months || 12} meses.`}
          </p>
        </div>
        <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700">Investimento total</h4>
          <p className="text-3xl font-bold font-mono">R$ {money(quote.total_amount)}</p>
          <p className="text-sm text-neutral-600">Impostos e licenças inclusos na proposta.</p>
        </div>
      </div>

      <div className="pt-12 grid grid-cols-2 gap-12 border-t border-neutral-300 text-center">
        <div>
          <div className="border-b border-neutral-800 mb-2 w-3/4 mx-auto" />
          <p className="font-bold">Codratec Software House</p>
          <p className="text-sm text-neutral-600">Representante Comercial</p>
        </div>
        <div>
          <div className="border-b border-neutral-800 mb-2 w-3/4 mx-auto" />
          <p className="font-bold">{clientName}</p>
          <p className="text-sm text-neutral-600">Aceite do Contratante</p>
        </div>
      </div>
    </article>
  );
}
