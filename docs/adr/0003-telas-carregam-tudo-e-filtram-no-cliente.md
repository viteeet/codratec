# 0003. Telas carregam a tabela inteira e filtram no navegador

**Status:** em vigor

## Contexto

A tela de leads precisa de filtros combinados (status, consultor, nicho, cidade, capital, faturamento, contato, e-mail lido...), ordenação por qualquer coluna, kanban e dash com totais. Fazer isso no banco exigiria uma API de filtros.

## Decisão

`getLeads()` busca todos os leads com `fetchAllRows` (lotes de 1.000, limite do PostgREST) e `useLeadFilters` filtra, ordena e pagina no cliente. As outras telas fazem o mesmo, sem paginação.

## Consequências

- Filtros instantâneos e código simples.
- Com ~730 leads são ~415 kB por carga, repetidos a cada `router.refresh()` depois de qualquer ação. Na casa de 5 a 10 mil leads isso pesa no celular. O próximo passo seria trazer só as colunas da lista e buscar o resto ao abrir a ficha, ou paginar no servidor.
- Ações em lote mandam listas de ids grandes; por isso `chunkIds` quebra o `.in()` em lotes de 150.
