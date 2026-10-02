-- ==============================================================================
-- MIGRAÇÃO 22: Isolamento do Codratec no projeto compartilhado com o CRM FIDC
-- Só quem tem perfil ativo em public.profiles acessa os dados do Codratec.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.tem_acesso_codratec()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND COALESCE(p.active, true)
  );
$$;

REVOKE ALL ON FUNCTION public.tem_acesso_codratec() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tem_acesso_codratec() TO authenticated;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'leads', 'lead_activities', 'lead_followups', 'clients', 'quotes', 'quote_items',
    'projects', 'project_members', 'tasks', 'task_comments', 'task_attachments',
    'revenues', 'expenses', 'lead_emails'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Authenticated users access ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Equipe Codratec acessa ' || tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING ((SELECT public.tem_acesso_codratec())) WITH CHECK ((SELECT public.tem_acesso_codratec()))',
      'Equipe Codratec acessa ' || tbl, tbl
    );
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Usuarios autenticados podem criar leads" ON public.leads;
CREATE POLICY "Usuarios autenticados podem criar leads"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.tem_acesso_codratec()));

DROP POLICY IF EXISTS "Autenticados leem modelos de email" ON public.email_templates;
CREATE POLICY "Autenticados leem modelos de email"
  ON public.email_templates FOR SELECT TO authenticated
  USING ((SELECT public.tem_acesso_codratec()));

DROP POLICY IF EXISTS "Autenticados leem contato Codratec" ON public.company_settings;
CREATE POLICY "Autenticados leem contato Codratec"
  ON public.company_settings FOR SELECT TO authenticated
  USING ((SELECT public.tem_acesso_codratec()));

-- O convite do Codratec (inviteTeamMember) já grava o perfil com o papel certo.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
