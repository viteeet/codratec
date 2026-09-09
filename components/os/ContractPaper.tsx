export function ContractPaper({ quote }: { quote: any }) {
  const clientName = quote.client?.name || 'CONTRATANTE';
  const clientCompany = quote.client?.company || clientName;
  const clientDocument = quote.client?.document || 'CNPJ/CPF NÃO INFORMADO';
  const clientCity = quote.client?.city || 'Nova Iguaçu';
  const clientState = quote.client?.state || 'RJ';
  const contractNumber = String(quote.quote_number || quote.id?.substring(0, 6) || '001').padStart(3, '0');
  const year = new Date().getFullYear();
  const duration = quote.contract_duration_months || 12;

  return (
    <article className="contract-paper">
      <header className="contract-paper__head">
        <img src="/codratec-logo.png" alt="" />
        <div>
          <p>CODRATEC SOFTWARE HOUSE</p>
          <h1>Contrato de prestação de serviços de desenvolvimento de software e tecnologia</h1>
          <strong>CT-{year}-{contractNumber}</strong>
        </div>
      </header>

      <section>
        <h2>Qualificação das partes</h2>
        <p>
          <strong>CONTRATADA:</strong> CODRATEC SOFTWARE & SOLUÇÕES DIGITAIS LTDA, pessoa jurídica de direito
          privado, com sede operacional em Nova Iguaçu/RJ, doravante denominada CONTRATADA.
        </p>
        <p>
          <strong>CONTRATANTE:</strong> {clientCompany.toUpperCase()}, inscrita no CNPJ/CPF sob o nº{' '}
          {clientDocument}, com sede/domicílio em {clientCity}/{clientState}, doravante denominada CONTRATANTE.
        </p>
        <p className="contract-paper__muted">
          As partes acima qualificadas têm, entre si, justo e acordado o presente contrato, mediante as seguintes
          cláusulas e condições.
        </p>
      </section>

      <section>
        <h2>Cláusula primeira — Do objeto</h2>
        <p>
          1.1. O presente instrumento tem por objeto a prestação de serviços técnicos de arquitetura, desenvolvimento
          de software sob medida e implantação da solução intitulada <strong>&quot;{quote.title}&quot;</strong>.
        </p>
        {quote.solicitation ? (
          <p>
            <strong>Solicitação:</strong> {quote.solicitation}
          </p>
        ) : null}
        {quote.proposed_solution ? (
          <p>
            <strong>Solução proposta:</strong> {quote.proposed_solution}
          </p>
        ) : null}
        {quote.general_scope ? (
          <p className="whitespace-pre-line">
            <strong>Escopo geral:</strong> {quote.general_scope}
          </p>
        ) : quote.description ? (
          <p className="whitespace-pre-line">
            <strong>Resumo do escopo:</strong> {quote.description}
          </p>
        ) : null}
      </section>

      <section>
        <h2>Cláusula segunda — Obrigações da contratada</h2>
        <p>
          2.1. Executar os serviços com observância às práticas de engenharia de software, segurança e qualidade.
        </p>
        <p>
          2.2. Entregar o projeto no prazo de <strong>{quote.delivery_deadline_days || 30} dias úteis</strong>,
          contados do recebimento da primeira parcela e das informações necessárias.
        </p>
        <p>2.3. Prestar suporte corretivo para falhas do escopo contratado durante o período de garantia.</p>
      </section>

      <section>
        <h2>Cláusula terceira — Obrigações do contratante</h2>
        <p>
          3.1. Fornecer tempestivamente informações, marcas, acessos e conteúdos indispensáveis ao desenvolvimento.
        </p>
        <p>3.2. Efetuar os pagamentos nas datas previstas na cláusula quarta.</p>
        <p>3.3. Validar módulos em homologação em até 5 dias úteis após cada entrega parcial.</p>
      </section>

      <section>
        <h2>Cláusula quarta — Valor e pagamento</h2>
        <p>
          4.1. Setup de implantação:{' '}
          <strong>
            R${' '}
            {Number(quote.setup_amount || quote.total_amount || 0).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </strong>
          .
        </p>
        <p>
          4.2. Plano de continuidade:{' '}
          <strong>
            R${' '}
            {Number(quote.monthly_amount || 0).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}{' '}
            / mês
          </strong>
          , quando contratado, abrangendo hospedagem, suporte corretivo, patches, backups e monitoramento.
        </p>
        <p>
          4.3. Vigência mínima de <strong>{duration} meses</strong>. Rescisão antecipada pelo CONTRATANTE sujeita a
          multa de 30% sobre o saldo de mensalidades vincendas.
        </p>
        <p>4.4. Atraso: multa de 2% e juros de 1% ao mês.</p>
        {quote.payment_terms ? <p className="whitespace-pre-line">4.5. {quote.payment_terms}</p> : null}
      </section>

      <section>
        <h2>Cláusula quinta — Propriedade intelectual</h2>
        <p>
          5.1. Com a quitação integral, o CONTRATANTE passa a deter a licença de uso ou a propriedade da solução
          desenvolvida sob medida.
        </p>
        <p>
          5.2. Bibliotecas de terceiros, código aberto e infraestruturas padrão da CONTRATADA permanecem sob suas
          licenças originais.
        </p>
      </section>

      <section>
        <h2>Cláusula sexta — Confidencialidade e LGPD</h2>
        <p>6.1. As partes manterão sigilo sobre informações estratégicas, comerciais e técnicas deste contrato.</p>
        <p>
          6.2. As partes declaram-se em conformidade com a Lei nº 13.709/2018 (LGPD) quanto ao tratamento de dados
          pessoais.
        </p>
      </section>

      <section>
        <h2>Cláusula sétima — Garantia</h2>
        <p>
          7.1. Garantia de 90 dias para correção, sem custo, de vícios de programação do escopo aprovado, contados da
          entrega.
        </p>
      </section>

      <section>
        <h2>Cláusula oitava — Foro</h2>
        <p>
          8.1. Fica eleito o Foro da Comarca de Nova Iguaçu/RJ, com renúncia a qualquer outro, por mais privilegiado
          que seja.
        </p>
      </section>

      <footer className="contract-paper__sign">
        <p>
          E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 vias de igual teor.
        </p>
        <p className="contract-paper__date">
          {clientCity}/{clientState},{' '}
          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
        </p>
        <div className="contract-paper__signs">
          <div>
            <i />
            <strong>CODRATEC SOFTWARE HOUSE LTDA</strong>
            <span>Contratada</span>
          </div>
          <div>
            <i />
            <strong>{clientCompany.toUpperCase()}</strong>
            <span>Contratante — representante legal</span>
          </div>
        </div>
        <div className="contract-paper__signs contract-paper__signs--small">
          <div>
            <i />
            <span>Testemunha 1 (nome e CPF)</span>
          </div>
          <div>
            <i />
            <span>Testemunha 2 (nome e CPF)</span>
          </div>
        </div>
      </footer>
    </article>
  );
}
