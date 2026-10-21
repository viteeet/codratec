# 0002. RLS como fronteira de acesso, papéis checados no app

**Status:** em vigor, com uma pergunta em aberto

## Contexto

As server actions usam o cliente Supabase com a sessão do usuário, e a anon key está no navegador. Qualquer colaborador pode chamar o PostgREST direto. Logo, só a RLS protege dados de verdade.

A migração 22 trocou todas as policies das tabelas de negócio por uma única `FOR ALL` liberada para qualquer colaborador ativo (`tem_acesso_codratec()`). Isso anulou as regras antigas por papel ("vendedor vê só os próprios leads e a fila pública", financeiro só admin), porque policies permissivas se somam.

## Decisão atual

- RLS separa Codratec de FIDC, mas não separa papéis dentro do Codratec (exceto `profiles`, `sales_goals`, `email_templates`, `company_settings` e o update/delete de `lead_handoffs`).
- Papel é checado no menu, em algumas páginas e em algumas actions.

## Pergunta em aberto

Vendedor e dev devem ver dados de outros papéis (leads de outros consultores, receitas, despesas, orçamentos)? Se não, as policies `FOR ALL` precisam virar policies por papel usando `current_user_role()`. Enquanto há um único colaborador, a diferença não aparece.
