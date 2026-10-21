# Fluxos principais

## 1. Lead entra no sistema

| Origem | Caminho | Observações |
| --- | --- | --- |
| Cadastro manual | `NewLeadModal` → `createLead` | Status padrão NOVO, origem "Site". |
| Importação na tela | `ImportLeadsModal` → `importLeadsBatch` | Aceita JSON com nomes em português ou inglês (`razao_social`/`company`, `cnpj`/`document`...). |
| API | `POST /api/leads/import` → `importLeadsBatch` | Usa a sessão do cookie; sem login a RLS recusa o insert. |

Na importação, o **documento** (só dígitos) identifica o lead. Se já existe, os dados cadastrais são atualizados, mas **status e consultor não mudam** (o consultor só é preenchido se o lead estava na fila pública). Leads novos são inseridos de uma vez; os existentes são atualizados um a um.

## 2. Trabalho do consultor (ficha do lead)

`LeadsView` (lista, kanban ou dash) → clique abre `LeadDrawer`.

- **Funil no topo**: mudar a etapa chama `updateLeadStatus`.
- **Registrar atividade em um clique** (`createLeadActivity`): ligação, WhatsApp, e-mail, reunião, observação.
- **WhatsApp**: abre `wa.me` (celular) ou WhatsApp Web (desktop) com a mensagem de abordagem (`lib/whatsapp.ts`). "Número inválido" grava `whatsapp_invalid` e uma atividade.
- **Agendar call** (`ScheduleCallModal` → `scheduleLeadCall`): grava data e notas e muda o status para CALL_AGENDADA.
- **Não interessado** (`markLeadUninterested`): status NAO_INTERESSADO com motivo.
- **Follow-ups**: lembretes com data por lead.
- **Ações em lote** na lista: atribuir, devolver à fila, mudar status, excluir, enviar e-mail.

## 3. Lead ganho vira cliente

`updateLeadStatus(leadId, 'GANHO')`:

1. Muda o status.
2. Procura cliente com o mesmo `lead_id` ou o mesmo `document`.
3. Se não acha, cria o cliente copiando nome, empresa, documento, contatos e cidade.

Mudar em lote para GANHO (`updateLeadsStatusBulk`) **não** cria cliente.

## 4. Briefing para proposta

```
Consultor (ficha do lead)                 Admin/gerente (/orcamentos?aba=propostas)
  "Enviar para proposta"                    HandoffQueue
  SendToProposalModal ─ createLeadHandoff ─> ENVIADO ─> EM_ANALISE ─> ORCAMENTO_CRIADO
        │ rascunho no localStorage                    └> PRECISA_INFO     └> CANCELADO
        ├ lead vai para PROPOSTA (se ainda não passou)
        └ atividade BRIEFING no histórico
```

- Só um briefing aberto por lead (índice único no banco; o app mostra a mensagem do erro 23505).
- Notificação: o sino do admin/gerente lista os briefings ENVIADO (quentes com 🔥). Não há e-mail.
- O autor pode cancelar o próprio briefing; os demais status são de admin/gerente.
- Criar o orçamento é um passo manual em "Novo orçamento"; o app ainda não liga o orçamento ao briefing (`quote_id` fica vazio).

## 5. Orçamento aprovado vira projeto

`createQuote` / `updateQuote` / `updateQuoteStatus` com status APROVADO chamam `autoConvertQuoteToProjectAndRevenue`:

1. Se já existe projeto para o orçamento, não faz nada (`projects.quote_id` é único).
2. Cria o **projeto** em PLANEJAMENTO, com início hoje e previsão = hoje + prazo de entrega.
3. Lança **receitas**: com mensalidade, o setup (se houver) vence hoje e a 1ª mensalidade em 30 dias; sem mensalidade, o total vence hoje.
4. Cria **demandas**: uma por linha do escopo geral (até 20), ou uma demanda "Kickoff e detalhamento (SOW)".

Falhas nas receitas ou demandas só vão para o log; o projeto fica criado. Só a primeira mensalidade é lançada.

## 6. E-mail pela Brevo

- **Quem**: só admin cujo e-mail está em `BREVO_ALLOWED_USER_EMAIL`.
- **Envio** (`sendLeadEmail`, `sendLeadsBulkEmail`): aplica o modelo com as tags do lead, escapa o texto para HTML, envia pela API da Brevo, grava `lead_emails`, atualiza o resumo `last_email_*` do lead e registra atividade EMAIL.
- **Cota**: 300/dia. A tela pergunta se quer mandar o excedente para a fila da Brevo do dia seguinte (até 1.000).
- **Status**: "Sincronizar" (`syncBrevoEmailEvents`) busca os eventos dos últimos 7 dias e atualiza Entregue/Lido/Rejeitado por `message_id`, ou pelo e-mail do lead quando não acha o id.
- O envio em lote roda em sequência dentro de uma única server action; lotes grandes podem estourar o tempo máximo da função na Vercel.

## 7. Metas e comissões (`/vendedores`)

`getMonthlySalesPerformance(ano, mês)` lista admins e vendedores, conta os leads GANHO de cada um cujo `updated_at` cai no mês, soma o `total_amount` dos orçamentos APROVADO dos clientes desses leads e aplica a taxa de comissão da meta (padrão 8 vendas e 10%).
