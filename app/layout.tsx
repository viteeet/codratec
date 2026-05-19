import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://codratec.com'),
  title: {
    default: 'CODRATEC — Software House',
    template: '%s | CODRATEC',
  },
  description: 'Sistemas e automações que reduzem trabalho manual e aumentam escala. Arquitetura de dados, produtos digitais e integração de ERPs.',
  keywords: ['software house', 'CODRATEC', 'Victor Hugo', 'automação', 'sistemas web sob medida', 'APIs', 'dados', 'dashboards'],
  authors: [{ name: 'Victor Hugo' }],
  creator: 'CODRATEC',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: ['en_US', 'es_ES'],
    url: 'https://codratec.com',
    title: 'CODRATEC — Software House',
    description: 'Sistemas e automações que reduzem trabalho manual e aumentam escala.',
    siteName: 'CODRATEC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CODRATEC — Software House',
    description: 'Sistemas e automações que reduzem trabalho manual e aumentam escala.',
    creator: '@codratec',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-dark text-gray-100`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CODRATEC',
              description: 'Software House',
              url: 'https://codratec.com',
              sameAs: [
                'https://github.com/viteeet',
                'https://br.linkedin.com/in/victor-hugo-8785451b9',
              ],
              knowsAbout: [
                'Web Development',
                'Next.js',
                'React',
                'Python',
                'Automation',
                'Full Stack Development',
              ],
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

