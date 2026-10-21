# Operação

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencher as chaves
npm run dev                  # http://localhost:3000
npx tsc --noEmit             # checagem de tipos
npm run build                # build de produção
```

Sem `.env.local`, `lib/supabase/client.ts` e `server.ts` caem no projeto de **produção** (URL e anon key escritas no código). Cuidado ao testar gravações localmente.

## Variáveis de ambiente

| Variável | Onde é usada | Obrigatória |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | todos os clientes Supabase | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clientes server e navegador | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | convidar e excluir colaborador (`actions/team.ts`) | para gestão de equipe |
| `BREVO_API_KEY` | envio, cota e eventos (`lib/brevo.ts`) | para e-mail |
| `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | remetente (precisa estar verificado na Brevo) | para e-mail |
| `BREVO_ALLOWED_USER_EMAIL` | quem pode enviar (lista separada por vírgula) | para e-mail |
| `CRON_SECRET` | protege `/api/cron/brevo-events` | se o cron for ligado |

## Deploy

- Vercel faz deploy da `main` a cada push (`vercel.json`, região `gru1`). Merge na `main` = produção.
- Branches de PR ganham preview da Vercel.

## Migrations

1. Crie `supabase/migrations/NN_descricao.sql` com o próximo número.
2. Escreva SQL idempotente (`IF NOT EXISTS`, `DROP POLICY IF EXISTS` antes de `CREATE POLICY`).
3. Rode no **SQL Editor** do Supabase (projeto `codratec_01`). Não há `supabase db push` no fluxo.
4. Lembre que o projeto é compartilhado com o CRM FIDC: toda policy nova precisa de `tem_acesso_codratec()`.

Pendente: `24_endurece_rls_perfis_e_leads.sql` (trigger que protege `role`/`active` e remoção das policies antigas de leads).

## Cron de e-mails

`/api/cron/brevo-events` existe, mas **não está agendado** (`vercel.json` não tem `crons`) e, mesmo se estivesse, não atualizaria nada: a rota usa o cliente com cookie e o cron não tem sessão, então a RLS bloqueia. Hoje a sincronização só acontece pelo botão na tela de leads ou na ficha. Para ligar de verdade, a rota precisa de um cliente service role e de `crons` no `vercel.json`.

## Scripts

| Script | Para que serve |
| --- | --- |
| `scripts/list-portfolio-images.js` | Gera `lib/portfolio-images.json` (roda no `dev` e no `build`) |
| `scripts/generate-pwa-icons.mjs` | `npm run icons:pwa`, gera ícones do PWA com `sharp` |
| `scripts/setup-admin-user.js`, `test-create-user.js`, `inspect-db.js` | Utilitários antigos de setup; precisam da service role |
