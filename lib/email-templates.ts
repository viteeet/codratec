export const EMAIL_TEMPLATE_TAGS = [
  { tag: '{{razao_social}}', label: 'Razão social' },
  { tag: '{{nome_fantasia}}', label: 'Nome fantasia' },
  { tag: '{{nome}}', label: 'Nome do contato / responsável' },
  { tag: '{{fantasia}}', label: 'Nome fantasia (alias)' },
  { tag: '{{empresa}}', label: 'Razão social (alias)' },
  { tag: '{{cnpj}}', label: 'CNPJ' },
  { tag: '{{cidade}}', label: 'Cidade' },
  { tag: '{{uf}}', label: 'UF' },
  { tag: '{{email}}', label: 'E-mail do lead' },
  { tag: '{{telefone}}', label: 'Telefone' },
  { tag: '{{whatsapp}}', label: 'WhatsApp' },
  { tag: '{{vendedor}}', label: 'Vendedor atribuído' },
  { tag: '{{status}}', label: 'Status do lead' },
] as const;

export type EmailTemplateTag = (typeof EMAIL_TEMPLATE_TAGS)[number]['tag'];

export const CODRATEC_CONTACT_EMAIL = 'contato@codratec.com.br';
export const CODRATEC_SITE_URL = 'https://codratec.com.br';

export type OutreachTemplateSeed = {
  name: string;
  subject: string;
  body: string;
};

/** 1) Apresentação geral — CTA “Quero conhecer” */
export const OUTREACH_TEMPLATE_APRESENTACAO: OutreachTemplateSeed = {
  name: '1 · Apresentação (Quero conhecer)',
  subject: '{{razao_social}} — Codratec',
  body: `Olá, {{razao_social}},

Aqui é a equipe da Codratec.

Desenvolvemos sistemas para ajudar empresas e instituições a organizar sua rotina, reduzir tarefas manuais e centralizar a gestão em um só lugar.

Gostaríamos de apresentar nossa solução e entender se ela pode fazer sentido para a {{razao_social}}.

Se tiver interesse, basta responder este e-mail com "Quero conhecer" que entraremos em contato.

Também podemos conversar pelo WhatsApp.

Atenciosamente,
Equipe Codratec
codratec.com.br`,
};

/**
 * 2) Cold email curto — padrão para campanha em massa.
 * Objetivo: conseguir uma resposta, não fechar venda no 1º e-mail.
 */
export const OUTREACH_TEMPLATE_COLD: OutreachTemplateSeed = {
  name: '2 · Cold email (resposta)',
  subject: '{{razao_social}} — posso apresentar rapidamente?',
  body: `Olá, {{razao_social}},

Aqui é a equipe da Codratec.

Estamos entrando em contato com empresas da sua região para apresentar nossas soluções de gestão e automação.

Acredito que podemos ajudar a simplificar processos e organizar a rotina administrativa da {{razao_social}}.

Posso apresentar rapidamente como funciona?

Se preferir, podemos conversar pelo WhatsApp.

Atenciosamente,
Equipe Codratec
codratec.com.br`,
};

/** 3) Abordagem comercial mais direta */
export const OUTREACH_TEMPLATE_COMERCIAL: OutreachTemplateSeed = {
  name: '3 · Comercial (agressivo)',
  subject: '{{razao_social}} — gestão mais simples e organizada',
  body: `Olá, {{razao_social}},

A rotina administrativa pode envolver muitas tarefas, informações espalhadas e processos manuais.

A Codratec desenvolve sistemas para tornar essa gestão mais simples e organizada.

Estamos entrando em contato com empresas de {{cidade}}/{{uf}} e gostaríamos de apresentar nossa solução à {{razao_social}}.

Posso te mostrar em poucos minutos como funciona?

É só responder este e-mail e combinamos um horário.

Atenciosamente,
Equipe Codratec
codratec.com.br`,
};

export const OUTREACH_TEMPLATES: OutreachTemplateSeed[] = [
  OUTREACH_TEMPLATE_COLD,
  OUTREACH_TEMPLATE_APRESENTACAO,
  OUTREACH_TEMPLATE_COMERCIAL,
];

/** Padrão da campanha: cold curto (conseguir resposta). */
export const DEFAULT_OUTREACH_TEMPLATE = OUTREACH_TEMPLATE_COLD;

export function leadToTemplateVars(lead: Record<string, any>): Record<string, string> {
  const trade = String(lead.trade_name || '').trim();
  const company = String(lead.company || '').trim();
  const name = String(lead.name || '').trim();
  const display = trade || company || name || 'cliente';
  const razao = company || trade || display;
  const fantasia = trade || company || display;

  return {
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

/** Substitui {{tag}} (case-insensitive) pelos valores do lead. */
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
