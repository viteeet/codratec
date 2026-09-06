-- ==============================================================================
-- MIGRAÇÃO 10: CORRIGIR RECURSÃO INFINITA NAS POLICIES DE profiles
-- ==============================================================================
-- Sintoma: "infinite recursion detected in policy for relation \"profiles\""
-- ao importar leads (insert + select dispara RLS de leads → profiles → profiles).
--
-- Causa: policies de profiles faziam EXISTS (SELECT … FROM profiles …),
-- reentrando na mesma policy.
--
-- Correção: helpers SECURITY DEFINER (bypass RLS) + policies sem auto-consulta.
-- Rode no SQL Editor do Supabase se as migrations não forem aplicadas automaticamente.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = 'admin', false);
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users or admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR public.is_admin()
);

CREATE POLICY "Users or admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR public.is_admin()
)
WITH CHECK (
  (SELECT auth.uid()) = id
  OR public.is_admin()
);

-- ---------------------------------------------------------------------------
-- leads (evita consultar profiles sob RLS durante import)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins possuem acesso total aos leads" ON public.leads;
DROP POLICY IF EXISTS "Vendedores visualizam leads atribuidos ou sem dono" ON public.leads;
DROP POLICY IF EXISTS "Vendedores atualizam seus proprios leads" ON public.leads;

CREATE POLICY "Admins possuem acesso total aos leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Vendedores visualizam leads atribuidos ou sem dono"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR public.is_admin()
  );

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

-- ---------------------------------------------------------------------------
-- sales_goals (mesma armadilha de EXISTS em profiles)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins possuem controle total das metas" ON public.sales_goals;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sales_goals'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins possuem controle total das metas"
        ON public.sales_goals
        FOR ALL
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $policy$;
  END IF;
END $$;
