'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { useLocale } from '@/contexts/LocaleContext';
import type { Locale } from '@/contexts/LocaleContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, locale, setLocale } = useLocale();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/about', label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#projects', label: t('nav.projects') },
    { href: '#contact', label: t('nav.contact') },
  ];

  // Bandeiras via CDN (emojis não aparecem em alguns Windows)
  const locales: { code: Locale; label: string; flagSrc: string }[] = [
    { code: 'pt', label: 'PT', flagSrc: 'https://flagcdn.com/w40/br.png' },
    { code: 'en', label: 'EN', flagSrc: 'https://flagcdn.com/w40/gb.png' },
    { code: 'es', label: 'ES', flagSrc: 'https://flagcdn.com/w40/es.png' },
  ];

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
          <Link href="#home">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                 className="text-slate-100 font-semibold hover:text-secondary transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
            <div className="flex items-center gap-1 border-l border-primary/30 pl-4">
              {locales.map(({ code, label, flagSrc }) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                   className={`inline-flex items-center gap-1.5 px-2 py-1 text-sm font-bold rounded transition-colors whitespace-nowrap ${
                     locale === code
                       ? 'text-secondary bg-primary/20'
                       : 'text-slate-100 hover:text-secondary'
                  }`}
                  aria-label={`Idioma: ${label}`}
                >
                  <img src={flagSrc} alt="" className="w-5 h-[0.75rem] object-cover rounded-sm" width={20} height={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center gap-1">
              {locales.map(({ code, label, flagSrc }) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                   className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded whitespace-nowrap ${
                     locale === code ? 'text-secondary bg-primary/20' : 'text-slate-100 hover:text-secondary'
                  }`}
                  aria-label={`Idioma: ${label}`}
                >
                  <img src={flagSrc} alt="" className="w-4 h-3 object-cover rounded-sm" width={16} height={12} />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary"
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
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                 className="block py-3 text-slate-100 font-semibold hover:text-secondary transition-colors border-b border-primary/10 hover:border-secondary/50"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
