/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/consultores', destination: '/vendedores', permanent: true },
      { source: '/consultores/:path*', destination: '/vendedores/:path*', permanent: true },
      { source: '/settings', destination: '/configuracoes', permanent: true },
      { source: '/tasks', destination: '/demandas', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
