-- ==============================================================================
-- MIGRAÇÃO 11: Permitir atribuição / claim de leads
-- ==============================================================================
-- Admin: já cobre via is_admin()
-- Vendedor: pode pegar lead da fila pública (assigned_to IS NULL) e devolver à fila

DROP POLICY IF EXISTS "Vendedores atualizam seus proprios leads" ON public.leads;

CREATE POLICY "Vendedores atualizam seus proprios leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR assigned_to = auth.uid()
    OR assigned_to IS NULL
  )
  WITH CHECK (
    public.is_admin()
    OR assigned_to = auth.uid()
    OR assigned_to IS NULL
  );
