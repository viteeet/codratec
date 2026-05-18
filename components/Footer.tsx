'use client';

import { Github, Instagram, Linkedin } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const GITHUB_URL = 'https://github.com/viteeet';
const LINKEDIN_URL = 'https://br.linkedin.com/in/victor-hugo-8785451b9';
const INSTAGRAM_URL = 'https://www.instagram.com/codratec/';

export function Footer() {
  const { t } = useLocale();
  const phone = t('common.phone');
  const email = t('common.email');

  return (
    <footer className="bg-darker border-t border-primary/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-300 text-sm text-center md:text-left">
            {t('footer.rights')}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <a href={`tel:${phone.replace(/[\s()-]/g, '')}`} className="hover:text-secondary transition-colors">
                {phone}
              </a>
              <span className="hidden sm:inline">·</span>
              <a href={`mailto:${email}`} className="hover:text-secondary transition-colors">
                {email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-secondary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-secondary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          <a href="/privacy" className="text-slate-300 hover:text-secondary transition-colors text-sm">
            {t('footer.privacy')}
          </a>
        </div>
      </div>
    </footer>
  );
}
