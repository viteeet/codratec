'use client';

import {useEffect, useState, useRef} from 'react';
import {Code2, Users, Award, Zap} from 'lucide-react';
import {motion, useInView} from 'framer-motion';

const stats = [
  {icon: Code2, end: 25, suffix: '+', label: 'Projetos'},
  {icon: Users, end: 15, suffix: '+', label: 'Clientes'},
  {icon: Award, end: 5, suffix: '+', label: 'Anos de Experiência'},
  {icon: Zap, end: 100, suffix: '+', label: 'Soluções Entregues'},
];

export function Stats() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  const ref = useRef(null);
  const isInView = useInView(ref, {once: true, margin: '-100px'});

  useEffect(() => {
    if (!isInView) return;

    stats.forEach((stat, index) => {
      const duration = 2000; // 2 segundos
      const steps = 60;
      const increment = stat.end / steps;
      let current = 0;
      const stepDuration = duration / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.end) {
          current = stat.end;
          clearInterval(timer);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = Math.floor(current);
          return newCounts;
        });
      }, stepDuration);
    });
  }, [isInView]);

  return (
    <section className="py-20 bg-gradient-to-b from-lighter to-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8}}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{opacity: 0, y: 20}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true}}
                  transition={{duration: 0.5, delay: index * 0.1}}
                  className="text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/20 rounded-lg">
                      <Icon className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text mb-2">
                    {counts[index]}{stat.suffix}
                  </div>
                  <div className="text-slate-500 text-sm md:text-base">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

