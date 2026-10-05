# Codratec OS

## Padrão de layout mobile

Toda tela nova ou alterada do painel (`app/(dashboard)`) segue estas regras abaixo de 1024px. O desktop (≥1024px) não muda.

- **Filtros de página:** use `OsPageToolbar` com `os-page-toolbar__field--search` para a busca, que ocupa a linha inteira, e `os-page-toolbar__field--select` para os selects, que ficam lado a lado. No celular a toolbar não tem caixa em volta.
- **Muitos filtros:** use uma folha de filtros em grade de 2 colunas, com grupos titulados (`rl-filter-group-title`). Opções booleanas aparecem como chips (`rl-filter-toggles`). Veja `components/os/LeadsView.tsx`.
- **Troca de visão:** use um controle segmentado com as opções visíveis (`rl-mobile-views`), não um botão que alterna entre elas.
- **KPIs:** use `grid-cols-2`. Quando a quantidade de cards for ímpar, o último card ganha `col-span-2`. Os cards levam `os-kpi-card`, que deixa o padding compacto. Ícones e descrições secundárias ficam `hidden sm:*`.
- **Cards (`os-mobile-card`):**
  - Ações em grade: `os-mobile-card-actions--grid`.
  - Select e botão na mesma linha: `os-mobile-card-inline`.
  - Status ou desfecho em bloco próprio: `os-mobile-card-outcome`.
- **Tabelas:** `cnpja-table-container` fica oculto no celular, então toda tabela precisa de uma lista `os-mobile-cards` equivalente.
- **Cabeçalho:** os estilos de `os-page-header__actions` valem só para filhos diretos, para não afetar botões dentro de modais abertos dali.
- **Inputs e selects:** mantenha a fonte em 16px no celular, para o iOS não dar zoom ao focar o campo.

## Componentes base e organização do código

- **Formulários em modal:** use `Modal` e `FormError` de `components/ui/Modal.tsx`, não monte `os-modal-overlay` à mão.
- **Confirmações:** use `useConfirm()` de `components/ui/Feedback.tsx` (`if (!(await confirm({ title: 'Excluir?' }))) return;`). Não use `window.confirm`.
- **Avisos de sucesso ou erro:** use `useToast()` (`toast.success('Cliente salvo.')`) depois que a action der certo.
- **Server actions:** ficam em `actions/<assunto>.ts` (leads, email, quotes, projects, clients, team, financial, settings, sales-goals, dashboard, handoffs, auth). Funções internas compartilhadas vão em `lib/server/actions-helpers.ts`, que não tem `'use server'` para não virarem endpoints.
- **Consultas grandes:** o Supabase devolve no máximo 1.000 linhas; para ler uma tabela inteira use `fetchAllRows`.
- **Tela de leads:** as partes ficam em `components/os/leads/` (filtros, tabela, kanban, dash); `LeadsView.tsx` só junta as partes e cuida da seleção e das ações em lote.
