# Codratec OS

## Painel Operacional da Codratec

**Versão:** 1.1  
**Status:** ✅ Concluído & Ativo (Fases 1 a 5 Implementadas)  
**Stack:** Next.js 14 (App Router) + TypeScript + Supabase PostgreSQL + Tailwind CSS + Vercel  
**Objetivo:** Centralizar a operação comercial, administrativa e técnica da Codratec em um único sistema interno.

---

# 1. Visão do Projeto

O **Codratec OS** será o painel operacional interno da Codratec.

O sistema será utilizado para administrar:

- Leads
- Vendedores
- Clientes
- Contatos
- Orçamentos
- Projetos
- Demandas
- Equipe
- Receitas
- Despesas
- Fluxo financeiro
- Indicadores gerenciais

O objetivo é substituir controles espalhados em planilhas, mensagens e ferramentas diferentes por um sistema próprio.

O Codratec OS deverá acompanhar o ciclo completo:

```text
LEAD
  ↓
CONTATO
  ↓
OPORTUNIDADE
  ↓
ORÇAMENTO
  ↓
NEGOCIAÇÃO
  ↓
FECHAMENTO
  ↓
CLIENTE
  ↓
PROJETO
  ↓
DEMANDAS
  ↓
ENTREGA
  ↓
RECEITA
```

---

# 2. Objetivos

## 2.1 Objetivo principal

Criar um sistema interno para que a Codratec consiga controlar sua operação comercial, técnica e financeira.

## 2.2 Objetivos específicos

- Centralizar os leads.
- Distribuir leads para vendedores.
- Controlar o trabalho dos vendedores.
- Registrar contatos e follow-ups.
- Controlar oportunidades comerciais.
- Criar e acompanhar orçamentos.
- Transformar orçamentos aprovados em projetos.
- Dividir projetos em demandas.
- Distribuir demandas para desenvolvedores/ajudantes.
- Controlar prazos.
- Registrar receitas.
- Registrar despesas.
- Acompanhar lucro.
- Criar indicadores gerenciais.
- Controlar usuários e permissões.

---

# 3. Escopo do MVP

O MVP será dividido nos seguintes módulos:

```text
Dashboard
Comercial
  ├── Leads
  ├── Vendedores
  ├── Pipeline
  └── Follow-ups

Clientes

Orçamentos

Projetos

Demandas

Equipe

Financeiro
  ├── Receitas
  ├── Despesas
  └── Fluxo de caixa

Configurações
```

A integração com IA ficará fora do MVP inicial.

---

# 4. Perfis de Usuário

O sistema deverá possuir controle de acesso baseado em função.

## 4.1 Administrador

Perfil principal do proprietário/gestor.

Permissões:

- Visualizar todos os dados.
- Criar usuários.
- Editar usuários.
- Desativar usuários.
- Criar e editar leads.
- Distribuir leads.
- Visualizar vendedores.
- Visualizar clientes.
- Criar orçamentos.
- Gerenciar projetos.
- Gerenciar demandas.
- Gerenciar equipe.
- Visualizar receitas.
- Visualizar despesas.
- Visualizar indicadores.
- Alterar configurações.

---

## 4.2 Vendedor

Usuário responsável pela prospecção e vendas.

Pode:

- Visualizar seus leads.
- Registrar contatos.
- Criar atividades.
- Criar follow-ups.
- Alterar status dos seus leads.
- Criar oportunidades.
- Visualizar seus orçamentos.
- Visualizar clientes relacionados às suas vendas.
- Visualizar suas vendas.
- Visualizar suas comissões, caso o módulo seja implementado.

Não poderá:

- Visualizar dados financeiros administrativos completos.
- Visualizar leads de outros vendedores.
- Alterar configurações.
- Gerenciar usuários.

---

## 4.3 Desenvolvedor / Ajudante

Usuário responsável pela execução dos projetos.

Pode:

- Visualizar projetos atribuídos.
- Visualizar demandas atribuídas.
- Alterar status das próprias demandas.
- Adicionar comentários.
- Adicionar arquivos.
- Registrar andamento.
- Visualizar prazos.

Não poderá:

- Visualizar financeiro administrativo.
- Gerenciar usuários.
- Gerenciar leads.
- Alterar configurações.

---

# 5. Dashboard

O Dashboard será a página inicial do administrador.

## Indicadores

Exibir:

- Receita do período.
- Despesas do período.
- Lucro.
- Leads.
- Oportunidades.
- Orçamentos enviados.
- Orçamentos aprovados.
- Projetos ativos.
- Demandas abertas.
- Demandas atrasadas.

Exemplo:

```text
┌──────────────────────────────────────────────┐
│ Dashboard                                    │
│ Setembro / 2026                              │
├──────────────────────────────────────────────┤
│                                              │
│ Receita       Despesas       Lucro           │
│ R$ 0,00       R$ 0,00        R$ 0,00         │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ Leads         Orçamentos     Projetos        │
│ 0             0              0               │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ Pipeline                                     │
│                                              │
│ Novo       Contato       Proposta   Fechado  │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ Demandas                                     │
│                                              │
│ Abertas     Em andamento     Atrasadas       │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 6. Módulo Comercial

O módulo comercial será responsável pelo processo de aquisição de clientes.

## 6.1 Leads

Cada lead deverá possuir:

```text
id
nome
empresa
email
telefone
whatsapp
cidade
estado
origem
responsável
status
observações
created_at
updated_at
```

## Status

Sugestão:

```text
NOVO
CONTATO
EM_CONVERSA
QUALIFICADO
PROPOSTA
NEGOCIACAO
GANHO
PERDIDO
```

---

# 7. Distribuição de Leads

O administrador poderá atribuir um lead para um vendedor.

Exemplo:

```text
Lead:
Clínica Exemplo

Responsável:
Vanessa

Status:
Novo
```

O vendedor verá o lead em:

```text
Meus Leads
```

O administrador verá:

```text
Todos os Leads
```

---

# 8. Atividades do Lead

Cada contato deverá gerar uma atividade.

Tipos:

```text
LIGAÇÃO
WHATSAPP
EMAIL
REUNIÃO
OBSERVAÇÃO
```

Exemplo:

```text
02/09/2026
Ligação realizada.

Cliente demonstrou interesse.
Solicitou orçamento.
```

---

# 9. Follow-ups

O vendedor poderá criar um próximo contato.

Exemplo:

```text
Lead:
Clínica X

Próximo contato:
05/09/2026

Horário:
10:00

Observação:
Retornar após cliente conversar com sócio.
```

O sistema deverá destacar follow-ups próximos e atrasados.

---

# 10. Pipeline

O pipeline deverá apresentar as oportunidades em formato Kanban.

```text
NOVOS
  ↓
CONTATO
  ↓
QUALIFICADO
  ↓
PROPOSTA
  ↓
NEGOCIAÇÃO
  ↓
GANHO / PERDIDO
```

Cada oportunidade será representada por um card.

Exemplo:

```text
┌───────────────────────┐
│ Clínica Bella          │
│ Sistema de Agenda      │
│                        │
│ R$ 5.500               │
│ Vanessa                │
│ Follow-up: 05/09       │
└───────────────────────┘
```

---

# 11. Clientes

Quando uma oportunidade for ganha, poderá ser criada uma conta de cliente.

Dados:

```text
id
nome
empresa
documento
email
telefone
whatsapp
endereço
cidade
estado
observações
created_at
updated_at
```

Um cliente poderá possuir vários projetos.

```text
Cliente
 ├── Projeto 1
 ├── Projeto 2
 └── Projeto 3
```

---

# 12. Orçamentos

O sistema deverá permitir criar orçamentos.

## Informações

```text
Número
Cliente
Projeto
Descrição
Validade
Prazo
Valor
Status
Observações
```

## Itens

Cada orçamento poderá possuir vários itens.

Exemplo:

```text
Sistema para Clínica

01 - Cadastro de clientes       R$ 1.000
02 - Agenda                      R$ 2.000
03 - Financeiro                  R$ 2.000
04 - Dashboard                   R$ 1.000

Total                            R$ 6.000
```

---

# 13. Status do Orçamento

```text
RASCUNHO
ENVIADO
VISUALIZADO
NEGOCIACAO
APROVADO
RECUSADO
EXPIRADO
```

Quando um orçamento for aprovado, o sistema poderá criar um projeto.

---

# 14. Projetos

Um projeto representa um trabalho contratado.

Dados:

```text
id
cliente_id
orcamento_id
nome
descrição
valor
data_inicio
data_prevista
data_conclusao
status
responsável
observações
```

## Status

```text
PLANEJAMENTO
EM_ANDAMENTO
PAUSADO
AGUARDANDO_CLIENTE
CONCLUIDO
CANCELADO
```

---

# 15. Equipe do Projeto

Um projeto poderá possuir vários usuários.

```text
Projeto
 ├── Victor
 ├── Desenvolvedor 1
 └── Desenvolvedor 2
```

A tabela de relacionamento deverá permitir controlar quais usuários participam de cada projeto.

---

# 16. Demandas

Demandas representam unidades de trabalho dentro de um projeto.

Exemplo:

```text
Projeto:
Sistema Clínica X

Demandas:

#001 Criar autenticação
#002 Criar cadastro de clientes
#003 Criar agenda
#004 Criar financeiro
#005 Criar dashboard
```

---

# 17. Dados da Demanda

Cada demanda deverá possuir:

```text
id
project_id
title
description
status
priority
assigned_to
created_by
due_date
completed_at
created_at
updated_at
```

---

# 18. Status das Demandas

```text
BACKLOG
TODO
IN_PROGRESS
BLOCKED
REVIEW
DONE
```

---

# 19. Prioridades

```text
BAIXA
NORMAL
ALTA
URGENTE
```

---

# 20. Kanban de Demandas

A tela de demandas poderá utilizar Kanban.

```text
BACKLOG
────────────────
Criar login
Criar cadastro

TODO
────────────────
Criar agenda

EM ANDAMENTO
────────────────
API financeira

REVISÃO
────────────────
Dashboard

CONCLUÍDO
────────────────
Banco de dados
```

O usuário poderá movimentar demandas entre os status conforme suas permissões.

---

# 21. Comentários

Cada demanda poderá possuir comentários.

Exemplo:

```text
Victor:
A API já está pronta.

Dev:
Vou começar a integração amanhã.
```

---

# 22. Arquivos

Demandas e projetos poderão possuir arquivos anexados.

Exemplos:

- Briefing
- Documentação
- Imagens
- PDFs
- Contratos
- Arquivos do cliente

Os arquivos serão armazenados no Supabase Storage.

---

# 23. Financeiro

O módulo financeiro será exclusivamente administrativo.

Terá:

```text
Receitas
Despesas
Categorias
Fluxo de caixa
Indicadores
```

---

# 24. Receitas

Dados:

```text
id
cliente_id
project_id
description
amount
due_date
paid_at
status
category
created_at
```

Status:

```text
PENDENTE
PAGO
ATRASADO
CANCELADO
```

Exemplo:

```text
Cliente X
Projeto Sistema
R$ 5.000
Vencimento: 10/09/2026
Status: Pendente
```

---

# 25. Despesas

Dados:

```text
id
description
category
amount
due_date
paid_at
status
recurring
created_at
```

Categorias:

```text
INFRAESTRUTURA
SOFTWARE
IA
MARKETING
COMISSÃO
EQUIPE
DOMÍNIO
HOSPEDAGEM
OUTROS
```

---

# 26. Fluxo de Caixa

O sistema deverá apresentar:

```text
Saldo inicial
+
Receitas
-
Despesas
=
Saldo final
```

Filtros:

- Hoje
- Semana
- Mês
- Trimestre
- Ano
- Período personalizado

---

# 27. Indicadores Gerenciais

O administrador poderá acompanhar:

## Comercial

- Total de leads
- Leads por vendedor
- Leads por origem
- Conversão
- Oportunidades abertas
- Propostas enviadas
- Propostas aprovadas
- Taxa de conversão

## Projetos

- Projetos ativos
- Projetos concluídos
- Projetos atrasados
- Demandas abertas
- Demandas concluídas
- Demandas atrasadas

## Financeiro

- Receita
- Despesas
- Lucro
- Contas pendentes
- Contas atrasadas
- Receita por cliente
- Receita por projeto

---

# 28. Usuários

Administrador poderá:

- Criar usuário.
- Editar usuário.
- Alterar função.
- Ativar/desativar usuário.
- Redefinir acesso.

Dados:

```text
id
nome
email
role
active
created_at
updated_at
```

A autenticação será feita pelo Supabase Auth.

---

# 29. Segurança

O sistema deverá utilizar:

- Supabase Auth
- Row Level Security (RLS)
- Controle de permissões
- Validação no servidor
- Variáveis de ambiente
- Separação entre operações client-side e server-side

As permissões deverão ser aplicadas no banco de dados e também na aplicação.

Ocultar um botão no frontend não será considerado uma regra de segurança.

---

# 30. Arquitetura

Stack principal:

```text
Frontend:
Next.js
React
TypeScript

UI:
Tailwind CSS
shadcn/ui

Backend:
Next.js Server Actions
Next.js Route Handlers
Node.js runtime

Banco:
Supabase PostgreSQL

Autenticação:
Supabase Auth

Arquivos:
Supabase Storage

Deploy:
Vercel

Versionamento:
GitHub
```

---

# 31. Estrutura inicial do projeto

Sugestão:

```text
codratec-os/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── forgot-password/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── vendedores/
│   │   ├── clientes/
│   │   ├── orcamentos/
│   │   ├── projetos/
│   │   ├── demandas/
│   │   ├── equipe/
│   │   ├── financeiro/
│   │   └── configuracoes/
│   │
│   ├── api/
│   │
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── leads/
│   ├── clientes/
│   ├── orcamentos/
│   ├── projetos/
│   ├── demandas/
│   └── financeiro/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── validations/
│   └── utils/
│
├── actions/
│   ├── leads/
│   ├── clientes/
│   ├── orcamentos/
│   ├── projetos/
│   ├── demandas/
│   └── financeiro/
│
├── types/
│
├── hooks/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
└── public/
```

---

# 32. Banco de Dados

Estrutura inicial sugerida:

```text
profiles
roles

leads
lead_activities
lead_followups

clients
client_contacts

quotes
quote_items

projects
project_members

tasks
task_comments
task_attachments

revenues
expenses
categories
```

---

# 33. Relacionamentos

Conceito:

```text
profiles
   │
   ├──────────── leads
   │
   ├──────────── projects
   │
   └──────────── tasks

leads
   │
   └──────────── clients

clients
   │
   ├──────────── quotes
   │
   ├──────────── projects
   │
   └──────────── revenues

quotes
   │
   └──────────── projects

projects
   │
   ├──────────── tasks
   ├──────────── project_members
   └──────────── revenues
```

---

# 34. Layout da Aplicação

O painel deverá possuir:

```text
┌─────────────────────────────────────────────┐
│ CODRATEC OS                     Victor ▼    │
├───────────────┬─────────────────────────────┤
│               │                             │
│ Dashboard     │                             │
│               │                             │
│ Comercial     │                             │
│  Leads        │       CONTEÚDO              │
│  Pipeline     │                             │
│  Vendedores   │                             │
│               │                             │
│ Clientes      │                             │
│ Orçamentos    │                             │
│ Projetos      │                             │
│ Demandas      │                             │
│               │                             │
│ Financeiro    │                             │
│               │                             │
│ Configurações │                             │
│               │                             │
└───────────────┴─────────────────────────────┘
```

O menu deverá ser responsivo.

No mobile, poderá utilizar navegação inferior ou menu lateral recolhível.

---

# 35. UX/UI

A interface deverá priorizar:

- Simplicidade.
- Rapidez.
- Boa hierarquia visual.
- Poucos cliques.
- Tabelas eficientes.
- Filtros.
- Busca.
- Atalhos para ações frequentes.
- Feedback visual das operações.
- Responsividade.

O sistema não deverá parecer um ERP antigo.

A identidade visual deverá ser moderna, profissional e coerente com a Codratec.

---

# 36. Busca

As principais entidades deverão possuir busca.

Exemplo:

```text
🔎 Buscar leads...
```

Pesquisar por:

- Nome
- Empresa
- Telefone
- Email

O mesmo conceito deverá existir para:

- Clientes
- Projetos
- Demandas
- Orçamentos

---

# 37. Auditoria

O sistema deverá possuir, posteriormente, registro de ações importantes.

Exemplo:

```text
Victor alterou o status da demanda #124
Victor criou orçamento #00023
Vanessa alterou lead Clínica X
Alexandre registrou contato com Cliente Y
```

Tabela futura:

```text
audit_logs
```

---

# 38. Notificações

Inicialmente poderão ser notificações internas.

Exemplos:

```text
🔔 Você recebeu uma nova demanda.

🔔 A demanda #123 está atrasada.

🔔 O follow-up da Clínica X vence hoje.

🔔 O orçamento #0021 foi aprovado.
```

Notificações por email/WhatsApp poderão ser adicionadas posteriormente.

---

# 39. Integrações Futuras

Não fazem parte do MVP, mas a arquitetura deverá permitir integração futura com:

```text
Google Calendar
WhatsApp
Email
GitHub
Google Drive
Gemini
OpenAI
Stripe
Mercado Pago
Asaas
```

A implementação dessas integrações será feita somente quando houver necessidade real.

---

# 40. IA — Fase futura

A IA não fará parte da primeira versão.

Posteriormente poderá existir uma camada de IA para:

### Comercial

- Análise de leads.
- Sugestão de abordagem.
- Resumo de conversas.
- Follow-up automático.

### Orçamentos

- Gerar descrição de projeto.
- Sugerir módulos.
- Sugerir estimativa.
- Gerar proposta.

### Desenvolvimento

- Transformar requisitos em demandas.
- Criar checklists.
- Resumir projetos.
- Analisar documentação.

### Gestão

Permitir perguntas como:

```text
Quanto faturamos este mês?

Qual vendedor converte mais?

Quais projetos estão atrasados?

Quanto gastamos com infraestrutura?

Qual foi nosso lucro no mês?

Quais clientes geraram mais receita?
```

A IA deverá consultar dados autorizados do sistema e respeitar as permissões do usuário.

---

# 41. Roadmap

## Fase 1 — Fundação

- Criar projeto Next.js.
- Configurar TypeScript.
- Configurar Tailwind.
- Configurar shadcn/ui.
- Configurar Supabase.
- Configurar autenticação.
- Criar layout.
- Criar sistema de permissões.
- Criar banco inicial.

---

## Fase 2 — Comercial

- Leads.
- Vendedores.
- Distribuição de leads.
- Atividades.
- Follow-ups.
- Pipeline.

---

## Fase 3 — Clientes e Orçamentos

- Clientes.
- Contatos.
- Orçamentos.
- Itens de orçamento.
- Status.
- Aprovação.
- Conversão em projeto.

---

## Fase 4 — Projetos

- Projetos.
- Equipe.
- Demandas.
- Kanban.
- Comentários.
- Arquivos.
- Prazos.

---

## Fase 5 — Financeiro

- Receitas.
- Despesas.
- Categorias.
- Contas pendentes.
- Fluxo de caixa.
- Indicadores.

---

## Fase 6 — Dashboard

Consolidar:

```text
Comercial
Projetos
Demandas
Financeiro
```

em indicadores gerenciais.

---

## Fase 7 — Automação

Adicionar automações depois que o fluxo manual estiver funcionando.

---

## Fase 8 — IA

Adicionar agentes e recursos de IA conforme necessidades identificadas durante o uso real.

---

# 42. Princípios do Projeto

## 1. O sistema deve resolver problemas reais da Codratec

Não criar funcionalidades apenas porque são comuns em CRMs.

## 2. Primeiro operação, depois automação

O processo manual deverá estar bem definido antes de ser automatizado.

## 3. Segurança desde o início

Autenticação e autorização devem fazer parte da arquitetura inicial.

## 4. Dados centralizados

Informações comerciais, projetos e financeiro deverão estar relacionados.

## 5. Evolução incremental

O sistema será desenvolvido por módulos.

## 6. Preparado para crescimento

A arquitetura deverá permitir posteriormente:

- mais usuários;
- mais vendedores;
- mais projetos;
- mais clientes;
- integrações;
- automações;
- IA.

---

# 43. Fluxo Completo

O fluxo ideal do sistema será:

```text
                    LEAD
                      │
                      ▼
                 DISTRIBUIÇÃO
                      │
                      ▼
                  VENDEDOR
                      │
                      ▼
                  CONTATO
                      │
                      ▼
                OPORTUNIDADE
                      │
                      ▼
                  ORÇAMENTO
                      │
             ┌────────┴────────┐
             │                 │
          RECUSADO           APROVADO
                               │
                               ▼
                            CLIENTE
                               │
                               ▼
                            PROJETO
                               │
                               ▼
                           DEMANDAS
                               │
                               ▼
                            EQUIPE
                               │
                               ▼
                            ENTREGA
                               │
                               ▼
                            RECEITA
                               │
                               ▼
                          DASHBOARD
```

---

# 44. Resultado esperado

Ao final do MVP, a Codratec deverá conseguir executar dentro do próprio sistema:

```text
1. Cadastrar/importar lead
2. Atribuir lead ao vendedor
3. Vendedor entrar no sistema
4. Vendedor realizar contato
5. Registrar atividade
6. Criar follow-up
7. Converter lead em oportunidade
8. Criar orçamento
9. Aprovar orçamento
10. Criar cliente
11. Criar projeto
12. Criar demandas
13. Distribuir demandas
14. Acompanhar execução
15. Concluir projeto
16. Registrar receita
17. Registrar despesas
18. Visualizar resultado no Dashboard
```

Esse fluxo será o **núcleo do Codratec OS**.

---

# 45. Fora do MVP

Os seguintes recursos ficam explicitamente fora da primeira versão:

- IA.
- WhatsApp API.
- Integração com bancos.
- Emissão fiscal.
- Contabilidade.
- Gateway de pagamento.
- Aplicativo mobile nativo.
- Automação avançada.
- Integração com GitHub.
- CRM externo.
- Multiempresa público.

Esses recursos poderão ser adicionados posteriormente conforme a operação exigir.

---

# 46. Definição do MVP

O MVP estará funcional quando um administrador conseguir administrar:

**Leads → Vendedores → Clientes → Orçamentos → Projetos → Demandas → Financeiro**

dentro de uma única aplicação web, com autenticação e permissões adequadas.

O sistema deverá ser utilizado pela própria Codratec antes de receber funcionalidades avançadas.

---

---

# 47. Nome do Projeto

**Codratec OS**

### Subtítulo

**Painel Operacional da Codratec**

### Conceito

> O sistema interno que organiza, acompanha e gerencia toda a operação da Codratec.

---

# 48. Arquitetura Implementada & Guia da Versão 1.1

## 48.1. Migrações de Banco de Dados (Supabase PostgreSQL)
1. **`01_initial_schema.sql`:** Tabela `profiles`, enum `user_role` (`admin`, `vendedor`, `dev`), trigger de novo usuário e RLS inicial.
2. **`02_codratec_os_full_schema.sql`:** Tabelas `leads`, `lead_activities`, `lead_followups`, `clients`, `quotes`, `quote_items`, `projects`, `project_members`, `tasks`, `task_comments`, `task_attachments`, `revenues`, `expenses` e RLS completo.
3. **`03_lead_import_and_rbac.sql`:** Campos enriquecidos de prospecção PJ (CNPJ/Documento, Razão Social, Nome Fantasia, CNAE, Categoria, Nicho) e RLS de isolamento por vendedor (`assigned_to = auth.uid()` ou fila pública).
4. **`04_expanded_leads_pipeline.sql`:** Suporte a agendamento de calls (`scheduled_call_at`), descarte por motivo (`uninterest_reason`) e status expandidos (`CALL_AGENDADA`, `NAO_INTERESSADO`, `SEM_RESPOSTA`, `FUTURO`).

## 48.2. Pipeline de Vendas, Visão Tabela Densa & Gestão de Descarte
- **Alternância de Visão (`Tabela` vs `Kanban`):** Seletor de visualização na barra superior da página `/leads` permitindo alternar instantaneamente entre Tabela Compacta (para ver a operação como um todo) e o Quadro Kanban.
- **Funil Principal:** `NOVO` → `CONTATO` → `QUALIFICADO` → `CALL_AGENDADA` 📅 → `PROPOSTA` → `GANHO` 🏆
- **Funil Secundário (Descarte & Nutrição):**
  - `NAO_INTERESSADO` 🚫 (Com registro de motivo do descarte).
  - `SEM_RESPOSTA` (Follow-up esgotado).
  - `FUTURO` ⏳ (Nutrição comercial).

## 48.3. Importação de Leads (JSON / API)
- **Interface UI (`/leads`):** Modal de upload de arquivos `.json` ou inclusão direta de texto JSON com atribuição automática a vendedores.
- **Endpoint API (`POST /api/leads/import`):** Aceita payloads de importação direta para automações e webhooks.

## 48.4. Automação de Negócio & Conversão Automática
- **Lead Ganho → Cliente:** Quando o status de um lead é alterado para `GANHO` (Venda Concluída), o sistema cria **automaticamente** a conta do cliente na tabela `clients` com todos os dados de CNPJ, contato, e-mail, telefone e cidade, evitando duplicidades.
- **Orçamento Aprovado → Projeto + Receita:** Quando um orçamento é alterado para `APROVADO`, o sistema cria automaticamente:
  1. O **Projeto contratado** na tabela `projects`.
  2. O lançamento de **Receita pendente** na tabela `revenues` para o controle financeiro.

## 48.5. Sistema de Metas Mensais, Comissões & Ranking de Consultores
- **Cargo Oficial:** Consultor Comercial Codratec.
- **Estrutura por Meta Mensal:** Meta de vendas configurável por vendedor e por mês/ano (Padrão: 8 vendas/mês).
- **Indicadores em Tempo Real:** Exibe `Vendas Realizadas` x `Meta Mensal`, com barra de progresso % (ex: Vanessa: 5/8 = 62.5%, Alexandre: 7/8 = 87.5%).
- **Cálculo Automático de Comissão:** `(Faturamento Gerado no Mês * % Comissão) / 100`.
- **Ranking Mensal & Histórico:** Classificação automática por medalhas (1º, 2º lugar) e histórico pesquisável por mês e ano.

## 48.6. Contato Clicável Direct Dial (`tel:`) & WhatsApp (`wa.me`)
- **Ligação Direta (`tel:`):** Todos os números de telefone em `/leads` (Tabela e Kanban) e `/clientes` são renderizados como `<a href="tel:...">`, permitindo realizar chamadas via softphone, Skype, celular ou discador padrão do SO com 1 clique.
- **Integração WhatsApp Web (`wa.me`):** Botão `WA` ao lado do telefone que abre diretamente a conversa no WhatsApp Web preenchendo o número formatado (`https://wa.me/55...`).

## 48.7. Proposta Comercial Detalhada & Gerador de PDF (`/orcamentos`)
- **Documento Comercial B2B:** Componente `ProposalPrintModal` que gera o documento formal de Proposta Comercial em layout profissional para a Codratec.
- **Estrutura da Proposta:** Cabeçalho, contratante, objeto do projeto, investimento, condições de pagamento e aceite.

## 48.8. Contrato Jurídico de Prestação de Serviços em PDF (`ContractPrintModal`)
- **Documento Jurídico Formal:** Componente `ContractPrintModal` que gera o Contrato de Prestação de Serviços de Desenvolvimento de Software com validade jurídica e formatação para impressão/exportação em PDF pelo navegador (`window.print()`).
- **Cláusulas Jurídicas Incluídas:** Objeto, obrigações, pagamentos, propriedade intelectual, confidencialidade & LGPD, garantia de 90 dias e foro.

## 48.9. Controle Rígido de Acessos & Privilégios Limitados do Vendedor (RBAC)
- **Vendedor / Consultor Comercial (`role = 'vendedor'`):**
  - **Módulos Permitidos:** `/leads` (Apenas sua carteira e fila pública), `/clientes` (Apenas seus clientes), `/orcamentos` (Visualização), `/vendedores` (Seu desempenho, meta e ranking) e `/dashboard`.
  - **Módulos BLOQUEADOS & OCULTOS (Servidor + Menu):** `/financeiro`, `/equipe`, `/configuracoes`.

## 48.10. Emissão de Orçamentos & Contratos (Admin & Gerente Comercial)
- **Cargos Autorizados (`canCreateQuote`):** Apenas o **Administrador (Dono)** e colaboradores com o papel de **Gerente Comercial** (`role = 'gerente'`) possuem permissão para emitir e salvar orçamentos e contratos oficiais no sistema.
- **Fluxo do Vendedor:** O vendedor realiza o atendimento, prospecção, qualificação e agendamento da call. Quando a proposta formal precisa ser gerada, ela é emitida e chancelada pelo **Admin** ou pelo **Gerente Comercial**.

## 48.11. Identidade Visual & Ícone Oficial (`/codratec-logo.png`)
- **Novo Logo em PNG:** Substituído o ícone genérico de escudo pelo **logo oficial da Codratec** em formato PNG (`/codratec-logo.png`), apresentando o **"C" estilizado** em estética neon cyan/blue sobre fundo escuro slate.
- **Locais de Aplicação:** Tela de Login, Sidebar, Proposta Comercial e Contrato Jurídico em PDF.

## 48.12. Identificação Real do Usuário no Cabeçalho Superior (`Header.tsx`)
- **Nome Real e Iniciais:** Exibe dados reais (**Victor Pereira** / selo **VP**) no topo do sistema.

## 48.13. Menu Lateral Recolhível & Responsividade Mobile Total (320px+)
- **Menu Lateral Recolhível (Desktop):** Alterna entre estado Expandido (`w-64`) e Recolhido (`w-20`) via `<ChevronLeft />` / `<ChevronRight />`.
- **Responsividade 100% Mobile:** Gaveta off-canvas deslizante com overlay e layouts em coluna única.

## 48.14. Correção de Erros de Log (PostCSS CSS & Ambuidade PostgREST PGRST201)
- **Erro CSS Tailwind (`globals.css`):** Removida a classe customizada `custom-scrollbar` de dentro do `@apply` na classe `.cnpja-table-container` em `app/globals.css`, eliminando o erro de compilação do PostCSS.
- **Erro de Ambiguidade de Relacionamento no Supabase (`PGRST201`):** Especificada explicitamente a chave estrangeira `assigned:profiles!tasks_assigned_to_fkey(full_name, email)` na busca da função `getTasks()` em `actions/os.ts`, resolvendo o conflito entre as colunas `assigned_to` e `created_by`.

## 48.15. Central de Notificações Operacionais em Tempo Real (`NotificationPopover`)
- **Central de Notificações:** Alertas em tempo real de reuniões agendadas, orçamentos enviados e novos leads.

## 48.16. Suporte Completo ao Modo Claro (Light Mode) de Altíssimo Contraste
- **Refinamento de Legibilidade (Light Mode):**
  - **Menu Lateral (`Sidebar`):** Links não selecionados em tom escuro de alto contraste `#334155` com ícones em `#475569`, acabando com o texto apagado.
  - **Cabeçalhos de Tabela (`th`):** Texto em negrito escuro `#334155` sobre fundo cinza suave `#f1f5f9`.
  - **Botões Secundários ("Importar JSON"):** Fundo cinza suave `#f1f5f9` com texto escuro `#1e293b` e borda `#cbd5e1`.
  - **Subtítulo de Cargo no Header:** Alterado de azul claro apagado para azul royal escuro `#1d4ed8`.
  - **Campos de Busca & Inputs:** Fundo branco puro `#ffffff` com placeholder `#64748b` e bordas `#cbd5e1`.

---

# 49. Modelo Comercial & Estratégia de Precificação da Codratec (SaaS Híbrido B2B)

## 49.1. Estrutura Financeira do Modelo Comercial
A Codratec opera sob o modelo de **Desenvolvimento Personalizado com Suporte e Hospedagem Recorrente (Software House Híbrida)**, garantindo caixa imediato no fechamento e previsibilidade de receita recorrente (MRR):

* **Implantação Inicial (Setup):** A partir de **R$ 2.500,00** (valor único de entrada).
* **Mensalidade de Manutenção & Suporte:** **R$ 600,00 / mês**.
* **Contrato Mínimo de Fidelidade:** **12 meses**.
* **LTV Mínimo por Cliente (Ano 1):** **R$ 9.700,00**.
* **Prazo de Entrega:** Definido de acordo com o escopo do projeto.
* **Hospedagem & Manutenção Preventiva:** Incluídas na mensalidade.
* **Correções de Bugs / Erros:** Incluídas na mensalidade.
* **Novas Funcionalidades / Alterações de Escopo:** Cobradas à parte mediante Aditivo Contratual.

---

## 49.2. Matriz de Escopo Incluído vs. Não Incluído no Setup de R$ 2.500,00

### 📦 O que o Setup Base de R$ 2.500,00 Cobre (MVP B2B Funcional):
1. **Autenticação & Controle de Usuários:** Login seguro, recuperação e perfis de acesso.
2. **Cadastro de Clientes (CRM Base):** Registro e gestão da carteira de clientes.
3. **Cadastro de Produtos / Serviços:** Gestão do catálogo operacional do negócio.
4. **Operação Principal (Core Business):** Fluxo central da operação específica do cliente.
5. **Dashboard Operacional Básico:** Indicadores essenciais, cartões de resumo e tabelas.
6. **Banco de Dados Relacional:** Estrutura em PostgreSQL / Supabase com backup automático.
7. **Interface Responsiva Web & Mobile:** Adaptação total para computadores, tablets e celulares.
8. **Deploy & Publicação Oficial:** Configuração de domínio próprio, SSL e servidores de produção.

### ⛔ O que NÃO entra no Setup Base (Vendidos como Upgrades / Aditivos):
- 📲 Aplicativo Nativo Mobile (iOS e Android).
- 🔗 Integrações complexas com APIs de terceiros (ERP, CRM legado).
- 💬 Automação via WhatsApp Web / WhatsApp Business API.
- 📜 Emissão de Nota Fiscal Eletrônica (NFe / NFS-e).
- 🤖 Recursos de Inteligência Artificial Generativa.
- 🔄 ERP Financeiro completo ilimitado.
- ♾️ Alterações ilimitadas de escopo pós-aprovado.

---

## 49.3. Tiers de Precificação & Evolução de Ticket Médio

| Plano Comercial | Implantação (Setup) | Mensalidade Recorrente | Perfil de Cliente Alvo | LTV Consolidado (Ano 1) |
| :--- | :---: | :---: | :--- | :---: |
| 🚀 **Plano Inicial** | **R$ 2.500** | **R$ 600 / mês** | PMEs e profissionais liberais buscando digitalização do core business. | **R$ 9.700** |
| 💼 **Plano Profissional** | **R$ 5.000** | **R$ 800 / mês** | Empresas em expansão exigindo automações WhatsApp, relatórios avançados e RLS. | **R$ 14.600** |
| 🏆 **Plano Completo / Enterprise** | **R$ 10.000+** | **R$ 1.000 a R$ 2.000 / mês** | Operações maduras com integrações ERP, IA, NFe, PWA/App e SLA prioritário. | **R$ 22.000 a R$ 34.000+** |

---

## 49.4. Discurso de Vendas (Pitch Comercial Oficial Codratec)
> *"A Codratec desenvolve sistemas personalizados para pequenas e médias empresas, com implantação a partir de R$ 2.500,00 e acompanhamento contínuo de suporte, segurança e hospedagem."*

---

## 49.5. Cláusulas de Proteção Financeira e Jurídica
1. **Multa de Rescisão Antecipada:** Rescisão do contrato antes de 12 meses incide multa contratual de 30% a 50% das parcelas restantes.
2. **Propriedade Intelectual & Buyout:** A mensalidade concede licença de uso do software mantido pela Codratec. A compra do código-fonte para migração externa sem a mensalidade requer taxa de buyout negociada à parte.
3. **Faturamento de Escopo Adicional:** Qualquer solicitação fora da matriz de escopo base é cotada e aprovada via Aditivo ao Orçamento Comercial.

---

# 50. Implementação do Plano de Continuidade Codratec no Sistema (`Codratec OS v1.1`)

## 50.1. Posicionamento Comercial Atualizado
- **Nomenclatura Oficial:** **Sistema Personalizado + Plano de Continuidade Codratec**.
- **Estrutura Padrão:**
  1. **Setup / Implantação:** A partir de **R$ 2.500,00**.
  2. **Plano Mensal (Continuidade):** **R$ 600,00 / mês**.
  3. **Fidelidade Mínima:** **12 meses**.
  4. **Evoluções:** Funcionalidades fora do escopo faturadas via novo orçamento.

---

## 50.2. Estrutura de Projetos ([/projetos](file:///c:/Users/User/Documents/GitHub/codratec/app/%28dashboard%29/projetos/page.tsx))
Cada projeto agora rastreia e exibe a discriminação financeira completa:
- `setup_amount`: Valor do Setup (R$ 2.500).
- `monthly_amount`: Plano Mensal de Continuidade (R$ 600 / mês).
- `contract_duration_months`: Fidelidade (12 meses).
- `next_billing_date`: Data do próximo vencimento da mensalidade.
- `year_one_total_value`: Valor total contratado no primeiro ano (**R$ 9.700,00**).

---

## 50.3. Categorias Estruturadas no Financeiro ([/financeiro](file:///c:/Users/User/Documents/GitHub/codratec/app/%28dashboard%29/financeiro/page.tsx))

### RECEITAS:
* `SETUP`: Implantações e setups iniciais cobrados de novos clientes.
* `MENSALIDADE`: Recorrências mensais dos Planos de Continuidade ativas.
* `PROJETO_ADICIONAL`: Aditivos de escopo, novas telas ou evoluções contratadas.
* `OUTROS`: Demais recebimentos.

### DESPESAS:
* `HOSPEDAGEM`: Servidores em nuvem, Vercel, VPS e Supabase Cloud.
* `IA_API`: Consumo de APIs e serviços de Inteligência Artificial.
* `DOMINIO`: Renovação de domínios e certificados SSL.
* `SERVICOS`: Licenciamento de softwares e ferramentas de terceiros.
* `COMISSAO`: Comissões pagas aos consultores comerciais por cliente fechado.
* `OUTROS`: Custos operacionais gerais.

---

## 50.4. Conversão Automática & Fluxo do Vendedor
Quando um orçamento é aprovado (`status = 'APROVADO'`), o sistema gera automaticamente:
1. O registro do **Projeto** com os valores de Setup (R$ 2.500), Mensalidade (R$ 600) e Fidelidade (12m).
2. A receita de **SETUP** (`due_date` para o dia da assinatura).
3. A receita de **MENSALIDADE (1/12)** (`due_date` para 30 dias).
4. O ciclo comercial completo: `Cliente Fechado → Setup Recebido → Mensalidade Ativa → Comissão do Vendedor → Renovação`.