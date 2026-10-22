# Codratec OS

## Padrão de layout mobile

Toda tela nova ou alterada do painel (`app/(dashboard)`) segue estas regras abaixo de 1024px. O desktop (≥1024px) não muda. O objetivo é mostrar o máximo de conteúdo sem rolar: nada de filtros abertos, botões de largura cheia ou blocos altos no topo da página.

- **Cabeçalho:** título e ação principal na mesma linha, com o botão em largura automática. A descrição (`OsPageHeader description`) some abaixo de 640px, então não coloque nela nada que o usuário precise para usar a tela. Os estilos de `os-page-header__actions` valem só para filhos diretos, para não afetar botões dentro de modais abertos dali.
- **Filtros de página:** use `OsFilterBar` (`components/os/OsFilterBar.tsx`), passando a busca e os selects como `filters`. No celular vira uma linha só, com a busca e um botão de filtros com contador; os selects ficam numa folha que abre por baixo, e os filtros ativos aparecem como chips removíveis logo abaixo (`os-filter-chips`). No desktop renderiza a toolbar de sempre. Não monte `OsPageToolbar` com selects à mão.
- **Muitos filtros:** use uma folha de filtros em grade de 2 colunas, com grupos titulados (`rl-filter-group-title`), e mostre os ativos como chips com `OsActiveFilterChips`. Veja `components/os/LeadsView.tsx` e `components/os/leads/LeadsActiveChips.tsx`.
- **Abas e filtros rápidos (`os-chip-bar`):** uma linha de chips de 32px que rola para o lado, não uma grade de botões.
- **Troca de visão:** use um controle segmentado com as opções visíveis (`rl-mobile-views`), não um botão que alterna entre elas. Quando divide a linha com a busca, use só os ícones (`rl-mobile-views--icons`) com `aria-label`.
- **KPIs:** use `grid-cols-2`. Quando a quantidade de cards for ímpar, o último card ganha `col-span-2`. Os cards levam `os-kpi-card` (padding compacto); em `os-metric-card` o ícone some e rótulo e valor ficam na mesma linha. Ícones e descrições secundárias ficam `hidden sm:*`.
- **Cards (`os-mobile-card`):**
  - Linhas secundárias juntas numa só, cortada com reticências: `os-mobile-card-sub--clamp` (ex.: `cliente · descrição`).
  - Ações numa linha só, em colunas iguais: `os-mobile-card-actions--grid os-mobile-card-actions--row`, com rótulos curtos (ex.: prop `compact` em `QuoteRowActions`). Use a grade de 2 colunas só quando os rótulos não couberem.
  - Botões dos cards têm 36px de altura no celular.
  - Select e botão na mesma linha: `os-mobile-card-inline`.
  - Status ou desfecho em bloco próprio: `os-mobile-card-outcome`; textos longos dos botões dali vão em `quote-outcome__long`, que some no card.
- **Tabelas:** `cnpja-table-container` fica oculto no celular, então toda tabela precisa de uma lista `os-mobile-cards` equivalente.
- **Inputs e selects:** mantenha a fonte em 16px no celular, para o iOS não dar zoom ao focar o campo. A altura dos campos de busca e filtro é 40px.

## Componentes base e organização do código

- **Formulários em modal:** use `Modal` e `FormError` de `components/ui/Modal.tsx`, não monte `os-modal-overlay` à mão.
- **Confirmações:** use `useConfirm()` de `components/ui/Feedback.tsx` (`if (!(await confirm({ title: 'Excluir?' }))) return;`). Não use `window.confirm`.
- **Avisos de sucesso ou erro:** use `useToast()` (`toast.success('Cliente salvo.')`) depois que a action der certo.
- **Server actions:** ficam em `actions/<assunto>.ts` (leads, email, quotes, projects, clients, team, financial, settings, sales-goals, dashboard, handoffs, auth). Funções internas compartilhadas vão em `lib/server/actions-helpers.ts`, que não tem `'use server'` para não virarem endpoints.
- **Consultas grandes:** o Supabase devolve no máximo 1.000 linhas; para ler uma tabela inteira use `fetchAllRows`.
- **Tela de leads:** as partes ficam em `components/os/leads/` (filtros, tabela, kanban, dash); `LeadsView.tsx` só junta as partes e cuida da seleção e das ações em lote.
