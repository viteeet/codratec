-- ==============================================================================
-- MIGRAÇÃO 12: Modelos de e-mail (templates) com tags para envio Brevo
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_templates_name ON public.email_templates (name);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gerenciam modelos de email" ON public.email_templates;
DROP POLICY IF EXISTS "Autenticados leem modelos de email" ON public.email_templates;

-- Leitura para autenticados (seleção no envio)
CREATE POLICY "Autenticados leem modelos de email"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- CRUD completo só admin
CREATE POLICY "Admins gerenciam modelos de email"
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;

-- Modelo inicial de exemplo
INSERT INTO public.email_templates (name, subject, body)
SELECT
  'Apresentação Codratec',
  'Olá, {{fantasia}} — Codratec',
  E'Olá, {{nome}},\n\nSomos a Codratec e gostaríamos de conversar com a {{empresa}} ({{cidade}}/{{uf}}).\n\nSe fizer sentido, responda este e-mail ou fale conosco pelo WhatsApp.\n\nAtenciosamente,\nEquipe Codratec'
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE name = 'Apresentação Codratec'
);
