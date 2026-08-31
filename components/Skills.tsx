'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Code, Database, Bot, Workflow, Globe, Zap, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SkillGroup {
  category: string;
  skills: string[];
  icon: any;
  color: string;
  description: string;
  benefits: string[];
}

const skillGroups: SkillGroup[] = [
  {
    category: 'Frontend & UI',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    description:
      'Frontend é a parte visual e interativa que os usuários veem e tocam no site ou aplicativo. Como a vitrine de uma loja, é o que cria a experiência visual e deixa tudo bonito e funcional para o usuário.',
    benefits: [
      'Interface moderna e responsiva para todos os dispositivos',
      'Experiência de usuário fluida e intuitiva',
      'Design atrativo que engaja visitantes',
      'Carga rápida e otimizada',
    ],
  },
  {
    category: 'Backend & APIs',
    skills: ['Python', 'Node.js', 'REST APIs', 'GraphQL'],
    icon: Workflow,
    color: 'from-green-500 to-emerald-500',
    description:
      'Backend é o "cérebro" que funciona por trás dos panos, processando dados, autenticando usuários e fazendo tudo funcionar. APIs são como mensageiros que permitem que diferentes partes do sistema conversem entre si.',
    benefits: [
      'Processamento seguro de dados e transações',
      'Integração com sistemas externos',
      'Escalabilidade para crescer com seu negócio',
      'Segurança e proteção de informações',
    ],
  },
  {
    category: 'Bancos de Dados',
    skills: ['PostgreSQL', 'MongoDB', 'Redis', 'SQL'],
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    description:
      'São sistemas organizados para guardar e gerenciar informações de forma eficiente e segura. Como uma biblioteca digital inteligente que permite armazenar milhões de dados e encontrar o que precisa em segundos.',
    benefits: [
      'Armazenamento seguro e organizado',
      'Acesso rápido a informações',
      'Backup automático contra perdas',
      'Suporte a milhões de registros',
    ],
  },
  {
    category: 'Automações',
    skills: ['Python Scripts', 'Bots', 'Web Scraping', 'E2E'],
    icon: Bot,
    color: 'from-yellow-500 to-orange-500',
    description:
      'São ferramentas que trabalham automaticamente para você, executando tarefas repetitivas sem precisar de intervenção humana. Economizam tempo, reduzem erros e deixam sua equipe livre para trabalhos estratégicos.',
    benefits: [
      'Redução de trabalho manual em até 90%',
      'Eliminação de erros humanos',
      'Funciona 24/7 sem parar',
      'Economia de tempo e custos operacionais',
    ],
  },
  {
    category: 'Cloud & DevOps',
    skills: ['Vercel', 'Docker', 'Git', 'CI/CD'],
    icon: Globe,
    color: 'from-indigo-500 to-purple-500',
    description:
      'Cloud é hospedar seu sistema na nuvem, sem precisar de servidores físicos. DevOps automatiza o processo de colocar seu sistema no ar, garantindo que tudo funcione perfeitamente com backups e atualizações automáticas.',
    benefits: [
      'Escalabilidade conforme sua necessidade',
      'Custo-benefício melhor que servidores próprios',
      'Acesso global rápido',
      'Deploy automático e seguro',
    ],
  },
  {
    category: 'Ferramentas',
    skills: ['Framer Motion', 'i18n', 'SEO', 'Analytics'],
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    description:
      'São ferramentas especiais que tornam o site mais poderoso: animações suaves, suporte a múltiplos idiomas, otimização para Google e análise de comportamento dos visitantes.',
    benefits: [
      'Animações profissionais que impressionam',
      'Suporte a múltiplos idiomas',
      'Aparece no topo do Google',
      'Entenda o comportamento dos seus visitantes',
    ],
  },
];

export function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<SkillGroup | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedSkill) {
        setSelectedSkill(null);
      }
    };

    if (selectedSkill) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedSkill]);

  return (
    <>
      <section className="py-20 bg-lighter" id="stack">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text">
              Stack & Tecnologias
            </h2>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">
              Conjunto integrado de habilidades que trabalham em sinergia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillGroups.map((group, index) => {
              const Icon = group.icon;
              return (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-300 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => setSelectedSkill(group)}
                >
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`p-3 bg-gradient-to-br ${group.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900">{group.category}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 relative z-10">
                    {group.skills.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + skillIndex * 0.05 }}
                        className="px-3 py-1 rounded-full text-sm text-slate-700 border border-slate-200 bg-slate-50 font-medium hover:border-slate-300 hover:text-slate-900 transition-all cursor-default"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setSelectedSkill(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl z-10"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${selectedSkill.color} rounded-lg shadow-sm`}>
                    <selectedSkill.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedSkill.category}</h3>
                    <p className="text-slate-600 text-sm font-medium">Tecnologias que domina</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSkill(null)}
                  className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-bold mb-2 text-slate-900">O que é?</h4>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {selectedSkill.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-3 text-slate-900">Benefícios para o seu projeto:</h4>
                  <ul className="space-y-2">
                    {selectedSkill.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium">
                        <span className="text-primary font-bold mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-3 text-slate-900">Tecnologias nesta categoria:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-sm font-medium text-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-center text-slate-700 font-medium mb-4">
                    Pronto para usar essas tecnologias no seu projeto?
                  </p>
                  <a
                    href="#contact"
                    className="block w-full text-center py-3.5 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md"
                    onClick={() => setSelectedSkill(null)}
                  >
                    Entre em contato
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
