import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type ShellProps = {
  children: ReactNode;
  className?: string;
};

export function OsPage({ children, className = '' }: ShellProps) {
  return <div className={`os-page ${className}`.trim()}>{children}</div>;
}

export function OsPageHeader({
  title,
  description,
  back,
  stacked = false,
  children,
}: {
  title: string;
  description?: string;
  /** Link de volta para a lista (fichas de detalhe), mostrado acima do título. */
  back?: { href: string; label: string };
  /** Muitas ações: no celular elas descem para uma linha própria, que rola para o lado. */
  stacked?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={`os-page-header${stacked ? ' os-page-header--stacked' : ''}`}>
      <div className="os-page-header__text">
        {back ? (
          <Link href={back.href} className="os-page-header__back">
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
            {back.label}
          </Link>
        ) : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {children ? <div className="os-page-header__actions">{children}</div> : null}
    </header>
  );
}

export function OsPageToolbar({ children, className = '' }: ShellProps) {
  return <div className={`os-page-toolbar ${className}`.trim()}>{children}</div>;
}

export function OsPageCount({ children }: { children: ReactNode }) {
  return <p className="os-page-count">{children}</p>;
}

export function OsPageBanner({ children }: { children: ReactNode }) {
  return <div className="os-page-banner">{children}</div>;
}

export function OsPageLoading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <OsPage>
      <div className="cnpja-card py-10 text-center text-sm text-slate-400">{label}</div>
    </OsPage>
  );
}
