-- ==============================================================================
-- MIGRAÇÃO 06: DETALHAMENTO DE PROPOSTAS COMERCIAIS E GERADOR DE PDF
-- ==============================================================================

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT '50% na aprovação + 50% na entrega e homologação do projeto.',
  ADD COLUMN IF NOT EXISTS scope_summary TEXT;
