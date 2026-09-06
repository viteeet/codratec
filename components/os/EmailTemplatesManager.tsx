'use client';

import Link from 'next/link';
import { FileText, Settings } from 'lucide-react';

/** Atalho na titlebar de Leads → editor completo em Configurações. */
export function EmailTemplatesManager() {
  return (
    <Link
      href="/configuracoes#email"
      className="rl-btn"
      title="Editar modelos de e-mail em Configurações"
    >
      <FileText className="w-3 h-3 mr-1" /> Modelos
      <Settings className="w-3 h-3 ml-0.5 opacity-70" />
    </Link>
  );
}
