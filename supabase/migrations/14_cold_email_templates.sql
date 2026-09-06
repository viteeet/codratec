-- ==============================================================================
-- MIGRAÇÃO 14: 3 modelos de cold email Codratec
-- Padrão recomendado: "2 · Cold email (resposta)" — curto, pede resposta.
-- Região é genérica / via tags {{cidade}}/{{uf}} (sem cidade fixa).
-- ==============================================================================

DELETE FROM public.email_templates
WHERE name IN (
  'Apresentação Codratec',
  '1 · Apresentação (Quero conhecer)',
  '2 · Cold email (resposta)',
  '3 · Comercial (agressivo)'
);

INSERT INTO public.email_templates (name, subject, body) VALUES
(
  '2 · Cold email (resposta)',
  '{{razao_social}} — posso apresentar rapidamente?',
  E'Olá, {{razao_social}},\n\nAqui é a equipe da Codratec.\n\nEstamos entrando em contato com empresas da sua região para apresentar nossas soluções de gestão e automação.\n\nAcredito que podemos ajudar a simplificar processos e organizar a rotina administrativa da {{razao_social}}.\n\nPosso apresentar rapidamente como funciona?\n\nSe preferir, podemos conversar pelo WhatsApp.\n\nAtenciosamente,\nEquipe Codratec\ncodratec.com.br'
),
(
  '1 · Apresentação (Quero conhecer)',
  '{{razao_social}} — Codratec',
  E'Olá, {{razao_social}},\n\nAqui é a equipe da Codratec.\n\nDesenvolvemos sistemas para ajudar empresas e instituições a organizar sua rotina, reduzir tarefas manuais e centralizar a gestão em um só lugar.\n\nGostaríamos de apresentar nossa solução e entender se ela pode fazer sentido para a {{razao_social}}.\n\nSe tiver interesse, basta responder este e-mail com "Quero conhecer" que entraremos em contato.\n\nTambém podemos conversar pelo WhatsApp.\n\nAtenciosamente,\nEquipe Codratec\ncodratec.com.br'
),
(
  '3 · Comercial (agressivo)',
  '{{razao_social}} — gestão mais simples e organizada',
  E'Olá, {{razao_social}},\n\nA rotina administrativa pode envolver muitas tarefas, informações espalhadas e processos manuais.\n\nA Codratec desenvolve sistemas para tornar essa gestão mais simples e organizada.\n\nEstamos entrando em contato com empresas de {{cidade}}/{{uf}} e gostaríamos de apresentar nossa solução à {{razao_social}}.\n\nPosso te mostrar em poucos minutos como funciona?\n\nÉ só responder este e-mail e combinamos um horário.\n\nAtenciosamente,\nEquipe Codratec\ncodratec.com.br'
);
