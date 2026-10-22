# Modelo de dados

Banco: Postgres do projeto Supabase `codratec_01` (`pgxhuoaclkeegzkhfnun`, sa-east-1). O mesmo projeto também guarda o **CRM FIDC** (schema `fidc_privado` e funções `crm_fidc_*`). Tudo do Codratec fica no schema `public`.

Volumes em 21/10/2026: 731 leads, 731 atividades, 730 e-mails, 1 orçamento, 1 cliente, 0 projetos, 1 colaborador (admin).

## Tabelas

```
profiles ─┬─< leads.assigned_to
          ├─< lead_activities.user_id, lead_followups.user_id
          ├─< lead_handoffs.requested_by / assigned_to
          ├─< quotes.created_by, tasks.assigned_to, sales_goals.user_id
leads ────┬─< lead_activities, lead_followups, lead_emails, lead_handoffs
          └─< clients.lead_id (cliente nascido de lead ganho)
clients ──┬─< quotes ──< quote_items
          ├─< projects (quote_id → quotes) ──< tasks ──< task_comments, task_attachments
          │                                └─< project_members
          └─< revenues (project_id → projects)
expenses, email_templates, company_settings (linha única id=1)
```

| Tabela | Para que serve | Colunas que importam |
| --- | --- | --- |
| `profiles` | Colaborador do Codratec (1:1 com `auth.users`) | `role`, `active`, `full_name`, `email` |
| `leads` | Empresas a prospectar | `status`, `assigned_to`, `document` (CNPJ/CPF), `company`, `trade_name`, `whatsapp`, `whatsapp_invalid`, `scheduled_call_at`, `share_capital`, `annual_revenue`, `opened_at`, `niche`, `category`, `last_email_*` (resumo do último e-mail) |
| `lead_activities` | Histórico do lead | `type` (LIGAÇÃO, WHATSAPP, EMAIL, REUNIÃO, OBSERVAÇÃO, BRIEFING, PERGUNTA_DEV), `description` |
| `lead_followups` | Lembretes | `scheduled_at`, `status` (PENDENTE, CONCLUIDO, CANCELADO) |
| `lead_emails` | Cada disparo pela Brevo | `message_id`, `status` (ENVIADO, ENTREGUE, LIDO, REJEITADO), `sent_at`, `opened_at` |
| `lead_handoffs` | Briefing para proposta | `status`, `temperature`, `budget_range`, `urgency`, `system_type`, `quote_id` (ainda não preenchido pelo app). Índice único: um briefing aberto por lead |
| `clients` | Conta do cliente | `lead_id`, `document` |
| `quotes` | Orçamento/proposta | `status`, `setup_amount`, `monthly_amount`, `contract_duration_months`, `total_amount`, `valid_until`, `solicitation`, `proposed_solution`, `general_scope` |
| `quote_items` | Linhas de investimento | `unit_price`, `quantity`, `total_price`, `position` |
| `projects` | Projeto contratado | `quote_id` (único, migração 21), `status`, `value`, `monthly_amount`, `next_billing_date`, `contract_status` |
| `tasks` | Demandas | `status` (BACKLOG, TODO, IN_PROGRESS, BLOCKED, REVIEW, DONE), `priority`, `due_date` |
| `revenues` / `expenses` | Financeiro | `status` (PENDENTE, PAGO, ATRASADO, CANCELADO), `due_date` (DATE), `paid_at`, `category` |
| `sales_goals` | Meta mensal por consultor | `user_id`, `year`, `month`, `target_sales_count`, `commission_rate_percent` |
| `email_templates` | Modelos de e-mail | `name` (único), `subject`, `body` |
| `company_settings` | Contato da Codratec usado nos e-mails | linha `id = 1` |

Status de lead aceitos pelo banco: NOVO, CONTATO, QUALIFICADO, CALL_AGENDADA, PROPOSTA, NEGOCIACAO, GANHO, NAO_INTERESSADO, SEM_RESPOSTA, FUTURO (PERDIDO e EM_CONVERSA saíram na migração 25). `won_at` guarda quando o lead virou GANHO; um trigger preenche e limpa.

Colunas `due_date`, `valid_until`, `next_billing_date`, `start_date` são `DATE`. Para mostrar, use `formatDateBR` de `lib/utils.ts`; `new Date('2026-10-21')` aparece como o dia anterior no Brasil.

## Funções auxiliares (SECURITY DEFINER)

- `current_user_role()`: papel do usuário logado.
- `is_admin()`: `current_user_role() = 'admin'`.
- `tem_acesso_codratec()`: existe perfil ativo para o usuário logado. É o que separa a equipe Codratec dos usuários do CRM FIDC.

## RLS (a partir da migração 25)

Regras decididas em 22/10/2026. Todas exigem `tem_acesso_codratec()`.

| Tabela | Ler | Criar / alterar | Excluir |
| --- | --- | --- | --- |
| leads | admin e gerente: todos; vendedor: os dele e a fila pública; dev: nenhum | idem à leitura; vendedor pode pegar da fila ou devolver, não passar a outro | admin |
| lead_activities, lead_followups, lead_emails | quem vê o lead | quem vê o lead | quem vê o lead |
| quotes, quote_items | admin, gerente, vendedor (comissão) | admin, gerente | admin, gerente |
| revenues, expenses | admin | admin; gerente cria receita (aprovação de orçamento) | admin |
| clients | equipe toda | admin, gerente, vendedor | admin, gerente |
| projects, project_members, tasks, task_comments, task_attachments | equipe toda | equipe toda | equipe toda |
| lead_handoffs | equipe toda | cria: equipe; altera: autor ou admin/gerente | admin, gerente |
| profiles | a própria linha; admin vê todas | a própria linha; só admin muda `role`/`active` (trigger `protege_papel_do_perfil`) | — |
| sales_goals | a própria meta; admin todas | admin | admin |
| email_templates, company_settings | equipe toda | admin | admin |

A migração 25 foi testada num Postgres local com um usuário de cada papel e um usuário sem perfil (o caso do CRM FIDC).

## Migrations

Ficam em `supabase/migrations/` numeradas, mas **não são aplicadas automaticamente**: cada uma é rodada à mão no SQL Editor do Supabase. Duas numerações se repetem (`16_*` e `23_*`); a ordem entre as duas de mesmo número não importa. A 04 nunca entrou no banco remoto e foi refeita pela 18.
