# Permissões

Há três camadas, da mais fraca para a mais forte:

1. **Menu** (`lib/permissions/index.ts#MODULE_PERMISSIONS`, usado pela `Sidebar`): esconde módulos. Não protege nada, a URL continua abrindo.
2. **Checagem no servidor**: algumas páginas redirecionam e algumas server actions recusam. Protege contra uso normal do app.
3. **RLS no Postgres**: a única camada que vale contra quem chama o Supabase direto do navegador com a anon key (que é pública) e a própria sessão.

## Matriz atual

| Módulo | Menu mostra para | Página checa no servidor | Actions checam | RLS restringe |
| --- | --- | --- | --- | --- |
| Painel | todos | não | não | não |
| Leads | admin, gerente, vendedor | não | não (só login em atividades/briefing) | não (qualquer colaborador) |
| Consultores (metas) | admin, gerente, vendedor | não | `deleteSalesGoal` exige admin | sim, admin |
| Clientes | admin, gerente, vendedor | não | não | não |
| Orçamentos | admin, gerente | só a de edição | sim, admin/gerente | não |
| Fila de propostas | admin, gerente | — | sim (`canHandleHandoffs`) | parcial (update/delete) |
| Projetos | admin, gerente, dev, vendedor | não | não | não |
| Demandas | admin, gerente, dev | não | não | não |
| Equipe | admin | sim | sim (`assertIsAdmin`) | profiles: sim após migração 24 |
| Financeiro | admin | sim | **não** | **não** |
| Configurações | admin | sim | sim | sim |
| E-mail Brevo | admin com e-mail em `BREVO_ALLOWED_USER_EMAIL` | — | sim | — |

Leitura prática: hoje qualquer colaborador ativo consegue, pelo console do navegador, ler e alterar leads de qualquer consultor, orçamentos, receitas e despesas. Com um único colaborador (o admin) isso não importa ainda; passa a importar no primeiro convite. Restringir por papel na RLS é uma decisão de produto pendente (ver [adr/0002](adr/0002-rls-como-fronteira-de-acesso.md)).

## Regras ao criar uma action nova

- Leitura de dados de outro papel: confie na RLS e escreva a policy junto, na migration.
- Escrita que só admin/gerente pode fazer: chame `assertIsAdmin()` ou `canHandleHandoffs(profile.role)` no começo da action, **e** tenha a policy equivalente.
- Papel ausente é "sem acesso". As funções de `lib/permissions` falham fechadas.
- Nunca use o cliente admin (`createAdminClient`, service role) para dados de usuário; ele ignora a RLS. Hoje só é usado para convidar e excluir colaboradores.
