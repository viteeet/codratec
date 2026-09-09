/** Títulos do Codratec OS — uma fonte para header, sidebar e breadcrumbs. */

export const OS_PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard', title: 'Painel' },
  { prefix: '/leads', title: 'Leads' },
  { prefix: '/vendedores', title: 'Consultores' },
  { prefix: '/clientes', title: 'Clientes' },
  { prefix: '/orcamentos', title: 'Orçamentos' },
  { prefix: '/projetos', title: 'Projetos' },
  { prefix: '/demandas', title: 'Demandas' },
  { prefix: '/equipe', title: 'Equipe' },
  { prefix: '/financeiro', title: 'Financeiro' },
  { prefix: '/configuracoes', title: 'Configurações' },
];

export function getOsPageTitle(pathname: string | null | undefined): string {
  const path = pathname || '';

  if (path.includes('/orcamentos/') && path.endsWith('/editar')) return 'Editar proposta';
  if (/^\/orcamentos\/[^/]+$/.test(path)) return 'Proposta';
  if (/^\/clientes\/[^/]+$/.test(path)) return 'Conta do cliente';

  const match = OS_PAGE_TITLES.find((item) => path === item.prefix || path.startsWith(`${item.prefix}/`));
  return match?.title || 'Codratec OS';
}
