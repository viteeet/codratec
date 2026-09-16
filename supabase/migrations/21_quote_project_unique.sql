-- Uma proposta aprovada vira no máximo um projeto.
CREATE UNIQUE INDEX IF NOT EXISTS projects_quote_id_uidx
  ON public.projects (quote_id)
  WHERE quote_id IS NOT NULL;
