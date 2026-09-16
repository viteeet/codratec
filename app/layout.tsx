import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { PwaRegister } from '@/components/PwaRegister';

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
    icon: [
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CODRATEC',
  },
  applicationName: 'CODRATEC',
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f172a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('codratec_theme');if(t==='light'||t==='dark'){document.documentElement.classList.add(t);}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
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
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}

