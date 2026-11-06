'use client';

import { Github, Instagram, Linkedin } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const GITHUB_URL = 'https://github.com/viteeet';
const LINKEDIN_URL = 'https://br.linkedin.com/in/victor-hugo-8785451b9';
const INSTAGRAM_URL = 'https://www.instagram.com/codratec/';

const socials = [
  { href: GITHUB_URL, label: 'GitHub', icon: Github },
  { href: LINKEDIN_URL, label: 'LinkedIn', icon: Linkedin },
  { href: INSTAGRAM_URL, label: 'Instagram', icon: Instagram },
];

export function Footer() {
  const { t } = useLocale();
  const phone = t('common.phone');
  const email = t('common.email');

  return (
    <footer className="border-t border-slate-200 bg-slate-50 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] pt-8">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-600 md:text-left">
          {t('footer.rights')}
        </p>

        <p className="hidden flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium text-slate-700 md:flex">
          <a href={`tel:${phone.replace(/[\s()-]/g, '')}`} className="hover:text-primary">
            {phone}
          </a>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <a href={`mailto:${email}`} className="hover:text-primary">
            {email}
          </a>
        </p>

        <div className="flex items-center justify-center gap-1 md:justify-end">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-9 w-9 items-center justify-center text-slate-600 hover:text-primary"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
          <a href="/privacy" className="ml-2 text-sm font-medium text-slate-600 hover:text-primary">
            {t('footer.privacy')}
          </a>
        </div>
      </div>
    </footer>
  );
}
