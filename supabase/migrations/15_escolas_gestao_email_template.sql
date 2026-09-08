-- ==============================================================================
-- MIGRAÇÃO 15: Modelo escolas (dor + benefício) + tags de contato Codratec
-- ==============================================================================

INSERT INTO public.email_templates (name, subject, body)
SELECT
  'Escolas · Gestão sem complexidade',
  '{{nome_fantasia}} — sua escola está preparada para crescer?',
  E'Olá, {{nome}},\n\n**Sua escola está preparada para crescer sem aumentar a complexidade da gestão?**\n\nAdministrar uma escola particular exige organização, agilidade e controle. Quando os processos dependem de planilhas, mensagens e tarefas manuais, sua equipe perde tempo e a gestão perde eficiência.\n\nA **Codratec** desenvolve soluções de tecnologia para modernizar a gestão da {{nome_fantasia}} e tornar os processos mais simples, organizados e eficientes.\n\nCentralize informações, reduza tarefas manuais e tenha mais controle sobre a operação da sua escola.\n\nNão importa se sua instituição está começando a se digitalizar ou se já utiliza sistemas: podemos desenvolver uma solução alinhada às necessidades do seu negócio.\n\n**Sua escola tem desafios específicos. Sua tecnologia também deve ter.**\n\nEntre em contato com a **Codratec** e conheça nossas soluções para instituições de ensino.\n\nE-mail: {{codratec_email}}\nWhatsApp: {{codratec_whatsapp}}\n{{codratec_whatsapp_link}}\n\n**{{codratec_nome}}**\nTecnologia desenvolvida para o seu negócio.\n\n{{codratec_site}}'
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE name = 'Escolas · Gestão sem complexidade'
);

UPDATE public.email_templates
SET
  subject = '{{nome_fantasia}} — sua escola está preparada para crescer?',
  body = E'Olá, {{nome}},\n\n**Sua escola está preparada para crescer sem aumentar a complexidade da gestão?**\n\nAdministrar uma escola particular exige organização, agilidade e controle. Quando os processos dependem de planilhas, mensagens e tarefas manuais, sua equipe perde tempo e a gestão perde eficiência.\n\nA **Codratec** desenvolve soluções de tecnologia para modernizar a gestão da {{nome_fantasia}} e tornar os processos mais simples, organizados e eficientes.\n\nCentralize informações, reduza tarefas manuais e tenha mais controle sobre a operação da sua escola.\n\nNão importa se sua instituição está começando a se digitalizar ou se já utiliza sistemas: podemos desenvolver uma solução alinhada às necessidades do seu negócio.\n\n**Sua escola tem desafios específicos. Sua tecnologia também deve ter.**\n\nEntre em contato com a **Codratec** e conheça nossas soluções para instituições de ensino.\n\nE-mail: {{codratec_email}}\nWhatsApp: {{codratec_whatsapp}}\n{{codratec_whatsapp_link}}\n\n**{{codratec_nome}}**\nTecnologia desenvolvida para o seu negócio.\n\n{{codratec_site}}',
  updated_at = timezone('utc'::text, now())
WHERE name = 'Escolas · Gestão sem complexidade';

INSERT INTO public.email_templates (name, subject, body)
SELECT
  'Escolas · Processos manuais',
  '{{nome_fantasia}} — ainda perde tempo com processos manuais?',
  E'Olá, {{nome}},\n\n**Sua escola ainda perde tempo com processos manuais?**\n\nA rotina de uma escola particular envolve muito mais do que ensinar.\n\nGestão de alunos, professores, informações, organização e acompanhamento das atividades podem consumir horas da equipe, principalmente quando tudo fica espalhado em planilhas, mensagens e sistemas diferentes.\n\n**A Codratec desenvolve soluções para simplificar a gestão da {{nome_fantasia}}.**\n\nTenha mais organização, praticidade e tecnologia para ajudar sua equipe a trabalhar melhor e dedicar mais tempo ao que realmente importa: a educação.\n\n**Leve sua escola para uma gestão mais digital.**\n\nFale com a Codratec e descubra como podemos ajudar sua instituição.\n\nE-mail: {{codratec_email}}\nWhatsApp: {{codratec_whatsapp}}\n{{codratec_whatsapp_link}}\n\n**{{codratec_nome}}**\nTecnologia para transformar a gestão do seu negócio.\n\n{{codratec_site}}'
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE name = 'Escolas · Processos manuais'
);

UPDATE public.email_templates
SET
  subject = '{{nome_fantasia}} — ainda perde tempo com processos manuais?',
  body = E'Olá, {{nome}},\n\n**Sua escola ainda perde tempo com processos manuais?**\n\nA rotina de uma escola particular envolve muito mais do que ensinar.\n\nGestão de alunos, professores, informações, organização e acompanhamento das atividades podem consumir horas da equipe, principalmente quando tudo fica espalhado em planilhas, mensagens e sistemas diferentes.\n\n**A Codratec desenvolve soluções para simplificar a gestão da {{nome_fantasia}}.**\n\nTenha mais organização, praticidade e tecnologia para ajudar sua equipe a trabalhar melhor e dedicar mais tempo ao que realmente importa: a educação.\n\n**Leve sua escola para uma gestão mais digital.**\n\nFale com a Codratec e descubra como podemos ajudar sua instituição.\n\nE-mail: {{codratec_email}}\nWhatsApp: {{codratec_whatsapp}}\n{{codratec_whatsapp_link}}\n\n**{{codratec_nome}}**\nTecnologia para transformar a gestão do seu negócio.\n\n{{codratec_site}}',
  updated_at = timezone('utc'::text, now())
WHERE name = 'Escolas · Processos manuais';
