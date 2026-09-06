export const EMAIL_TEMPLATE_TAGS = [
  { tag: '{{nome}}', label: 'Nome do contato' },
  { tag: '{{fantasia}}', label: 'Nome fantasia' },
  { tag: '{{empresa}}', label: 'Razão social / empresa' },
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

export function leadToTemplateVars(lead: Record<string, any>): Record<string, string> {
  const trade = String(lead.trade_name || '').trim();
  const company = String(lead.company || '').trim();
  const name = String(lead.name || '').trim();
  const display = trade || company || name || 'cliente';

  return {
    nome: name || display,
    fantasia: trade || display,
    empresa: company || trade || display,
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
