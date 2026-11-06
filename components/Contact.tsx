'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Mail } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { useWhatsAppUrl } from '@/lib/whatsapp';

export function Contact() {
  const { t } = useLocale();
  const whatsappUrl = useWhatsAppUrl();
  const reduce = useReducedMotion();
  const phone = t('common.phone');
  const email = t('common.email');
  const tel = phone.replace(/[\s()-]/g, '');

  return (
    <section id="contact" className="scroll-mt-24 bg-white py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            {t('contact.title')}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 md:mt-4 md:text-lg">
            {t('contact.subtitle')}
          </p>
          <a
            href={`tel:${tel}`}
            className="mt-4 block font-display text-3xl font-bold leading-none tracking-tight text-primary transition-colors hover:text-slate-900 sm:text-4xl md:text-6xl"
          >
            {phone}
          </a>
          <div className="mt-6 grid grid-cols-2 gap-2 md:mt-8 md:flex md:gap-3">
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-sm font-bold text-white md:px-5"
            >
              <span className="md:hidden">WhatsApp</span>
              <span className="hidden whitespace-nowrap md:inline">{t('contact.cta')}</span>
              <ArrowUpRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href={`mailto:${email}`}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-3 py-3 text-sm font-bold text-slate-900 md:px-5"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="md:hidden">{t('contact.orEmail')}</span>
              <span className="hidden whitespace-nowrap md:inline">{email}</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
