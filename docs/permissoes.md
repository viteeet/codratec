# Permissões

Há três camadas, da mais fraca para a mais forte:

1. **Menu** (`lib/permissions/index.ts#MODULE_PERMISSIONS`, usado pela `Sidebar`): esconde módulos. Não protege nada, a URL continua abrindo.
2. **Checagem no servidor**: algumas páginas redirecionam e algumas server actions recusam. Protege contra uso normal do app.
3. **RLS no Postgres**: a única camada que vale contra quem chama o Supabase direto do navegador com a anon key (que é pública) e a própria sessão.

## Matriz atual

| Módulo | Menu mostra para | Página checa no servidor | Actions checam | RLS restringe (migração 25) |
| --- | --- | --- | --- | --- |
| Painel | todos | não | não | os números seguem a RLS de cada tabela |
| Leads | admin, gerente, vendedor | não | não (só login em atividades/briefing) | sim: vendedor vê os dele e a fila; dev nada |
| Consultores (metas) | admin, gerente, vendedor | não | `deleteSalesGoal` exige admin | sim, admin |
| Clientes | admin, gerente, vendedor | não | não | leitura aberta; exclusão admin/gerente |
| Orçamentos | admin, gerente | só a de edição | sim, admin/gerente | sim: vendedor só lê |
| Fila de propostas | admin, gerente | — | sim (`canHandleHandoffs`) | parcial (update/delete) |
| Projetos | admin, gerente, dev, vendedor | não | não | não |
| Demandas | admin, gerente, dev | não | não | não |
| Equipe | admin | sim | sim (`assertIsAdmin`) | sim (trigger em profiles) |
| Financeiro | admin | sim | não | sim, admin |
| Configurações | admin | sim | sim | sim |
| E-mail Brevo | admin com e-mail em `BREVO_ALLOWED_USER_EMAIL` | — | sim | — |

Projetos e demandas continuam abertos a toda a equipe de propósito. Ver [adr/0002](adr/0002-rls-como-fronteira-de-acesso.md).

## Regras ao criar uma action nova

- Leitura de dados de outro papel: confie na RLS e escreva a policy junto, na migration.
- Escrita que só admin/gerente pode fazer: chame `assertIsAdmin()` ou `canHandleHandoffs(profile.role)` no começo da action, **e** tenha a policy equivalente.
- Papel ausente é "sem acesso". As funções de `lib/permissions` falham fechadas.
- Nunca use o cliente admin (`createAdminClient`, service role) para dados de usuário; ele ignora a RLS. Hoje só é usado para convidar colaboradores e no cron da Brevo.
