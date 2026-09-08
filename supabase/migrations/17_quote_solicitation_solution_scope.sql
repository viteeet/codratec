-- ==============================================================================
-- MIGRAÇÃO 17: Campos simples da proposta (solicitação, solução, escopo)
-- Sem fases. O detalhamento fica no projeto após o aceite.
-- ==============================================================================

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS solicitation TEXT,
  ADD COLUMN IF NOT EXISTS proposed_solution TEXT,
  ADD COLUMN IF NOT EXISTS general_scope TEXT;
