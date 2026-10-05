-- ==============================================================================
-- MIGRAÇÃO 23: Briefing de proposta (comercial sinaliza lead interessado ao dev)
-- O comercial envia um briefing da conversa; o lead entra na fila "Propostas a fazer".
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.lead_handoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    conversation_summary TEXT NOT NULL,
    client_needs TEXT NOT NULL,
    system_type TEXT CHECK (system_type IN ('SITE', 'SISTEMA_WEB', 'APP', 'AUTOMACAO', 'INTEGRACAO', 'OUTRO')),
    current_process TEXT,
    budget_range TEXT CHECK (budget_range IN ('ATE_5K', '5K_15K', '15K_50K', 'ACIMA_50K', 'NAO_INFORMADO')),
    urgency TEXT CHECK (urgency IN ('URGENTE', 'ATE_3_MESES', 'SEM_PRESSA')),
    decision_maker TEXT,
    temperature TEXT CHECK (temperature IN ('QUENTE', 'MORNO', 'FRIO')),
    status TEXT NOT NULL DEFAULT 'ENVIADO'
      CHECK (status IN ('ENVIADO', 'EM_ANALISE', 'PRECISA_INFO', 'ORCAMENTO_CRIADO', 'CANCELADO')),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_handoffs_lead ON public.lead_handoffs (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_status ON public.lead_handoffs (status);
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_requested_by ON public.lead_handoffs (requested_by);

-- Um briefing aberto por lead (os fechados ficam como histórico)
CREATE UNIQUE INDEX IF NOT EXISTS uq_lead_handoffs_open_per_lead
  ON public.lead_handoffs (lead_id)
  WHERE status IN ('ENVIADO', 'EM_ANALISE', 'PRECISA_INFO');

ALTER TABLE public.lead_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipe Codratec le briefings" ON public.lead_handoffs;
CREATE POLICY "Equipe Codratec le briefings"
  ON public.lead_handoffs FOR SELECT TO authenticated
  USING ((SELECT public.tem_acesso_codratec()));

DROP POLICY IF EXISTS "Equipe Codratec envia briefings" ON public.lead_handoffs;
CREATE POLICY "Equipe Codratec envia briefings"
  ON public.lead_handoffs FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.tem_acesso_codratec()) AND requested_by = (SELECT auth.uid()));

-- Quem enviou edita o próprio briefing; admin e gerente tratam qualquer um
DROP POLICY IF EXISTS "Autor ou gestao atualiza briefings" ON public.lead_handoffs;
CREATE POLICY "Autor ou gestao atualiza briefings"
  ON public.lead_handoffs FOR UPDATE TO authenticated
  USING (
    (SELECT public.tem_acesso_codratec())
    AND (
      requested_by = (SELECT auth.uid())
      OR (SELECT public.current_user_role()) IN ('admin', 'gerente')
    )
  )
  WITH CHECK ((SELECT public.tem_acesso_codratec()));

DROP POLICY IF EXISTS "Gestao remove briefings" ON public.lead_handoffs;
CREATE POLICY "Gestao remove briefings"
  ON public.lead_handoffs FOR DELETE TO authenticated
  USING (
    (SELECT public.tem_acesso_codratec())
    AND (SELECT public.current_user_role()) IN ('admin', 'gerente')
  );

-- Novos tipos no histórico do lead
ALTER TABLE public.lead_activities DROP CONSTRAINT IF EXISTS lead_activities_type_check;
ALTER TABLE public.lead_activities
  ADD CONSTRAINT lead_activities_type_check CHECK (
    type IN ('LIGAÇÃO', 'WHATSAPP', 'EMAIL', 'REUNIÃO', 'OBSERVAÇÃO', 'BRIEFING', 'PERGUNTA_DEV')
  );
