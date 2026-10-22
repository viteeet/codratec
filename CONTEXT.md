# Glossário do Codratec OS

Só termos do negócio. Como o código implementa cada um está em [`docs/`](docs/README.md).
Quando um termo tem sinônimos no código ou na tela, o nome canônico vem primeiro.

## Pessoas e papéis

- **Colaborador**: pessoa com linha ativa em `profiles`. Só colaborador entra no painel. Usuário do Supabase Auth sem perfil (ex.: do CRM FIDC, que divide o mesmo projeto Supabase) não é colaborador.
- **Papel** (`role`): `admin`, `gerente`, `vendedor` ou `dev`. Decide o que aparece no menu e o que as server actions permitem.
- **Admin** (dono): faz tudo, inclusive equipe, financeiro e configurações.
- **Gerente**: gerente comercial/operacional. Faz orçamentos e trata a fila de propostas.
- **Consultor**: o papel `vendedor`. Na tela aparece como "Consultor Comercial" e a página é `/vendedores` com título "Consultores". *Evite:* vendedor (só no código), comercial (é a área, não a pessoa).
- **Dev**: desenvolvedor/técnico. Vê projetos e demandas.

## Comercial

- **Lead**: empresa ou pessoa que pode virar cliente. Pode vir do site, de importação JSON (base CNPJ) ou de cadastro manual. Identificado pelo **documento** (CNPJ/CPF só com dígitos) na reimportação.
- **Fila pública**: leads sem consultor (`assigned_to` vazio). Qualquer consultor pode pegar.
- **Atribuir / devolver à fila**: dar um dono ao lead, ou tirar.
- **Status do lead**: etapa no funil. Funil principal: Novo → Contato → Qualificado → Call agendada → Proposta → Negociação → Ganho. Saídas: Não interessado, Sem resposta, Nutrir no futuro (`FUTURO`). 
- **Lead ganho**: status `GANHO`. Ao marcar, o sistema cria o **cliente** automaticamente.
- **Atividade**: registro no histórico do lead (ligação, WhatsApp, e-mail, reunião, observação, briefing, pergunta ao dev).
- **Follow-up**: lembrete com data para voltar a falar com o lead.
- **Call**: reunião comercial agendada (`scheduled_call_at`). Agendar muda o status para Call agendada.
- **WhatsApp inválido**: número marcado como errado; esconde o atalho de WhatsApp da ficha.
- **Ficha do lead**: o painel lateral (`LeadDrawer`) com dados, funil, próximo passo e histórico.

## Passagem para proposta

- **Briefing**: resumo que o consultor manda quando o lead quer proposta (conversa, necessidade, tipo de sistema, orçamento, urgência, decisor, temperatura). No código: `lead_handoffs`. *Evite:* handoff na tela.
- **Fila de propostas** ("Propostas a fazer"): briefings abertos, tratados por admin ou gerente em `/orcamentos?aba=propostas`.
- **Temperatura**: quente, morno ou frio, na visão do consultor.
- **Status do briefing**: Enviado → Em análise → Precisa de informação → Orçamento criado, ou Cancelado. Só um briefing aberto por lead.

## Orçamentos e projetos

- **Orçamento** = **proposta** (`quotes`). A tela usa os dois nomes; no banco é sempre `quotes`. Tem linhas de investimento (`quote_items`), setup, mensalidade e prazo de contrato.
- **Status do orçamento**: Rascunho, Enviado, Visualizado, Negociação, Aprovado, Recusado, Expirado.
- **Orçamento aprovado**: ao aprovar, o sistema cria o **projeto**, as **receitas** (setup e todas as mensalidades) e as **demandas** iniciais a partir do escopo, e marca o lead de origem como Ganho.
- **Cliente** (`clients`): conta de quem comprou. Nasce de um lead ganho ou de cadastro manual. Tem orçamentos, projetos e receitas.
- **Projeto**: trabalho contratado, com valor, setup, mensalidade e próxima cobrança.
- **Demanda** (`tasks`): tarefa de um projeto, no kanban Backlog → A fazer → Em andamento → Bloqueada → Revisão → Feita. *Evite:* task na tela.
- **Setup**: taxa única de implantação. **Mensalidade**: valor recorrente do plano de continuidade.

## Financeiro e metas

- **Receita** (`revenues`) e **despesa** (`expenses`): lançamentos com vencimento e status Pendente, Pago, Atrasado ou Cancelado.
- **Meta mensal**: número de vendas que um consultor deve fechar no mês (`sales_goals`), com a taxa de comissão.
- **Venda do consultor**: lead dele que virou Ganho no mês (`won_at`). Aprovar o orçamento de um cliente vindo de lead marca o lead como Ganho.
- **Comissão**: taxa da meta sobre o valor dos orçamentos aprovados dos leads ganhos.

## E-mail

- **Disparo**: e-mail enviado pela Brevo a um lead, gravado em `lead_emails`. Só o admin autorizado (`BREVO_ALLOWED_USER_EMAIL`) envia.
- **Modelo de e-mail**: assunto e corpo com tags do lead (`{{empresa}}`, etc.).
- **Cota diária**: limite de envios por dia da conta Brevo (300 no plano atual).
- **Status do e-mail**: Enviado, Entregue, Lido, Rejeitado, atualizado ao sincronizar os eventos da Brevo.
