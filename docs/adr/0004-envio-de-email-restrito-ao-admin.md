# 0004. Envio de e-mail pela Brevo restrito a um admin

**Status:** aceita

## Contexto

A conta Brevo tem cota de 300 e-mails por dia e o remetente é o domínio da Codratec. E-mail frio mal usado queima a reputação do domínio.

## Decisão

Só um admin cujo e-mail está em `BREVO_ALLOWED_USER_EMAIL` vê o botão e pode chamar `sendLeadEmail`/`sendLeadsBulkEmail`. Consultores usam WhatsApp e ligação. Cada envio grava `lead_emails` e uma atividade no lead.

## Consequências

- O status de entrega e leitura depende de sincronizar os eventos da Brevo (botão na tela e cron diário, ver `docs/operacao.md`).
- O envio em lote é sequencial dentro de uma server action. Lotes de centenas podem estourar o tempo da função; mover para uma fila ou para o envio em lote da própria Brevo resolveria.
