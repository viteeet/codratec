import type { ReactNode } from 'react';

export function quoteNumberLabel(quote: { quote_number?: number | null; id?: string | null }) {
  return `ORC-${new Date().getFullYear()}-${String(quote.quote_number || quote.id?.substring(0, 6) || 1).padStart(3, '0')}`;
}

function fill(value: unknown) {
  const text = String(value ?? '').trim();
  return text || '[PREENCHER]';
}

function moneyOrFill(value: unknown) {
  if (value === null || value === undefined || value === '') return '[PREENCHER]';
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '[PREENCHER]';
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function dateBr(value?: string | null) {
  if (!value) return '[PREENCHER]';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '[PREENCHER]';
  return d.toLocaleDateString('pt-BR');
}

function validityLabel(quote: any) {
  if (quote.valid_until) {
    const end = new Date(quote.valid_until);
    const start = new Date(quote.created_at || Date.now());
    if (!Number.isNaN(end.getTime())) {
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
      return `${dateBr(quote.valid_until)} (${days} dias a partir da emissão)`;
    }
  }
  return '[PREENCHER]';
}

function prazoLabel(quote: any) {
  const days = Number(quote.delivery_deadline_days);
  if (!Number.isFinite(days) || days <= 0) return '[PREENCHER]';
  return `${days} dias úteis`;
}

function scopeLines(quote: any): string[] {
  const raw = String(quote.general_scope || '').trim();
  if (!raw) return [];
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="quote-section">
      <h2>
        <span>{n}</span>
        {title}
      </h2>
      <div className="quote-section__body">{children}</div>
    </section>
  );
}

export function QuotePaper({ quote }: { quote: any }) {
  const clientName = fill(quote.client?.name || quote.client?.company);
  const projectName = fill(quote.title);
  const need = fill(quote.solicitation);
  const objective = fill(quote.proposed_solution || quote.solicitation);
  const issued = dateBr(quote.created_at || new Date().toISOString());
  const total = moneyOrFill(quote.total_amount);
  const payment = fill(quote.payment_terms);
  const prazo = prazoLabel(quote);
  const validade = validityLabel(quote);
  const scopes = scopeLines(quote);
  const doc = quoteNumberLabel(quote);

  return (
    <article className="quote-paper quote-commercial">
      <header className="quote-cover">
        <p className="quote-cover__brand">CODRATEC SOFTWARE HOUSE</p>
        <p className="quote-cover__kind">Proposta comercial</p>
        <h1>{projectName}</h1>
        <dl className="quote-cover__meta">
          <div>
            <dt>Cliente</dt>
            <dd>{clientName}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>{doc}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{issued}</dd>
          </div>
        </dl>
        <p className="quote-cover__legal">
          Codratec Software & Soluções Digitais Ltda. · contato@codratec.com.br · www.codratec.com.br
        </p>
      </header>

      <Section n="01" title="Apresentação">
        <p>
          A Codratec Software House desenvolve sistemas sob medida para empresas que precisam de controle,
          previsibilidade e operação digital com responsabilidade técnica.
        </p>
        <p>
          Esta proposta apresenta a solução comercial para o projeto <strong>{projectName}</strong>, destinado a{' '}
          <strong>{clientName}</strong>, descrevendo o objetivo, o escopo resumido, o investimento e as condições
          para aceite. O detalhamento técnico e as regras específicas serão formalizados após a aprovação comercial,
          antes do início do desenvolvimento.
        </p>
      </Section>

      <Section n="02" title="Objetivo do projeto">
        <p>Necessidade identificada:</p>
        <p className="quote-quote">{need}</p>
        <p>Resultado esperado:</p>
        <p className="whitespace-pre-line">{objective}</p>
      </Section>

      <Section n="03" title="Escopo resumido">
        <p>
          Seguem as principais entregas previstas. Esta seção não substitui a especificação técnica, que será
          validada após o aceite desta proposta.
        </p>
        {scopes.length > 0 ? (
          <ul>
            {scopes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="quote-fill">[PREENCHER]</p>
        )}
        <p>
          O detalhamento técnico, as regras de negócio e os critérios de aceite serão definidos e formalizados após
          a aprovação desta proposta, antes do início do desenvolvimento.
        </p>
      </Section>

      <Section n="04" title="Investimento">
        <p>O valor abaixo contempla a solução completa descrita nesta proposta, sem rateio por funcionalidade.</p>
        <div className="quote-total">
          <span>Investimento total</span>
          <strong>{total}</strong>
        </div>
      </Section>

      <Section n="05" title="Condições de pagamento">
        <p className="whitespace-pre-line">{payment}</p>
      </Section>

      <Section n="06" title="Prazo">
        <p>
          Prazo estimado de entrega: <strong>{prazo}</strong>.
        </p>
        <p>
          A contagem inicia após a aprovação desta proposta, o pagamento inicial quando aplicável e a disponibilização,
          pelo cliente, das informações, acessos e materiais necessários ao desenvolvimento.
        </p>
      </Section>

      <Section n="07" title="O que está incluso">
        <ul>
          <li>Desenvolvimento da solução descrita no escopo resumido</li>
          <li>Implantação no ambiente acordado com o cliente</li>
          <li>Orientação inicial de uso para a equipe indicada</li>
          <li>Ajustes corretivos do que foi contratado, durante o período de entrega</li>
        </ul>
      </Section>

      <Section n="08" title="O que não está incluso">
        <ul>
          <li>Novas funcionalidades além do escopo aprovado</li>
          <li>Serviços e licenças de terceiros</li>
          <li>Taxas de APIs, mensageria, gateways ou provedores externos</li>
          <li>Domínio, certificado e hospedagem em nuvem não previstos nesta proposta</li>
          <li>Integrações não listadas no escopo resumido</li>
        </ul>
      </Section>

      <Section n="09" title="Alterações e novas funcionalidades">
        <p>
          Pedidos de alteração ou novas funcionalidades após a aprovação do escopo detalhado serão avaliados pela
          Codratec e, quando pertinentes, orçados em proposta complementar, sem impacto automático no valor ou no
          prazo desta contratação.
        </p>
      </Section>

      <Section n="10" title="Próximos passos">
        <ol>
          <li>Aprovação desta proposta comercial</li>
          <li>Formalização do contrato ou aceite</li>
          <li>Detalhamento e validação do escopo técnico</li>
          <li>Definição das etapas de desenvolvimento</li>
          <li>Início do projeto</li>
        </ol>
      </Section>

      <Section n="11" title="Validade da proposta">
        <p>
          Esta proposta é válida até <strong>{validade}</strong>. Após essa data, valores, prazo e condições poderão
          ser revisados.
        </p>
      </Section>

      <Section n="12" title="Aceite">
        <p>
          Ao assinar abaixo, o cliente declara ter lido esta proposta, concordar com o objeto, o investimento e as
          condições apresentadas, e autorizar a Codratec a avançar para a formalização contratual e o detalhamento
          do projeto.
        </p>
        <div className="quote-sign">
          <div>
            <div className="quote-sign__line" />
            <p>Codratec Software House</p>
            <span>Representante comercial</span>
          </div>
          <div>
            <div className="quote-sign__line" />
            <p>{clientName}</p>
            <span>Aceite do contratante</span>
          </div>
        </div>
      </Section>
    </article>
  );
}
