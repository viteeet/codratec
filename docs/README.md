# Documentação técnica do Codratec

O repositório tem duas aplicações no mesmo Next.js:

1. **Site institucional** (`/`, `/privacy`): página pública da Codratec, em português, inglês e espanhol.
2. **Codratec OS** (`/dashboard`, `/leads`, ...): painel interno para captar leads, fazer orçamentos e tocar projetos.

| Documento | O que tem |
| --- | --- |
| [`../CONTEXT.md`](../CONTEXT.md) | Glossário do negócio (lead, briefing, orçamento, demanda...) |
| [`arquitetura.md`](arquitetura.md) | Stack, pastas, como uma tela busca e grava dados, autenticação |
| [`modelo-de-dados.md`](modelo-de-dados.md) | Tabelas, relações, status e as regras de RLS em produção |
| [`permissoes.md`](permissoes.md) | O que cada papel vê e faz, e onde cada regra é aplicada |
| [`fluxos.md`](fluxos.md) | Lead → briefing → orçamento → projeto → receita, e-mail Brevo, importação |
| [`operacao.md`](operacao.md) | Variáveis de ambiente, deploy, migrations, cron, scripts |
| [`adr/`](adr/) | Decisões de arquitetura e o porquê |

Regras de layout mobile e de componentes base ficam no [`CLAUDE.md`](../CLAUDE.md) da raiz.
O documento de produto original (visão, módulos, roadmap) é o [`Codratec OS.md`](../Codratec%20OS.md).
Parte dele ainda não existe no código (agenda, arquivos de demanda, auditoria, IA).
