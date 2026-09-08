export const EMAIL_LEAD_TAGS = [
  { tag: '{{razao_social}}', label: 'Razão social' },
  { tag: '{{nome_fantasia}}', label: 'Nome fantasia' },
  { tag: '{{nome}}', label: 'Nome do contato / responsável' },
  { tag: '{{fantasia}}', label: 'Nome fantasia (alias)' },
  { tag: '{{empresa}}', label: 'Razão social (alias)' },
  { tag: '{{cnpj}}', label: 'CNPJ' },
  { tag: '{{cidade}}', label: 'Cidade' },
  { tag: '{{uf}}', label: 'UF' },
  { tag: '{{email}}', label: 'E-mail do lead' },
  { tag: '{{telefone}}', label: 'Telefone do lead' },
  { tag: '{{whatsapp}}', label: 'WhatsApp do lead' },
  { tag: '{{vendedor}}', label: 'Vendedor atribuído' },
  { tag: '{{status}}', label: 'Status do lead' },
] as const;

export const CODRATEC_CONTACT_EMAIL = 'contato@codratec.com.br';
export const CODRATEC_SITE_URL = 'https://codratec.com.br';
export const CODRATEC_SITE_LABEL = 'codratec.com.br';
export const CODRATEC_PHONE = '+55 21 98357-3881';
export const CODRATEC_WHATSAPP = '+55 21 98357-3881';
export const CODRATEC_WHATSAPP_LINK = 'https://wa.me/5521983573881';
export const CODRATEC_COMPANY_NAME = 'Codratec Software House';

export const EMAIL_CODRATEC_TAGS = [
  { tag: '{{codratec_nome}}', label: 'Nome da Codratec' },
  { tag: '{{codratec_email}}', label: 'E-mail comercial Codratec' },
  { tag: '{{codratec_site}}', label: 'Site Codratec' },
  { tag: '{{codratec_telefone}}', label: 'Telefone Codratec' },
  { tag: '{{codratec_whatsapp}}', label: 'WhatsApp Codratec' },
  { tag: '{{codratec_whatsapp_link}}', label: 'Link do WhatsApp Codratec' },
] as const;

export const EMAIL_TEMPLATE_TAGS = [...EMAIL_LEAD_TAGS, ...EMAIL_CODRATEC_TAGS];

export type EmailTemplateTag = (typeof EMAIL_TEMPLATE_TAGS)[number]['tag'];

export type OutreachTemplateSeed = {
  name: string;
  subject: string;
  body: string;
};

function codratecTemplateVars(): Record<string, string> {
  return {
    codratec_nome: CODRATEC_COMPANY_NAME,
    codratec_email: CODRATEC_CONTACT_EMAIL,
    email_codratec: CODRATEC_CONTACT_EMAIL,
    contato_codratec: CODRATEC_CONTACT_EMAIL,
    codratec_site: CODRATEC_SITE_URL,
    site_codratec: CODRATEC_SITE_URL,
    site: CODRATEC_SITE_LABEL,
    codratec_telefone: CODRATEC_PHONE,
    telefone_codratec: CODRATEC_PHONE,
    codratec_whatsapp: CODRATEC_WHATSAPP,
    whatsapp_codratec: CODRATEC_WHATSAPP,
    codratec_whatsapp_link: CODRATEC_WHATSAPP_LINK,
    whatsapp_link_codratec: CODRATEC_WHATSAPP_LINK,
  };
}

/** 1) Escolas — gestão sem aumentar complexidade */
export const OUTREACH_TEMPLATE_ESCOLAS_GESTAO: OutreachTemplateSeed = {
  name: 'Escolas · Gestão sem complexidade',
  subject: '{{nome_fantasia}} — sua escola está preparada para crescer?',
  body: `Olá, {{nome}},

**Sua escola está preparada para crescer sem aumentar a complexidade da gestão?**

Administrar uma escola particular exige organização, agilidade e controle. Quando os processos dependem de planilhas, mensagens e tarefas manuais, sua equipe perde tempo e a gestão perde eficiência.

A **Codratec** desenvolve soluções de tecnologia para modernizar a gestão da {{nome_fantasia}} e tornar os processos mais simples, organizados e eficientes.

Centralize informações, reduza tarefas manuais e tenha mais controle sobre a operação da sua escola.

Não importa se sua instituição está começando a se digitalizar ou se já utiliza sistemas: podemos desenvolver uma solução alinhada às necessidades do seu negócio.

**Sua escola tem desafios específicos. Sua tecnologia também deve ter.**

Entre em contato com a **Codratec** e conheça nossas soluções para instituições de ensino.

E-mail: {{codratec_email}}
WhatsApp: {{codratec_whatsapp}}
{{codratec_whatsapp_link}}

**{{codratec_nome}}**
Tecnologia desenvolvida para o seu negócio.

{{codratec_site}}`,
};

/** 2) Escolas — processos manuais */
export const OUTREACH_TEMPLATE_ESCOLAS_MANUAL: OutreachTemplateSeed = {
  name: 'Escolas · Processos manuais',
  subject: '{{nome_fantasia}} — ainda perde tempo com processos manuais?',
  body: `Olá, {{nome}},

**Sua escola ainda perde tempo com processos manuais?**

A rotina de uma escola particular envolve muito mais do que ensinar.

Gestão de alunos, professores, informações, organização e acompanhamento das atividades podem consumir horas da equipe, principalmente quando tudo fica espalhado em planilhas, mensagens e sistemas diferentes.

**A Codratec desenvolve soluções para simplificar a gestão da {{nome_fantasia}}.**

Tenha mais organização, praticidade e tecnologia para ajudar sua equipe a trabalhar melhor e dedicar mais tempo ao que realmente importa: a educação.

**Leve sua escola para uma gestão mais digital.**

Fale com a Codratec e descubra como podemos ajudar sua instituição.

E-mail: {{codratec_email}}
WhatsApp: {{codratec_whatsapp}}
{{codratec_whatsapp_link}}

**{{codratec_nome}}**
Tecnologia para transformar a gestão do seu negócio.

{{codratec_site}}`,
};

/** @deprecated aliases — mantidos para imports antigos */
export const OUTREACH_TEMPLATE_APRESENTACAO = OUTREACH_TEMPLATE_ESCOLAS_GESTAO;
export const OUTREACH_TEMPLATE_COLD = OUTREACH_TEMPLATE_ESCOLAS_MANUAL;
export const OUTREACH_TEMPLATE_COMERCIAL = OUTREACH_TEMPLATE_ESCOLAS_GESTAO;

export const OUTREACH_TEMPLATES: OutreachTemplateSeed[] = [
  OUTREACH_TEMPLATE_ESCOLAS_GESTAO,
  OUTREACH_TEMPLATE_ESCOLAS_MANUAL,
];

/** Padrão da campanha: escolas / processos manuais. */
export const DEFAULT_OUTREACH_TEMPLATE = OUTREACH_TEMPLATE_ESCOLAS_GESTAO;

export function leadToTemplateVars(lead: Record<string, any>): Record<string, string> {
  const trade = String(lead.trade_name || '').trim();
  const company = String(lead.company || '').trim();
  const name = String(lead.name || '').trim();
  const display = trade || company || name || 'cliente';
  const razao = company || trade || display;
  const fantasia = trade || company || display;

  return {
    ...codratecTemplateVars(),
    nome: name || display,
    fantasia,
    nome_fantasia: fantasia,
    empresa: razao,
    razao_social: razao,
    cnpj: String(lead.document || '').trim(),
    cidade: String(lead.city || '').trim(),
    uf: String(lead.state || '').trim(),
    email: String(lead.email || '').trim(),
    telefone: String(lead.phone || lead.whatsapp || '').trim(),
    whatsapp: String(lead.whatsapp || lead.phone || '').trim(),
    vendedor: String(lead.assigned?.full_name || lead.assigned?.email || 'Fila pública').trim(),
    status: String(lead.status || '').trim(),
  };
}

/** Substitui {{tag}} (case-insensitive) pelos valores do lead e da Codratec. */
export function applyEmailTemplate(
  text: string,
  lead: Record<string, any>,
): string {
  const vars = leadToTemplateVars(lead);
  return String(text || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const k = key.toLowerCase();
    return vars[k] ?? '';
  });
}
