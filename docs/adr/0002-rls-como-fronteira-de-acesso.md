# 0002. RLS como fronteira de acesso, papéis checados no app

**Status:** aceita (migração 25, decidida em 22/10/2026)

## Contexto

As server actions usam o cliente Supabase com a sessão do usuário, e a anon key está no navegador. Qualquer colaborador pode chamar o PostgREST direto. Logo, só a RLS protege dados de verdade.

A migração 22 trocou todas as policies das tabelas de negócio por uma única `FOR ALL` liberada para qualquer colaborador ativo (`tem_acesso_codratec()`). Isso anulou as regras antigas por papel ("vendedor vê só os próprios leads e a fila pública", financeiro só admin), porque policies permissivas se ## Decisão

Cada papel enxerga no banco só o que é dele, com policies por papel usando `current_user_role()`:

- Leads: admin e gerente veem todos; vendedor vê os dele e a fila pública; dev não vê leads. Histórico do lead segue o lead.
- Orçamentos: admin e gerente alteram; vendedor lê, para calcular a comissão.
- Financeiro: só admin. Gerente pode criar receita, porque a aprovação de orçamento lança as receitas.
- Clientes, projetos e demandas: abertos à equipe.

As checagens de papel no menu e nas actions continuam como segunda camada.

## Consequências

- O painel mostra números diferentes por papel (um dev vê receita zero).
- Toda tabela nova precisa decidir as regras por papel na mesma migration.
