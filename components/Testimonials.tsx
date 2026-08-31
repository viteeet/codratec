'use client';

import { motion } from 'framer-motion';
import { Quote, Building2, Linkedin } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const LINKEDIN_PROFILE_URL = 'https://br.linkedin.com/in/victor-hugo-8785451b9';

type TestimonialItem = { name: string; company: string; text: string; image?: string };

export function Testimonials() {
  const { t, get } = useLocale();
  const items = (get('testimonials.items') as TestimonialItem[]) ?? [];

  return (
    <section id="testimonials" className="py-32 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight max-w-2xl">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-slate-700 font-medium">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 border border-slate-200 flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-primary/70 mb-6" />
              <p className="text-slate-700 text-base leading-relaxed mb-8 flex-1 italic font-normal">
                "{item.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                  {item.company ? (
                    <p className="text-xs text-slate-600 font-semibold mt-1 uppercase tracking-wider">{item.company}</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-start">
          <a
            href={LINKEDIN_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-primary transition-colors text-sm uppercase tracking-widest"
          >
            <Linkedin className="w-5 h-5" />
            {t('testimonials.viewOnLinkedIn')}
          </a>
        </div>
      </div>
    </section>
  );
}
