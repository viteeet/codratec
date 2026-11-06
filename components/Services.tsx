'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';
import { useWhatsAppUrl } from '@/lib/whatsapp';
import {
  ArrowUpRight,
  Monitor,
  Cpu,
  Unplug,
  Database,
  MessageSquare,
  Briefcase,
  Users,
  Kanban,
  BrainCircuit,
  Puzzle,
} from 'lucide-react';

const SERVICES = [
  { key: 'websystems', icon: Monitor },
  { key: 'automation', icon: Cpu },
  { key: 'integrations', icon: Unplug },
  { key: 'data', icon: Database },
  { key: 'bots', icon: MessageSquare },
  { key: 'ai', icon: BrainCircuit },
  { key: 'extension', icon: Puzzle },
  { key: 'business', icon: Briefcase },
  { key: 'crm', icon: Kanban },
  { key: 'consulting', icon: Users },
] as const;

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const row = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function pad(index: number) {
  return String(index + 1).padStart(2, '0');
}

function asPoints(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

const pointsMotion = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const pointMotion = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export function Services() {
  const { t, get } = useLocale();
  const whatsappUrl = useWhatsAppUrl();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = SERVICES[active];
  const Icon = current.icon;
  const points = asPoints(get(`services.${current.key}.points`));

  return (
    <section id="services" className="relative overflow-hidden bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 max-w-xl md:mb-10"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {t('services.title')}
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600 md:text-base">
            {t('services.subtitle')}
          </p>
        </motion.div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <motion.ul
            className="divide-y divide-slate-200 border-y border-slate-200 lg:divide-y-0 lg:border-0"
            variants={reduce ? undefined : list}
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            {SERVICES.map((service, index) => {
              const isActive = index === active;
              const ItemIcon = service.icon;
              return (
                <motion.li key={service.key} variants={reduce ? undefined : row}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === 'mouse') setActive(index);
                    }}
                    onFocus={() => setActive(index)}
                    aria-pressed={isActive}
                    className="relative flex w-full items-center gap-4 py-3.5 text-left lg:rounded-2xl lg:px-4 lg:py-3"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="service-active"
                        className="absolute inset-y-1 left-0 hidden w-full rounded-2xl bg-slate-950 lg:block"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 36 }
                        }
                      />
                    )}
                    <span
                      className={`relative z-10 w-7 shrink-0 font-display text-xs font-bold tabular-nums ${
                        isActive ? 'text-primary lg:text-secondary' : 'text-slate-400'
                      }`}
                    >
                      {pad(index)}
                    </span>
                    <span
                      className={`relative z-10 min-w-0 flex-1 text-sm font-semibold leading-snug md:text-base ${
                        isActive ? 'text-slate-900 lg:text-white' : 'text-slate-800'
                      }`}
                    >
                      {t(`services.${service.key}.title`)}
                    </span>
                    <ItemIcon
                      className={`relative z-10 h-4 w-4 shrink-0 ${
                        isActive ? 'text-primary lg:text-secondary' : 'text-slate-400'
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="copy"
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden pl-11 pr-2 text-sm leading-relaxed text-slate-600 lg:hidden"
                      >
                        <p>{t(`services.${service.key}.description`)}</p>
                        <ul className="mt-2 space-y-1 pb-3">
                          {asPoints(get(`services.${service.key}.points`)).map((point) => (
                            <li key={point} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className="relative hidden min-h-[28rem] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                className="absolute inset-0 flex flex-col p-8 xl:p-10"
                initial={reduce ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? undefined : { opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl font-bold leading-none tracking-tight text-slate-200">
                    {pad(active)}
                  </span>
                  <motion.span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm"
                    initial={reduce ? false : { scale: 0.8, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </motion.span>
                </div>
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    {t('services.includes')}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                    {t(`services.${current.key}.title`)}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                    {t(`services.${current.key}.description`)}
                  </p>
                  <motion.ul
                    className="mt-5 space-y-2.5"
                    variants={reduce ? undefined : pointsMotion}
                    initial={reduce ? false : 'hidden'}
                    animate="show"
                  >
                    {points.map((point) => (
                      <motion.li
                        key={point}
                        variants={reduce ? undefined : pointMotion}
                        className="flex items-start gap-2.5 text-sm font-medium text-slate-800"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-primary"
                >
                  {t('services.ask')}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
