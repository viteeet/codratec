-- ==============================================================================
-- MIGRAÇÃO 07: ADICIONAR CARGO DE GERENTE COM PERMISSÃO DE EMISSÃO DE ORÇAMENTOS
-- ==============================================================================

-- Adicionar 'gerente' ao enum user_role se for tipo enum ou atualizar a restrição
DO $$ 
BEGIN 
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gerente';
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;
