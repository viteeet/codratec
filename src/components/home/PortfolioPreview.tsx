import { ExternalLink } from 'lucide-react';

import { portfolioItems } from '@/src/data/portfolio';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export function PortfolioPreview() {
  return (
    <section className="py-16 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-40 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-x-1/2" />
      <div className="absolute bottom-40 right-0 w-1/4 h-1/4 bg-secondary/5 blur-[100px] rounded-full translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-100">Portfólio</h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Alguns projetos externos que valem a visita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
            >
              <Card className="h-full transition-colors duration-200 group-hover:border-slate-700/80">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-sm bg-slate-900 border border-slate-800/70 flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.iconSrc}
                        alt={`Logo ${item.title}`}
                        className="w-10 h-10 object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2">
                        <span className="truncate">{item.title}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
                      </CardTitle>
                      <CardDescription className="mt-2">{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">Acessar:</span>{' '}
                    <span className="text-slate-200 break-all">{item.href}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <span className="text-sm font-semibold text-primary group-hover:text-secondary transition-colors">
                    Abrir em nova aba
                  </span>
                </CardFooter>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

