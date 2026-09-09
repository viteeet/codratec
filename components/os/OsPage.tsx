import type { ReactNode } from 'react';

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
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="os-page-header">
      <div className="os-page-header__text">
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
