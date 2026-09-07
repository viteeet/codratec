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

/** 1) Escolas — gestão sem aumentar complexidade */
export const OUTREACH_TEMPLATE_ESCOLAS_GESTAO: OutreachTemplateSeed = {
  name: 'Escolas · Gestão sem complexidade',
  subject: '{{razao_social}} — sua escola está preparada para crescer?',
  body: `Olá, {{razao_social}},

**Sua escola está preparada para crescer sem aumentar a complexidade da gestão?**

Administrar uma escola particular exige organização, agilidade e controle. Quando os processos dependem de planilhas, mensagens e tarefas manuais, sua equipe perde tempo e a gestão perde eficiência.

A **Codratec** desenvolve soluções de tecnologia para modernizar a gestão da sua instituição e tornar os processos mais simples, organizados e eficientes.

Centralize informações, reduza tarefas manuais e tenha mais controle sobre a operação da sua escola.

Não importa se sua instituição está começando a se digitalizar ou se já utiliza sistemas: podemos desenvolver uma solução alinhada às necessidades do seu negócio.

**Sua escola tem desafios específicos. Sua tecnologia também deve ter.**

Entre em contato com a **Codratec** e conheça nossas soluções para instituições de ensino.

**Codratec Software House**
Tecnologia desenvolvida para o seu negócio.

codratec.com.br`,
};

/** 2) Escolas — processos manuais */
export const OUTREACH_TEMPLATE_ESCOLAS_MANUAL: OutreachTemplateSeed = {
  name: 'Escolas · Processos manuais',
  subject: '{{razao_social}} — ainda perde tempo com processos manuais?',
  body: `Olá, {{razao_social}},

**Sua escola ainda perde tempo com processos manuais?**

A rotina de uma escola particular envolve muito mais do que ensinar.

Gestão de alunos, professores, informações, organização e acompanhamento das atividades podem consumir horas da equipe, principalmente quando tudo fica espalhado em planilhas, mensagens e sistemas diferentes.

**A Codratec desenvolve soluções para simplificar a gestão da sua escola.**

Tenha mais organização, praticidade e tecnologia para ajudar sua equipe a trabalhar melhor e dedicar mais tempo ao que realmente importa: a educação.

**Leve sua escola para uma gestão mais digital.**

Fale com a Codratec e descubra como podemos ajudar sua instituição.

**Codratec Software House**
Tecnologia para transformar a gestão do seu negócio.

codratec.com.br`,
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
export const DEFAULT_OUTREACH_TEMPLATE = OUTREACH_TEMPLATE_ESCOLAS_MANUAL;

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
