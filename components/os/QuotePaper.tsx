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
  if (!Number.isFinite(n) || n < 0) return '[PREENCHER]';
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function investmentLines(quote: any) {
  const items = Array.isArray(quote.items)
    ? [...quote.items].sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    : [];
  return items.map((item: any) => ({
    title: item.title,
    note: item.description || '',
    qty: Number(item.quantity || 1),
    total: Number(item.total_price || Number(item.unit_price || 0) * Number(item.quantity || 1)),
  }));
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
      return `${dateBr(quote.valid_until)} · ${days} dias`;
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
    <section className="qc-sec">
      <h2>
        <b>{n}</b>
        {title}
      </h2>
      <div className="qc-sec__body">{children}</div>
    </section>
  );
}

export function QuotePaper({ quote }: { quote: any }) {
  const clientName = fill(quote.client?.name || quote.client?.company);
  const projectName = fill(quote.title);
  const need = fill(quote.solicitation);
  const objective = fill(quote.proposed_solution || quote.solicitation);
  const issued = dateBr(quote.created_at || new Date().toISOString());
  const lines = investmentLines(quote);
  const computedTotal =
    lines.length > 0 ? lines.reduce((sum, line) => sum + line.total, 0) : Number(quote.total_amount || 0);
  const total = moneyOrFill(computedTotal);
  const payment = fill(quote.payment_terms);
  const prazo = prazoLabel(quote);
  const validade = validityLabel(quote);
  const scopes = scopeLines(quote);
  const doc = quoteNumberLabel(quote);

  return (
    <article className="quote-paper quote-commercial">
      <header className="qc-letterhead">
        <div className="qc-letterhead__brand">
          <img src="/codratec-logo.png" alt="" />
          <div>
            <strong>CODRATEC</strong>
            <em>Software House</em>
          </div>
        </div>
        <div className="qc-letterhead__doc">
          <span>Proposta comercial</span>
          <strong>{doc}</strong>
          <small>Uso confidencial do destinatário</small>
        </div>
      </header>

      <div className="qc-hero">
        <p className="qc-kicker">Projeto</p>
        <h1>{projectName}</h1>
        <dl>
          <div>
            <dt>Cliente</dt>
            <dd>{clientName}</dd>
          </div>
          <div>
            <dt>Emissão</dt>
            <dd>{issued}</dd>
          </div>
          <div>
            <dt>Validade</dt>
            <dd>{validade}</dd>
          </div>
          <div>
            <dt>Prazo</dt>
            <dd>{prazo}</dd>
          </div>
        </dl>
      </div>

      <Section n="01" title="Apresentação">
        <p>
          A Codratec desenvolve software sob medida para operações que exigem controle, clareza e continuidade.
          Esta proposta descreve o que está sendo contratado no projeto <strong>{projectName}</strong> para{' '}
          <strong>{clientName}</strong> — objetivo, entregáveis, investimento e condições — em nível suficiente para
          aprovação comercial.
        </p>
        <p>
          Após o aceite, será elaborado o detalhamento funcional e técnico das entregas, com regras de negócio e
          critérios de aceite, como referência para a execução. Esse detalhamento não amplia o que foi aprovado
          aqui; ele especifica o que já está contratado.
        </p>
      </Section>

      <Section n="02" title="Objetivo">
        <div className="qc-split">
          <div>
            <h3>Necessidade</h3>
            <p>{need}</p>
          </div>
          <div>
            <h3>Resultado esperado</h3>
            <p className="whitespace-pre-line">{objective}</p>
          </div>
        </div>
      </Section>

      <Section n="03" title="Escopo comercial">
        <p>
          Os entregáveis abaixo definem o limite desta contratação. O preço e o prazo são aprovados com base nesta
          lista.
        </p>
        {scopes.length > 0 ? (
          <ol className="qc-deliverables">
            {scopes.map((line, i) => (
              <li key={line}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {line}
              </li>
            ))}
          </ol>
        ) : (
          <p className="quote-fill">[PREENCHER]</p>
        )}
      </Section>

      <Section n="04" title="Investimento">
        {lines.length > 0 ? (
          <table className="qc-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Detalhe</th>
                <th>Qtd</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={`${line.title}-${line.note}`}>
                  <td>{line.title}</td>
                  <td>{line.note || '—'}</td>
                  <td>{line.qty}</td>
                  <td>{moneyOrFill(line.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Investimento total</td>
                <td>{total}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="qc-total-only">
            <span>Investimento total</span>
            <strong>{total}</strong>
          </div>
        )}
      </Section>

      <Section n="05" title="Pagamento e prazo">
        <div className="qc-split">
          <div>
            <h3>Condições de pagamento</h3>
            <p className="whitespace-pre-line">{payment}</p>
          </div>
          <div>
            <h3>Prazo de entrega</h3>
            <p>
              Estimativa: <strong>{prazo}</strong>. A contagem inicia após o aceite, o pagamento inicial quando
              aplicável e o envio, pelo cliente, das informações e acessos necessários.
            </p>
          </div>
        </div>
      </Section>

      <Section n="06" title="Inclusões e exclusões">
        <div className="qc-split">
          <div>
            <h3>Incluso</h3>
            <ul>
              <li>Desenvolvimento dos entregáveis desta proposta</li>
              <li>SOW após o aceite, com regras e critérios de aceite</li>
              <li>Implantação no ambiente acordado</li>
              <li>Orientação inicial de uso</li>
              <li>Ajustes corretivos do contratado, até a entrega</li>
            </ul>
          </div>
          <div>
            <h3>Não incluso</h3>
            <ul>
              <li>Funcionalidades além desta lista</li>
              <li>Licenças e serviços de terceiros</li>
              <li>Taxas de APIs e provedores externos</li>
              <li>Domínio, certificado e nuvem não previstos</li>
              <li>Integrações não listadas</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section n="07" title="Alterações de escopo">
        <p>
          Itens que ultrapassem estes entregáveis, ou que surjam após a validação do SOW, serão avaliados e, se
          pertinentes, orçados à parte — sem alterar automaticamente valor ou prazo desta proposta.
        </p>
      </Section>

      <Section n="08" title="Próximos passos">
        <ol className="qc-steps">
          <li>Aprovação desta proposta</li>
          <li>Contrato ou aceite formal</li>
          <li>Pagamento inicial, se previsto</li>
          <li>SOW e validação do detalhamento</li>
          <li>Desenvolvimento, testes e aceite</li>
          <li>Entrega</li>
        </ol>
      </Section>

      <Section n="09" title="Aceite">
        <p>
          O signatário declara ter lido esta proposta, compreender os entregáveis e concordar com o investimento e
          as condições. O aceite autoriza a formalização contratual e a elaboração do SOW para executar o que foi
          aprovado.
        </p>
        <div className="qc-sign">
          <div>
            <i />
            <p>Codratec Software House</p>
            <span>Representante comercial · {issued}</span>
          </div>
          <div>
            <i />
            <p>{clientName}</p>
            <span>Aceite do contratante · data ____/____/________</span>
          </div>
        </div>
      </Section>

      <footer className="qc-foot">
        Codratec Software & Soluções Digitais Ltda. · contato@codratec.com.br · www.codratec.com.br · {doc}
      </footer>
    </article>
  );
}
