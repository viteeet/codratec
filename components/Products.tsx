'use client';

import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowUpRight, Bot, BrainCircuit, Gauge, Boxes, Puzzle, Kanban } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const PRODUCTS = [
  { key: 'ia', icon: BrainCircuit, tone: 'text-violet-200', glow: 'bg-violet-400/25', wide: true },
  { key: 'whatsapp', icon: Bot, tone: 'text-cyan-300', glow: 'bg-cyan-400/20', wide: true },
  { key: 'operacao', icon: Boxes, tone: 'text-amber-300', glow: 'bg-amber-400/20', wide: false },
  { key: 'painel', icon: Gauge, tone: 'text-sky-300', glow: 'bg-sky-400/20', wide: false },
  { key: 'crm', icon: Kanban, tone: 'text-indigo-200', glow: 'bg-indigo-400/25', wide: false },
  { key: 'extensao', icon: Puzzle, tone: 'text-rose-200', glow: 'bg-rose-400/25', wide: false },
] as const;

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Products() {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const bounds = useRef<HTMLElement>(null);
  const glowX = useMotionValue(120);
  const glowY = useMotionValue(80);
  const springX = useSpring(glowX, { stiffness: 70, damping: 22, mass: 0.6 });
  const springY = useSpring(glowY, { stiffness: 70, damping: 22, mass: 0.6 });
  const glow = useMotionTemplate`translate(${springX}px, ${springY}px)`;

  return (
    <section
      id="products"
      ref={bounds}
      onMouseMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        glowX.set(event.clientX - rect.left - 140);
        glowY.set(event.clientY - rect.top - 140);
      }}
      className="relative overflow-hidden bg-slate-950 py-14 text-white md:py-20"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/50 blur-3xl"
        style={{ transform: reduce ? undefined : glow }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
          backgroundSize: '4.5rem 4.5rem',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
        >
          {t('products.title')}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          variants={reduce ? undefined : list}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <motion.article
                key={product.key}
                variants={reduce ? undefined : item}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className={`group relative flex min-h-[17rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8 ${
                  product.wide ? 'md:col-span-2' : ''
                }`}
              >
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full blur-3xl ${product.glow}`}
                />
                <Icon
                  aria-hidden
                  strokeWidth={1}
                  className={`pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 ${product.tone} opacity-[0.18] transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-6`}
                />
                <h3 className="relative z-10 mt-auto max-w-sm font-display text-2xl font-bold tracking-tight md:text-3xl">
                  {t(`products.${product.key}.name`)}
                </h3>
                <p
                  className={`relative z-10 mt-3 text-base leading-relaxed text-slate-200 md:text-lg ${
                    product.wide ? 'max-w-xl' : 'max-w-[18rem] sm:max-w-xs md:max-w-[22rem]'
                  }`}
                >
                  {t(`products.${product.key}.description`)}
                </p>
                <a
                  href="#contact"
                  className="relative z-10 mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-100"
                >
                  {t('products.more')}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
