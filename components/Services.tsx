'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';
import {
  Monitor,
  Cpu,
  Unplug,
  Database,
  MessageSquare,
  Briefcase,
  Users,
  Kanban
} from 'lucide-react';

const SERVICE_KEYS = ['websystems', 'automation', 'integrations', 'data', 'bots', 'business', 'crm', 'consulting'] as const;

const SERVICE_UI: Record<string, { icon: any, color: string, glow: string }> = {
  websystems:   { icon: Monitor,       color: 'text-pink-400',    glow: 'group-hover:shadow-pink-500/20' },
  automation:   { icon: Cpu,           color: 'text-amber-400',   glow: 'group-hover:shadow-amber-500/20' },
  integrations: { icon: Unplug,        color: 'text-indigo-400',  glow: 'group-hover:shadow-indigo-500/20' },
  data:         { icon: Database,      color: 'text-blue-400',    glow: 'group-hover:shadow-blue-500/20' },
  bots:         { icon: MessageSquare, color: 'text-cyan-400',    glow: 'group-hover:shadow-cyan-500/20' },
  business:     { icon: Briefcase,     color: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
  crm:          { icon: Kanban,        color: 'text-sky-400',     glow: 'group-hover:shadow-sky-500/20' },
  consulting:   { icon: Users,         color: 'text-orange-400',  glow: 'group-hover:shadow-orange-500/20' },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function Services() {
  const { t } = useLocale();

  return (
    <section id="services" className="py-24 bg-darker relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div
          className="mb-16 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-100 tracking-tight">
            {t('services.title')}
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {SERVICE_KEYS.map((key) => {
            const title = t(`services.${key}.title`);
            const description = t(`services.${key}.description`);
            const { icon: Icon, color, glow } = SERVICE_UI[key] || { icon: Monitor, color: 'text-primary', glow: '' };

            return (
              <motion.div
                key={key}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
                className={`relative p-8 bg-slate-900/50 border border-slate-800 rounded-[24px] shadow-xl hover:bg-slate-900 hover:border-slate-700 transition-all duration-300 group cursor-default backdrop-blur-sm hover:shadow-2xl ${glow}`}
              >
                <motion.div
                  className={`mb-6 ${color}`}
                  whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.4 } }}
                >
                  <Icon size={32} strokeWidth={1.5} />
                </motion.div>

                <h4 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">
                  {title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                  {description}
                </p>

                {/* subtle shine on hover */}
                <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)' }}
                />
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
