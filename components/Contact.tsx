'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const WHATSAPP_URL = 'https://wa.me/5521983573881';

export function Contact() {
  const { t } = useLocale();
  const phone = t('common.phone');
  const email = t('common.email');

  return (
    <section id="contact" className="py-32 bg-slate-900 relative overflow-hidden">
      {/* ambient glow */}
      <motion.div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-100 mb-6 leading-tight">
              {t('contact.title')}
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col gap-6 shrink-0 lg:w-[320px]"
          >
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full px-8 py-5 bg-primary text-slate-900 font-bold text-lg overflow-hidden relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">{t('contact.cta')}</span>
              <motion.span
                className="relative z-10"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
              {/* shine sweep */}
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%', skewX: '-20deg' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </motion.a>

            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors text-base font-medium group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                {email}
              </motion.a>

              <motion.a
                href={`tel:${phone.replace(/[\s()-]/g, '')}`}
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors text-base font-medium group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Phone className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                {phone}
              </motion.a>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
