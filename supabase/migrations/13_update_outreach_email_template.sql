-- ==============================================================================
-- MIGRAÇÃO 13: Modelo de e-mail com oferta de automações Codratec
-- ==============================================================================

UPDATE public.email_templates
SET
  subject = '{{fantasia}}, automações para otimizar tempo e reduzir custos — Codratec',
  body = E'Olá, {{nome}},\n\nSomos a Codratec — fazemos automações e sistemas para empresas como a {{empresa}} ({{cidade}}/{{uf}}).\n\nNosso foco é simples:\n• otimizar o tempo da equipe\n• reduzir custo operacional\n• aumentar o controle dos processos\n\nAutomatizamos rotinas manuais, integramos sistemas e criamos fluxos sob medida para a operação rodar com mais escala e menos retrabalho.\n\nConheça nosso trabalho:\nhttps://codratec.com.br\n\nSe fizer sentido conversar, responda este e-mail ou fale conosco em contato@codratec.com.br. Teremos prazer em entender a rotina de vocês e indicar onde a automação gera mais ganho.\n\nAtenciosamente,\nEquipe Codratec\nhttps://codratec.com.br\ncontato@codratec.com.br',
  updated_at = timezone('utc'::text, now())
WHERE name = 'Apresentação Codratec';

INSERT INTO public.email_templates (name, subject, body)
SELECT
  'Apresentação Codratec',
  '{{fantasia}}, automações para otimizar tempo e reduzir custos — Codratec',
  E'Olá, {{nome}},\n\nSomos a Codratec — fazemos automações e sistemas para empresas como a {{empresa}} ({{cidade}}/{{uf}}).\n\nNosso foco é simples:\n• otimizar o tempo da equipe\n• reduzir custo operacional\n• aumentar o controle dos processos\n\nAutomatizamos rotinas manuais, integramos sistemas e criamos fluxos sob medida para a operação rodar com mais escala e menos retrabalho.\n\nConheça nosso trabalho:\nhttps://codratec.com.br\n\nSe fizer sentido conversar, responda este e-mail ou fale conosco em contato@codratec.com.br. Teremos prazer em entender a rotina de vocês e indicar onde a automação gera mais ganho.\n\nAtenciosamente,\nEquipe Codratec\nhttps://codratec.com.br\ncontato@codratec.com.br'
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE name = 'Apresentação Codratec'
);
