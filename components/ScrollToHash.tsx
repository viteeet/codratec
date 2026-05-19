'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Rola até a seção quando a URL traz hash (ex.: /#contact vindo de /about). */
export function ScrollToHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const id = hash.replace('#', '');
    if (!id) return;

    const scrollToTarget = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    scrollToTarget();
    const t = window.setTimeout(scrollToTarget, 150);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);

  return null;
}
