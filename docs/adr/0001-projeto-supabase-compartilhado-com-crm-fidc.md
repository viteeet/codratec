# 0001. Projeto Supabase compartilhado com o CRM FIDC

**Status:** aceita (migração 22)

## Contexto

O Codratec usa o mesmo projeto Supabase (`codratec_01`) do CRM FIDC. Os dois sistemas dividem o `auth.users`: um usuário do FIDC tem sessão válida e o papel `authenticated` no Postgres, igual a um colaborador do Codratec.

## Decisão

- Um usuário só é da equipe Codratec se tiver linha ativa em `public.profiles`. A função `tem_acesso_codratec()` checa isso e entra em toda policy das tabelas do Codratec.
- O trigger que criava perfil para todo usuário novo do Auth foi removido. Colaborador entra só por convite (`inviteTeamMember`).
- O middleware desloga quem tem sessão mas não tem perfil ativo.

## Consequências

- Toda policy nova precisa de `tem_acesso_codratec()`. Policy sem ela vaza dados para o FIDC (foi o caso das policies antigas de leads, removidas na migração 24).
- `deleteTeamMember` com service role apaga o usuário do Auth, que pode também ser usuário do FIDC. Desativar (`active = false`) é o caminho seguro.
- Separar em dois projetos Supabase acabaria com essa classe de problema, ao custo de migrar dados e chaves.
