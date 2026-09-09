import type { ReactNode } from 'react';

/** Isola o site público do tema dark/light do OS. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return <div className="marketing-shell">{children}</div>;
}
