-- ==============================================================================
-- MIGRAÇÃO 09: ESTRUTURA DO PLANO DE CONTINUIDADE CODRATEC & RECORRÊNCIA MENSAL
-- ==============================================================================

-- 1. Adicionar campos de contrato e plano de continuidade à tabela projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS setup_amount NUMERIC(10, 2) DEFAULT 2500.00,
ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC(10, 2) DEFAULT 600.00,
ADD COLUMN IF NOT EXISTS contract_start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS contract_duration_months INT DEFAULT 12,
ADD COLUMN IF NOT EXISTS next_billing_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'ATIVO';

-- 2. Adicionar campos de setup e mensalidade à tabela quotes (Propostas)
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS setup_amount NUMERIC(10, 2) DEFAULT 2500.00,
ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC(10, 2) DEFAULT 600.00,
ADD COLUMN IF NOT EXISTS contract_duration_months INT DEFAULT 12;

-- 3. Atualizar restrições de categorias no financeiro
ALTER TABLE public.revenues DROP CONSTRAINT IF EXISTS revenues_category_check;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Garantir que as categorias de receitas incluam SETUP, MENSALIDADE, PROJETO_ADICIONAL e OUTROS
ALTER TABLE public.revenues ADD CONSTRAINT revenues_category_check 
CHECK (category IN ('SETUP', 'MENSALIDADE', 'PROJETO_ADICIONAL', 'PROJETO', 'OUTROS'));

-- Garantir que as categorias de despesas incluam HOSPEDAGEM, IA_API, DOMINIO, SERVICOS, COMISSAO e OUTROS
ALTER TABLE public.expenses ADD CONSTRAINT expenses_category_check 
CHECK (category IN ('HOSPEDAGEM', 'IA_API', 'DOMINIO', 'SERVICOS', 'COMISSAO', 'INFRAESTRUTURA', 'SOFTWARE', 'IA', 'MARKETING', 'EQUIPE', 'OUTROS'));
