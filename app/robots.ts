import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/login',
        '/leads',
        '/clientes',
        '/orcamentos',
        '/projetos',
        '/demandas',
        '/equipe',
        '/financeiro',
        '/configuracoes',
        '/vendedores',
      ],
    },
    sitemap: 'https://codratec.com/sitemap.xml',
  };
}
