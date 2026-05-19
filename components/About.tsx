'use client';

import Link from 'next/link';
import { Linkedin, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';

const LINKEDIN_VICTOR = 'https://br.linkedin.com/in/victor-hugo-8785451b9';
const LINKEDIN_BEATRIZ = 'https://www.linkedin.com/in/beatriz-souto-de-freitas-82a892133/';
const WHATSAPP_URL = 'https://wa.me/5521983573881';

type ValueItem = { title: string; description: string };
type ApproachItem = { step: string; title: string; description: string };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function About() {
  const { t, get } = useLocale();

  const values = (get('about.values') as ValueItem[]) ?? [];
  const approach = (get('about.approach') as ApproachItem[]) ?? [];

  const members = [
    {
      name: 'Victor Hugo',
      role: t('about.victor.role'),
      bio: t('about.victor.bio'),
      photo: '/victor.png',
      linkedin: LINKEDIN_VICTOR,
    },
    {
      name: 'Beatriz Souto',
      role: t('about.beatriz.role'),
      bio: t('about.beatriz.bio'),
      photo: '/beatriz.png',
      linkedin: LINKEDIN_BEATRIZ,
    },
  ];

  return (
    <section id="about" className="pb-24 bg-darker overflow-hidden relative">
      <motion.div
        className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
        aria-hidden
      />
      <motion.div
        className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-20 pt-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-100 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-primary font-medium mb-6">{t('about.subtitle')}</p>
          <p className="text-slate-400 text-lg leading-relaxed">{t('about.intro')}</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24 p-8 md:p-12 border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm"
        >
          <motion.div
            className="flex items-center gap-3 mb-4"
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Target className="w-6 h-6 text-primary shrink-0" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100">
              {t('about.missionTitle')}
            </h2>
          </motion.div>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-4xl">
            {t('about.mission')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100 mb-10 text-center">
            {t('about.valuesTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 border border-slate-700/50 bg-slate-800/30 hover:border-primary/30 transition-colors duration-300"
              >
                <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100 mb-10 text-center">
            {t('about.approachTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 border-t-2 border-primary bg-slate-900/50"
              >
                <span className="text-3xl font-display font-bold text-primary/40 mb-3 block">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-slate-100 mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100 mb-4">
              {t('about.teamTitle')}
            </h2>
            <p className="text-slate-400 leading-relaxed">{t('about.teamSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {members.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative flex flex-col items-center md:items-start text-center md:text-left p-8 rounded-sm border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 hover:border-primary/30 transition-all duration-500 shadow-xl"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6 w-full">
                  <motion.div className="relative shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-28 h-28 rounded-sm object-cover border-2 border-slate-700 group-hover:border-primary/50 relative z-10 transition-colors duration-500 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-secondary rounded-sm p-1.5 shadow-lg z-20 hidden md:block">
                      <Linkedin className="w-4 h-4 text-slate-900" />
                    </div>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-100 group-hover:text-secondary transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-primary font-bold text-sm tracking-wide uppercase mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-sm lg:text-base flex-1 mb-8">
                  {member.bio}
                </p>

                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-100 bg-slate-700/50 hover:bg-primary px-5 py-2.5 rounded-sm font-medium transition-all duration-300"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">{t('about.linkedin')}</span>
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-10 md:p-14 border border-primary/20 bg-gradient-to-br from-primary/10 via-slate-900/80 to-slate-900/80"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100 mb-4">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            {t('about.ctaSubtitle')}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-slate-900 font-bold text-lg hover:bg-white transition-colors duration-200"
          >
            {t('about.ctaButton')}
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="mt-6">
            <Link
              href={{ pathname: '/', hash: 'projects' }}
              className="text-slate-500 hover:text-secondary text-sm transition-colors"
            >
              {t('nav.projects')} →
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
