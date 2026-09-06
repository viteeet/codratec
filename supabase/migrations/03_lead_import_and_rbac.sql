-- ==============================================================================
-- MIGRAÇÃO 03: EXPANSÃO DE LEADS PARA IMPORTAÇÃO B2B (RECEITA FEDERAL) E RLS POR VENDEDOR
-- ==============================================================================

-- 1. Adicionar campos enriquecidos de PJ/CNPJ à tabela de leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS document TEXT,
  ADD COLUMN IF NOT EXISTS person_type TEXT DEFAULT 'PJ',
  ADD COLUMN IF NOT EXISTS trade_name TEXT,
  ADD COLUMN IF NOT EXISTS main_activity TEXT,
  ADD COLUMN IF NOT EXISTS cnae_code TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS niche TEXT;

-- Index para busca rápida por CNPJ / Razão Social
CREATE INDEX IF NOT EXISTS idx_leads_document ON public.leads(document);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);

-- 2. Atualizar Políticas de Segurança (RLS) para Leads por Cargo
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados gerenciam leads" ON public.leads;
DROP POLICY IF EXISTS "Admins possuem acesso total aos leads" ON public.leads;
DROP POLICY IF EXISTS "Vendedores visualizam leads atribuidos ou sem dono" ON public.leads;
DROP POLICY IF EXISTS "Vendedores atualizam seus proprios leads" ON public.leads;

-- Política 1: Admins possuem controle total sobre TODOS os leads
CREATE POLICY "Admins possuem acesso total aos leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Política 2: Vendedores enxergam apenas os leads atribuídos a eles ou leads na fila pública (assigned_to IS NULL)
CREATE POLICY "Vendedores visualizam leads atribuidos ou sem dono"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR public.is_admin()
  );

-- Política 3: Vendedores podem atualizar apenas os leads atribuídos a eles
CREATE POLICY "Vendedores atualizam seus proprios leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    assigned_to = auth.uid()
    OR public.is_admin()
  );

-- Política 4: Usuários autenticados podem inserir novos leads
CREATE POLICY "Usuarios autenticados podem criar leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
