'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/contexts/LocaleContext';
import {
  Monitor,
  Cpu,
  Unplug,
  Database,
  MessageSquare,
  Briefcase,
  Users,
  Kanban,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';

const SERVICE_KEYS = [
  'websystems',
  'automation',
  'integrations',
  'data',
  'bots',
  'business',
  'crm',
  'consulting',
] as const;

type ServiceKey = (typeof SERVICE_KEYS)[number];
type ServiceCategory = 'systems' | 'automation' | 'data';
type ServiceCategoryFilter = 'all' | ServiceCategory;

type ServiceConfig = {
  category: ServiceCategory;
  categoryName: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  benefits: string[];
};

const SERVICE_CONFIGS: Record<ServiceKey, ServiceConfig> = {
  websystems: {
    category: 'systems',
    categoryName: 'Sistemas & Gestão',
    icon: Monitor,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    benefits: [
      'Desenvolvimento do zero à produção',
      'Arquitetura escalável e segura',
      'Interface intuitiva para equipes operacionais',
    ],
  },
  business: {
    category: 'systems',
    categoryName: 'Sistemas & Gestão',
    icon: Briefcase,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    benefits: [
      'Controle centralizado de estoque e financeiro',
      'Redução de planilhas e retrabalho',
      'Acesso seguro por perfis de permissão',
    ],
  },
  crm: {
    category: 'systems',
    categoryName: 'Sistemas & Gestão',
    icon: Kanban,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    benefits: [
      'Funis de vendas e cobrança personalizados',
      'Automação de tarefas do time comercial',
      'Histórico completo de interações',
    ],
  },
  automation: {
    category: 'automation',
    categoryName: 'Automação & Bots',
    icon: Cpu,
    color: 'from-amber-600 to-orange-600 text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    benefits: [
      'Eliminação de processos manuais repetitivos',
      'Redução drástica de falhas operacionais',
      'Execução contínua 24h por dia',
    ],
  },
  bots: {
    category: 'automation',
    categoryName: 'Automação & Bots',
    icon: MessageSquare,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    benefits: [
      'Atendimento e triagem automática',
      'Disparo de notificações e lembretes',
      'Conexão direta com bancos de dados e APIs',
    ],
  },
  integrations: {
    category: 'automation',
    categoryName: 'Automação & Bots',
    icon: Unplug,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    benefits: [
      'Conexão entre ERPs, CRMs e gateways de pagamento',
      'Sincronização de dados em tempo real',
      'Webhooks e mensageria segura',
    ],
  },
  data: {
    category: 'data',
    categoryName: 'Dados & Consultoria',
    icon: Database,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    benefits: [
      'Dashboards visuais e interativos',
      'Atualização automática de métricas cruciais',
      'Indicadores confiáveis para tomada de decisão',
    ],
  },
  consulting: {
    category: 'data',
    categoryName: 'Dados & Consultoria',
    icon: Users,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    benefits: [
      'Mapeamento detalhado de gargalos de software',
      'Planejamento de arquitetura de alta performance',
      'Acompanhamento técnico para migrações',
    ],
  },
};

const WHATSAPP_URL = 'https://wa.me/5521983573881';

export function Services() {
  const { t } = useLocale();
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryFilter>('all');
  const [selectedServiceKey, setSelectedServiceKey] = useState<ServiceKey | null>(null);

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedServiceKey) {
        setSelectedServiceKey(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (selectedServiceKey) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedServiceKey]);

  const filteredKeys = SERVICE_KEYS.filter((key) => {
    if (activeCategory === 'all') return true;
    return SERVICE_CONFIGS[key].category === activeCategory;
  });

  const categories: { id: ServiceCategoryFilter; label: string }[] = [
    { id: 'all', label: t('services.tabs.all') || 'Todos os serviços' },
    { id: 'systems', label: t('services.tabs.systems') || 'Sistemas & Gestão' },
    { id: 'automation', label: t('services.tabs.automation') || 'Automação & Bots' },
    { id: 'data', label: t('services.tabs.data') || 'Dados & Consultoria' },
  ];

  const activeService = selectedServiceKey ? SERVICE_CONFIGS[selectedServiceKey] : null;
  const activeServiceTitle = selectedServiceKey ? t(`services.${selectedServiceKey}.title`) : '';
  const activeServiceDescription = selectedServiceKey ? t(`services.${selectedServiceKey}.description`) : '';

  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 tracking-tight mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-14"
          role="tablist"
          aria-label={t('services.title')}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 text-sm md:text-base font-bold rounded-lg border transition-all duration-200 shadow-sm ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Service Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredKeys.map((key, index) => {
              const title = t(`services.${key}.title`);
              const description = t(`services.${key}.description`);
              const config = SERVICE_CONFIGS[key];
              const Icon = config.icon;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  whileHover={{ y: -6 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Top Row: Icon Container & Category Tag */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-sm ${config.bgColor} ${config.borderColor}`}
                      >
                        <Icon className={`w-7 h-7 ${config.color}`} strokeWidth={2} />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] uppercase tracking-wider rounded-md">
                        {config.categoryName}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                      {description}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedServiceKey(key)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors"
                    >
                      Saber mais detalhes
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
                    </button>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-md bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-xs"
                    >
                      Solicitar
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedServiceKey && activeService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
              onClick={() => setSelectedServiceKey(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-sm ${activeService.bgColor} ${activeService.borderColor}`}
                  >
                    <activeService.icon className={`w-7 h-7 ${activeService.color}`} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">
                      {activeService.categoryName}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                      {activeServiceTitle}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedServiceKey(null)}
                  className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">Visão Geral</h4>
                  <p className="text-slate-700 leading-relaxed font-medium text-base">
                    {activeServiceDescription}
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-3">
                    O que entregamos nesta solução:
                  </h4>
                  <ul className="space-y-2.5">
                    {activeService.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal Footer CTA */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-slate-600 text-sm font-medium">
                    Atendimento rápido e direto com desenvolvedor
                  </span>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto"
                  >
                    Solicitar Orçamento no WhatsApp
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

