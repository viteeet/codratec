-- ==============================================================================
-- MIGRAÇÃO 16: nome único em email_templates + revoga GRANT de anon
-- Seed/restore faz upsert por name; índice não único permitia duplicata.
-- RLS já bloqueia anon, mas GRANT ALL no public era excessivo.
-- ==============================================================================

DROP INDEX IF EXISTS public.idx_email_templates_name;

CREATE UNIQUE INDEX IF NOT EXISTS email_templates_name_key
  ON public.email_templates (name);

REVOKE ALL ON TABLE public.email_templates FROM anon;
