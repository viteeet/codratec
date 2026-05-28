export type PortfolioItem = {
  title: string;
  href: string;
  description: string;
  iconSrc: string;
};

export const portfolioItems: PortfolioItem[] = [
  {
    title: 'MV Arte Digital',
    href: 'https://mvartedigital.vercel.app/',
    description: 'loja online de artes editáveis no Canva (entrega digital/acesso imediato)',
    iconSrc: 'https://mvartedigital.vercel.app/logo.png',
  },
  {
    title: 'Cartular — Conversor CNAB',
    href: 'https://cartular.com.br/',
    description:
      'conversão de arquivos CNAB para layout próprio, com mapeamento ajustável na página e dicionário de dados para traduzir diferentes templates',
    iconSrc:
      'https://cartular.com.br/wp-content/uploads/2024/10/Cartular_Logo-H-Azul-Royal-300x108.webp',
  },
];

