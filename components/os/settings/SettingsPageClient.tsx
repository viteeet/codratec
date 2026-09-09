'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Users,
  Shield,
  Settings2,
  ExternalLink,
} from 'lucide-react';
import { OsPage, OsPageHeader } from '@/components/os/OsPage';
import { EmailTemplatesPanel } from '@/components/os/settings/EmailTemplatesPanel';
import { CompanySettingsPanel } from '@/components/os/settings/CompanySettingsPanel';
import { TeamMembersPanel } from '@/components/os/TeamMembersPanel';
import type { CompanySettingsRow, EmailTemplateRow } from '@/actions/os';

type SectionId = 'email' | 'equipe' | 'seguranca' | 'geral';

const SECTIONS: {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof Mail;
}[] = [
  {
    id: 'email',
    label: 'E-mail comercial',
    description: 'Modelos e tags',
    icon: Mail,
  },
  {
    id: 'equipe',
    label: 'Equipe & acessos',
    description: 'Convites e papéis',
    icon: Users,
  },
  {
    id: 'seguranca',
    label: 'Segurança',
    description: 'RLS e permissões',
    icon: Shield,
  },
  {
    id: 'geral',
    label: 'Geral',
    description: 'Parâmetros do OS',
    icon: Settings2,
  },
];

type Props = {
  templates: EmailTemplateRow[];
  canSendEmail: boolean;
  company: CompanySettingsRow;
  members: any[];
};

export function SettingsPageClient({ templates, canSendEmail, company, members }: Props) {
  const [section, setSection] = useState<SectionId>('email');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as SectionId;
    if (SECTIONS.some((s) => s.id === hash)) setSection(hash);
  }, []);

  const go = (id: SectionId) => {
    setSection(id);
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <OsPage className="h-full">
      <OsPageHeader
        title="Configurações"
        description="Modelos de e-mail, equipe e segurança do Codratec OS."
      />

      <div className="flex-1 min-h-0 min-w-0 grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-3">
        <nav className="os-settings-nav border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col min-h-0 min-w-0">
          <p className="shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 hidden lg:block">
            Seções
          </p>
          <ul>
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    className={`w-full flex items-center lg:items-start gap-2.5 px-2.5 py-2 text-left transition ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold">{item.label}</span>
                      <span className={`os-settings-nav__desc text-[10px] mt-0.5 ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="min-w-0 min-h-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
          {section === 'email' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">E-mail comercial</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Disparo via Brevo ·{' '}
                    <a
                      href="https://codratec.com.br"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      codratec.com.br <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span
                    className={`px-2 py-1 border font-semibold ${
                      canSendEmail
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
                        : 'border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                    }`}
                  >
                    Brevo: {canSendEmail ? 'liberado' : 'conta autorizada'}
                  </span>
                  <Link
                    href="/leads"
                    className="px-2 py-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    Ir para Leads
                  </Link>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <EmailTemplatesPanel templates={templates} company={company} />
              </div>
            </div>
          )}

          {section === 'equipe' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Equipe & acessos</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Edite nome, papel e status. Convites de login continuam pelo Supabase Auth.
                </p>
              </div>
              <TeamMembersPanel members={members} />
            </div>
          )}

          {section === 'seguranca' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Segurança</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Políticas aplicadas no Supabase (Row Level Security).
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">RLS</p>
                  <p className="text-[11px] text-slate-500">Ativo nas tabelas do OS</p>
                  <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-1 mt-2">
                    Status: ativo
                  </p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Modelos de e-mail</p>
                  <p className="text-[11px] text-slate-500">Leitura: autenticados · Escrita: admin</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Envio Brevo</p>
                  <p className="text-[11px] text-slate-500">Restrito à conta autorizada (admin).</p>
                </div>
              </div>
            </div>
          )}

          {section === 'geral' && <CompanySettingsPanel settings={company} />}
        </section>
      </div>
    </OsPage>
  );
}
