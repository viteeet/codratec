'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Rola até a seção quando a URL traz hash (ex.: /#contact vindo de /about). */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;

    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    scrollToHash();
    const t = window.setTimeout(scrollToHash, 100);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
