-- ==============================================================================
-- MIGRAÇÃO 05: METAS MENSARIAIS DE VENDAS, COMISSÕES E RANKING COMERCIAL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  target_sales_count INT NOT NULL DEFAULT 8,
  target_revenue_amount NUMERIC(12, 2) DEFAULT 0,
  commission_rate_percent NUMERIC(5, 2) DEFAULT 10.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_monthly_goal UNIQUE(user_id, year, month)
);

-- Index para consulta por período
CREATE INDEX IF NOT EXISTS idx_sales_goals_period ON public.sales_goals(year, month);

-- Habilitar RLS
ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;

-- Regras de Segurança (RLS)
CREATE POLICY "Admins possuem controle total das metas"
  ON public.sales_goals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Vendedores leem suas próprias metas"
  ON public.sales_goals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
