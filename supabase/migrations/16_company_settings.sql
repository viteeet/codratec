-- ==============================================================================
-- MIGRAÇÃO 16: Contato institucional da Codratec (tags de e-mail)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.company_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT 'Codratec Software House',
  email TEXT NOT NULL DEFAULT 'contato@codratec.com.br',
  phone TEXT,
  whatsapp TEXT,
  site_url TEXT NOT NULL DEFAULT 'https://codratec.com.br',
  site_label TEXT NOT NULL DEFAULT 'codratec.com.br',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados leem contato Codratec" ON public.company_settings;
DROP POLICY IF EXISTS "Admins gerenciam contato Codratec" ON public.company_settings;

CREATE POLICY "Autenticados leem contato Codratec"
  ON public.company_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins gerenciam contato Codratec"
  ON public.company_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;

INSERT INTO public.company_settings (id, company_name, email, phone, whatsapp, site_url, site_label)
VALUES (
  1,
  'Codratec Software House',
  'contato@codratec.com.br',
  '+55 21 98357-3881',
  '+55 21 98357-3881',
  'https://codratec.com.br',
  'codratec.com.br'
)
ON CONFLICT (id) DO NOTHING;
