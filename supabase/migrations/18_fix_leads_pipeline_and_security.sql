-- ==============================================================================
-- MIGRAÇÃO 18: Pipeline de leads que o OS já usa + endurecimento de SQL
-- A 04 existia no repo, mas nunca entrou no banco remoto.
-- ==============================================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS scheduled_call_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS call_notes TEXT,
  ADD COLUMN IF NOT EXISTS uninterest_reason TEXT;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_check CHECK (
    status = ANY (ARRAY[
      'NOVO'::text,
      'CONTATO'::text,
      'EM_CONVERSA'::text,
      'QUALIFICADO'::text,
      'CALL_AGENDADA'::text,
      'PROPOSTA'::text,
      'NEGOCIACAO'::text,
      'GANHO'::text,
      'PERDIDO'::text,
      'NAO_INTERESSADO'::text,
      'SEM_RESPOSTA'::text,
      'FUTURO'::text
    ])
  );

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_scheduled_call ON public.leads (scheduled_call_at);

REVOKE ALL ON TABLE
  public.clients,
  public.quotes,
  public.quote_items,
  public.leads,
  public.lead_activities,
  public.lead_followups,
  public.projects,
  public.project_members,
  public.tasks,
  public.task_comments,
  public.task_attachments,
  public.revenues,
  public.expenses,
  public.sales_goals,
  public.profiles,
  public.company_settings
FROM anon;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  name_val text;
BEGIN
  IF new.raw_user_meta_data IS NOT NULL AND new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    name_val := new.raw_user_meta_data->>'full_name';
  ELSE
    name_val := split_part(new.email, '@', 1);
  END IF;

  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, active)
    VALUES (new.id, new.email, name_val, 'dev', true)
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN new;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
