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
| `CRON_SECRET` | protege `/api/cron/brevo-events` (a Vercel manda sozinha) | para o cron |

## Deploy

- Vercel faz deploy da `main` a cada push (`vercel.json`, região `gru1`). Merge na `main` = produção.
- Branches de PR ganham preview da Vercel.

## Migrations

1. Crie `supabase/migrations/NN_descricao.sql` com o próximo número.
2. Escreva SQL idempotente (`IF NOT EXISTS`, `DROP POLICY IF EXISTS` antes de `CREATE POLICY`).
3. Rode no **SQL Editor** do Supabase (projeto `codratec_01`). Não há `supabase db push` no fluxo.
4. Lembre que o projeto é compartilhado com o CRM FIDC: toda policy nova precisa de `tem_acesso_codratec()`.

A última aplicada é a `24_endurece_rls_perfis_e_leads.sql` (rodada em 21/10/2026). A `25_acesso_por_papel_e_data_da_venda.sql` deve ser rodada junto com o merge do PR #5 (o código funciona antes dela, mas a meta só usa `won_at` depois).

## Cron de e-mails

`/api/cron/brevo-events` roda uma vez por dia às 11:00 UTC (08:00 em Brasília), configurado em `vercel.json`. Usa o cliente service role, porque o cron não tem sessão. Precisa de `CRON_SECRET` e `SUPABASE_SERVICE_ROLE_KEY` nas variáveis da Vercel. O plano Hobby só permite cron diário; no Pro dá para mudar para de hora em hora (`0 * * * *`).

## Scripts

| Script | Para que serve |
| --- | --- |
| `scripts/list-portfolio-images.js` | Gera `lib/portfolio-images.json` (roda no `dev` e no `build`) |
| `scripts/generate-pwa-icons.mjs` | `npm run icons:pwa`, gera ícones do PWA com `sharp` |
| `scripts/setup-admin-user.js`, `test-create-user.js`, `inspect-db.js` | Utilitários antigos de setup; precisam da service role |
