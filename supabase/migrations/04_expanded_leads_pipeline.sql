-- ==============================================================================
-- MIGRAÇÃO 04: EXPANSÃO DO PIPELINE DE VENDAS COM CALLS, NÃO INTERESSADOS E NUTRIR
-- ==============================================================================

-- 1. Atualizar constraint de status da tabela public.leads se houver check constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- 2. Adicionar campos de agendamento de Call no Lead
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS scheduled_call_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS call_notes TEXT,
  ADD COLUMN IF NOT EXISTS uninterest_reason TEXT;

-- Index para busca por agendamentos e status
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_scheduled_call ON public.leads(scheduled_call_at);
