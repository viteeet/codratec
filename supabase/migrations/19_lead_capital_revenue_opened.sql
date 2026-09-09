-- ==============================================================================
-- MIGRAÇÃO 19: Capital social, faturamento e início de atividade nos leads
-- ==============================================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(16, 2),
  ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC(16, 2),
  ADD COLUMN IF NOT EXISTS opened_at DATE;

CREATE INDEX IF NOT EXISTS idx_leads_share_capital ON public.leads (share_capital);
CREATE INDEX IF NOT EXISTS idx_leads_annual_revenue ON public.leads (annual_revenue);
CREATE INDEX IF NOT EXISTS idx_leads_opened_at ON public.leads (opened_at);
