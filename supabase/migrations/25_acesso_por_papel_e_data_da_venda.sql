-- ==============================================================================
-- MIGRAÇÃO 25: Acesso por papel, data da venda e limpeza de status (out/2026)
--
-- Decisões do Victor em 22/10/2026 (perguntas do code review):
-- 1) Cada papel vê só o que é dele no banco, não só no menu:
--    - leads: admin e gerente veem todos; vendedor vê os próprios e a fila pública;
--      dev não vê leads. Só admin exclui.
--    - histórico do lead (atividades, follow-ups, e-mails): segue quem vê o lead.
--    - orçamentos: admin e gerente alteram; vendedor só lê (para a comissão).
--    - receitas e despesas: só admin (gerente pode lançar receita, que a aprovação
--      de orçamento cria).
--    - clientes, projetos e demandas: continuam abertos à equipe.
-- 2) A venda conta na data em que o lead virou GANHO (`won_at`), não na última edição.
-- 6) Saem os status PERDIDO e EM_CONVERSA, que a tela não usa.
--
-- Rode no SQL Editor do Supabase. Pode ser rodada mais de uma vez.
-- ==============================================================================

-- ---------------------------------------------------------------------------
-- 6) Status do lead
-- ---------------------------------------------------------------------------
UPDATE public.leads SET status = 'NAO_INTERESSADO' WHERE status = 'PERDIDO';
UPDATE public.leads SET status = 'CONTATO' WHERE status = 'EM_CONVERSA';

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_check CHECK (
    status IN (
      'NOVO', 'CONTATO', 'QUALIFICADO', 'CALL_AGENDADA', 'PROPOSTA', 'NEGOCIACAO',
      'GANHO', 'NAO_INTERESSADO', 'SEM_RESPOSTA', 'FUTURO'
    )
  );

-- ---------------------------------------------------------------------------
-- 2) Data da venda
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ;

UPDATE public.leads SET won_at = updated_at WHERE status = 'GANHO' AND won_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_won_at ON public.leads (won_at) WHERE won_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.marca_data_da_venda()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'GANHO' THEN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'GANHO' THEN
      NEW.won_at := COALESCE(NEW.won_at, now());
    END IF;
  ELSE
    NEW.won_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marca_data_da_venda ON public.leads;
CREATE TRIGGER marca_data_da_venda
  BEFORE INSERT OR UPDATE OF status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.marca_data_da_venda();

-- ---------------------------------------------------------------------------
-- 1) Acesso por papel
-- ---------------------------------------------------------------------------

-- leads
DROP POLICY IF EXISTS "Equipe Codratec acessa leads" ON public.leads;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar leads" ON public.leads;
DROP POLICY IF EXISTS "Leads: leitura por papel" ON public.leads;
DROP POLICY IF EXISTS "Leads: comercial cria" ON public.leads;
DROP POLICY IF EXISTS "Leads: edicao por papel" ON public.leads;
DROP POLICY IF EXISTS "Leads: admin exclui" ON public.leads;

CREATE POLICY "Leads: leitura por papel"
  ON public.leads FOR SELECT TO authenticated
  USING (
    (SELECT public.tem_acesso_codratec())
    AND (
      (SELECT public.current_user_role()) IN ('admin', 'gerente')
      OR ((SELECT public.current_user_role()) = 'vendedor'
          AND (assigned_to = (SELECT auth.uid()) OR assigned_to IS NULL))
    )
  );

CREATE POLICY "Leads: comercial cria"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) IN ('admin', 'gerente', 'vendedor')
  );

-- Vendedor edita os próprios e os da fila; pode pegar da fila ou devolver, não passar para outro.
CREATE POLICY "Leads: edicao por papel"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    (SELECT public.tem_acesso_codratec())
    AND (
      (SELECT public.current_user_role()) IN ('admin', 'gerente')
      OR ((SELECT public.current_user_role()) = 'vendedor'
          AND (assigned_to = (SELECT auth.uid()) OR assigned_to IS NULL))
    )
  )
  WITH CHECK (
    (SELECT public.tem_acesso_codratec())
    AND (
      (SELECT public.current_user_role()) IN ('admin', 'gerente')
      OR ((SELECT public.current_user_role()) = 'vendedor'
          AND (assigned_to = (SELECT auth.uid()) OR assigned_to IS NULL))
    )
  );

CREATE POLICY "Leads: admin exclui"
  ON public.leads FOR DELETE TO authenticated
  USING ((SELECT public.tem_acesso_codratec()) AND (SELECT public.is_admin()));

-- Histórico do lead: vale para quem enxerga o lead (a subconsulta passa pela RLS de leads).
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['lead_activities', 'lead_followups', 'lead_emails']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Equipe Codratec acessa ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Quem ve o lead acessa ' || tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING ((SELECT public.tem_acesso_codratec()) AND EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id))
         WITH CHECK ((SELECT public.tem_acesso_codratec()) AND EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id))',
      'Quem ve o lead acessa ' || tbl, tbl
    );
  END LOOP;
END $$;

-- Orçamentos: admin e gerente alteram; vendedor lê.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['quotes', 'quote_items']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Equipe Codratec acessa ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Comercial le ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Gestao altera ' || tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
         USING ((SELECT public.tem_acesso_codratec()) AND (SELECT public.current_user_role()) IN (''admin'', ''gerente'', ''vendedor''))',
      'Comercial le ' || tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING ((SELECT public.tem_acesso_codratec()) AND (SELECT public.current_user_role()) IN (''admin'', ''gerente''))
         WITH CHECK ((SELECT public.tem_acesso_codratec()) AND (SELECT public.current_user_role()) IN (''admin'', ''gerente''))',
      'Gestao altera ' || tbl, tbl
    );
  END LOOP;
END $$;

-- Financeiro: só admin. Gerente lança receita (a aprovação de orçamento cria).
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['revenues', 'expenses']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Equipe Codratec acessa ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admin acessa ' || tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING ((SELECT public.tem_acesso_codratec()) AND (SELECT public.is_admin()))
         WITH CHECK ((SELECT public.tem_acesso_codratec()) AND (SELECT public.is_admin()))',
      'Admin acessa ' || tbl, tbl
    );
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Gerente lanca receitas" ON public.revenues;
CREATE POLICY "Gerente lanca receitas"
  ON public.revenues FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) = 'gerente'
  );

-- Clientes: a equipe lê; comercial cria e edita (lead ganho vira cliente); gestão exclui.
DROP POLICY IF EXISTS "Equipe Codratec acessa clients" ON public.clients;
DROP POLICY IF EXISTS "Equipe le clientes" ON public.clients;
DROP POLICY IF EXISTS "Comercial cria clientes" ON public.clients;
DROP POLICY IF EXISTS "Comercial edita clientes" ON public.clients;
DROP POLICY IF EXISTS "Gestao exclui clientes" ON public.clients;

CREATE POLICY "Equipe le clientes"
  ON public.clients FOR SELECT TO authenticated
  USING ((SELECT public.tem_acesso_codratec()));

CREATE POLICY "Comercial cria clientes"
  ON public.clients FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) IN ('admin', 'gerente', 'vendedor')
  );

CREATE POLICY "Comercial edita clientes"
  ON public.clients FOR UPDATE TO authenticated
  USING (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) IN ('admin', 'gerente', 'vendedor')
  )
  WITH CHECK (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) IN ('admin', 'gerente', 'vendedor')
  );

CREATE POLICY "Gestao exclui clientes"
  ON public.clients FOR DELETE TO authenticated
  USING (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) IN ('admin', 'gerente')
  );
