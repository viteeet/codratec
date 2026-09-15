-- Log de disparos Brevo + status entregue/lido nos leads

CREATE TABLE IF NOT EXISTS public.lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT,
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'ENVIADO'
    CHECK (status IN ('ENVIADO', 'ENTREGUE', 'LIDO', 'REJEITADO', 'ERRO')),
  bounce_reason TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS lead_emails_message_id_uidx
  ON public.lead_emails (message_id)
  WHERE message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_emails_lead ON public.lead_emails (lead_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_emails_to ON public.lead_emails (lower(to_email));

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS last_email_status TEXT,
  ADD COLUMN IF NOT EXISTS last_email_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_email_subject TEXT,
  ADD COLUMN IF NOT EXISTS last_email_to TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_last_email_status ON public.leads (last_email_status);

ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users access lead_emails" ON public.lead_emails;
CREATE POLICY "Authenticated users access lead_emails"
  ON public.lead_emails FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_emails TO authenticated;
