'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { useLocale } from '@/contexts/LocaleContext';
import type { Locale } from '@/contexts/LocaleContext';

type NavItem =
  | { kind: 'page'; href: string; label: string }
  | { kind: 'section'; sectionId: string; label: string };

const locales: { code: Locale; label: string; flagSrc: string }[] = [
  { code: 'pt', label: 'PT', flagSrc: 'https://flagcdn.com/w40/br.png' },
  { code: 'en', label: 'EN', flagSrc: 'https://flagcdn.com/w40/gb.png' },
  { code: 'es', label: 'ES', flagSrc: 'https://flagcdn.com/w40/es.png' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, locale, setLocale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { kind: 'section', sectionId: 'services', label: t('nav.services') },
    { kind: 'section', sectionId: 'projects', label: t('nav.projects') },
    { kind: 'section', sectionId: 'contact', label: t('nav.contact') },
  ];

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', `/#${sectionId}`);
  }, []);

  const goToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      closeMenu();
      if (pathname === '/') {
        scrollToSection(sectionId);
      } else {
        router.push(`/#${sectionId}`);
      }
    },
    [pathname, closeMenu, scrollToSection, router]
  );

  const linkClass = (active: boolean) =>
    `font-semibold transition-colors duration-200 ${
      active ? 'text-secondary' : 'text-slate-900 hover:text-secondary'
    }`;

  const renderNavLink = (item: NavItem, className: string, onNavigate?: () => void) => {
    if (item.kind === 'page') {
      const active = pathname === item.href;
      return (
        <Link
          href={item.href}
          onClick={onNavigate}
          className={`${className} ${linkClass(active)}`.trim()}
        >
          {item.label}
        </Link>
      );
    }

    return (
      <a
        href={`/#${item.sectionId}`}
        onClick={(e) => {
          goToSection(e, item.sectionId);
          onNavigate?.();
        }}
        className={`${className} ${linkClass(false)}`.trim()}
      >
        {item.label}
      </a>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-darker/90 backdrop-blur-lg shadow-lg border-b border-primary/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className={linkClass(pathname === '/')} onClick={closeMenu}>
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <span key={item.kind === 'page' ? item.href : item.sectionId}>
                {renderNavLink(item, '')}
              </span>
            ))}
            <div className="flex items-center gap-1 border-l border-primary/30 pl-4">
              {locales.map(({ code, label, flagSrc }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 text-sm font-bold rounded transition-colors whitespace-nowrap ${
                    locale === code
                      ? 'text-secondary bg-primary/20'
                      : 'text-slate-900 hover:text-secondary'
                  }`}
                  aria-label={`Idioma: ${label}`}
                >
                  <img
                    src={flagSrc}
                    alt=""
                    className="w-5 h-[0.75rem] object-cover rounded-sm"
                    width={20}
                    height={15}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1.5 min-w-0">
            <div className="flex items-center">
              {locales.map(({ code, label, flagSrc }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`inline-flex items-center justify-center min-w-11 min-h-11 rounded ${
                    locale === code ? 'text-secondary bg-primary/20' : 'text-slate-900 hover:text-secondary'
                  }`}
                  aria-label={`Idioma: ${label}`}
                >
                  <img
                    src={flagSrc}
                    alt=""
                    className="w-5 h-[0.85rem] object-cover rounded-sm"
                    width={20}
                    height={14}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center min-w-11 min-h-11 text-secondary"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-darker/95 backdrop-blur-lg border-t border-primary/20 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.kind === 'page' ? item.href : item.sectionId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                >
                  {renderNavLink(
                    item,
                    'block py-3 border-b border-primary/10 hover:border-secondary/50',
                    closeMenu
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
