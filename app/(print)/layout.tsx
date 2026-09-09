import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressão',
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="a4-print-app">{children}</div>;
}
