# Arquitetura

## Stack

- **Next.js 14 (App Router)**, React 18, TypeScript, Tailwind 3. Ícones `lucide-react`.
- **Supabase**: Postgres, Auth e RLS. Cliente via `@supabase/ssr` com a sessão em cookie.
- **Brevo**: envio de e-mail transacional para leads (`lib/brevo.ts`).
- **Vercel**: deploy automático a partir da `main`, região `gru1` (São Paulo).
- PWA simples (`public/sw.js`, `public/site.webmanifest`, `components/PwaRegister.tsx`).

Não há testes automatizados nem ESLint configurado. A checagem disponível é `npx tsc --noEmit` e `npm run build`.

## Pastas

```
app/
  page.tsx, privacy/          site institucional
  (auth)/login/               tela de login
  (dashboard)/                Codratec OS (layout com sidebar, header, notificações)
    dashboard/ leads/ vendedores/ clientes/ orcamentos/ projetos/
    demandas/ equipe/ financeiro/ configuracoes/
  (print)/orcamentos/[id]/    proposta e contrato para imprimir (sem sidebar)
  api/leads/import/           POST de leads em JSON
  api/cron/brevo-events/      sincroniza status dos e-mails (ver operacao.md)
actions/<assunto>.ts          server actions ('use server'), uma por assunto
lib/server/actions-helpers.ts funções internas das actions (sem 'use server')
lib/supabase/                 clientes: server (cookie), client (navegador), admin (service role), middleware
lib/permissions/              papéis e módulos visíveis no menu
components/os/                telas e modais do painel
components/os/leads/          partes da tela de leads (filtros, tabela, kanban, dash)
components/ui/                Modal, FormError, useConfirm, useToast
components/*.tsx              seções do site institucional
supabase/migrations/          SQL numerado; rodado à mão no SQL Editor
types/database.ts, rows.ts    tipos das linhas (parciais; ver "Tipos" abaixo)
```

## Como uma tela funciona

1. A `page.tsx` em `app/(dashboard)` é um Server Component. Ela chama as funções `get*` das actions (ex.: `getLeads()`), que rodam no servidor.
2. As actions usam `getDbClient()`, que é o cliente Supabase **com a sessão do usuário** (cookie). Toda consulta passa pela RLS do Postgres com o papel `authenticated`.
3. A página entrega os dados a um componente cliente (`components/os/*View.tsx`), que guarda estado local, filtra e ordena no navegador.
4. Para gravar, o componente chama uma server action (`updateLeadStatus`, `createQuote`...). A action valida, grava, chama `revalidatePath` e devolve `{ success }` ou `{ error }`.
5. O componente aplica a mudança na tela na hora (atualização otimista) e chama `router.refresh()` para buscar o estado real.

Consequências que valem saber:

- **A tela de leads carrega todos os leads** (`fetchAllRows`, em lotes de 1.000) e filtra no cliente. Com ~730 leads isso é ~415 kB de dados. Cada `router.refresh()` repete a busca inteira, mais membros, modelos e a cota da Brevo (chamada externa).
- **As server actions são endpoints públicos** (POST com o id da action). Quem tem sessão pode chamá-las com qualquer argumento. A proteção de verdade é a RLS; as checagens de papel nas actions são uma segunda camada e não existem em todas (ver [permissoes.md](permissoes.md)).
- Ações em lote quebram listas de ids em lotes de 150 (`chunkIds`) porque o filtro `.in()` vai na URL.

## Autenticação

- `middleware.ts` → `lib/supabase/middleware.ts` renova a sessão em toda rota. Nas rotas do painel, sem usuário redireciona para `/login?redirectTo=...`; com usuário sem perfil ativo em `profiles`, desloga e manda para `/login?erro=sem-acesso`.
- `actions/auth.ts#login` usa e-mail e senha (`signInWithPassword`) e só aceita `redirectTo` relativo.
- Não há cadastro aberto: colaboradores entram por convite (`inviteTeamMember`, precisa de `SUPABASE_SERVICE_ROLE_KEY`). O trigger que criava perfil para todo usuário novo foi removido na migração 22, porque o projeto Supabase é compartilhado com o CRM FIDC.
- Páginas de admin (`/equipe`, `/financeiro`, `/configuracoes`) checam o papel no servidor e redirecionam. As demais confiam no menu e na RLS.

## Tipos

`types/database.ts` não cobre todas as tabelas (faltam `lead_handoffs`, `lead_emails`, `email_templates`...). Por isso `getDbClient()` devolve o cliente sem tipo (`as any`) e as leituras principais fazem cast para os tipos de `types/rows.ts`. Para tipar tudo: `supabase gen types typescript --project-id pgxhuoaclkeegzkhfnun > types/database.ts` e tirar o cast.

## Estilo e layout

- CSS global grande em `app/globals.css` (~7.500 linhas) com classes `cnpja-*` (base visual) e `os-*` (painel). Tema claro/escuro por classe em `html` (`ThemeToggle`).
- Padrão mobile obrigatório abaixo de 1024px: ver `CLAUDE.md`.
- Formulários usam `Modal`/`FormError`; confirmações `useConfirm()`; avisos `useToast()`.

## Site institucional

- i18n próprio em `contexts/LocaleContext.tsx` com `messages/{pt,en,es}.json`.
- Portfólio: `scripts/list-portfolio-images.js` roda antes do `dev`/`build` e gera `lib/portfolio-images.json` a partir de `public/portfolio/`.
- SEO em `app/layout.tsx` (metadata, JSON-LD) e `app/sitemap.ts`.
