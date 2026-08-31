'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';

const WHATSAPP_URL = 'https://wa.me/5521983573881';

const HERO_VALUES = [
  'Sistemas em operação contínua',
  'Automações em rotinas críticas',
  'Sistemas financeiros e operacionais',
  'Do zero à produção',
];

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' },
  }),
};

export function Hero() {
  const { t } = useLocale();
  const titleWords = t('hero.title').split(' ');

  return (
    <section id="home" className="relative min-h-screen flex items-center bg-slate-50 pt-20 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px] z-[1]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-secondary/6 rounded-full blur-[100px] z-[1]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl">

          {/* Title — word-by-word reveal */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold leading-[1.1] tracking-tight text-slate-900 mb-6">
              <span className="inline-flex flex-wrap gap-x-4">
                {titleWords.map((word, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={wordVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                className="text-2xl sm:text-3xl md:text-4xl text-primary font-medium tracking-normal block mt-2"
              >
                {t('hero.subtitle')}
              </motion.span>
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl leading-relaxed"
          >
            {t('hero.tagline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 items-start mb-20"
          >
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold text-lg transition-colors duration-200 w-full sm:w-auto"
              whileHover={{ scale: 1.03, backgroundColor: '#1e40af' }}
              whileTap={{ scale: 0.97 }}
            >
              {t('hero.cta')}
            </motion.a>
            <motion.a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-slate-300 text-slate-700 font-bold text-lg transition-colors duration-200 w-full sm:w-auto"
              whileHover={{ scale: 1.03, borderColor: '#94a3b8', color: '#0f172a' }}
              whileTap={{ scale: 0.97 }}
            >
              {t('nav.services')}
            </motion.a>
          </motion.div>

          {/* Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative flex overflow-hidden border-t border-slate-200 pt-8"
          >
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="flex whitespace-nowrap items-center gap-12 text-xs uppercase tracking-widest text-slate-600 font-semibold"
            >
              {[...HERO_VALUES, ...HERO_VALUES, ...HERO_VALUES].map((value, i) => (
                <div key={i} className="flex items-center gap-12">
                  <span>{value}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
