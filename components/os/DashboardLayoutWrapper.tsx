'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/os/Sidebar';
import { Header } from '@/components/os/Header';
import { Profile } from '@/types/database';
import { usePathname } from 'next/navigation';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  profile?: Profile | null;
  userEmail?: string | null;
  notifications?: any[];
}

export function DashboardLayoutWrapper({
  children,
  profile,
  userEmail,
  notifications = [],
}: DashboardLayoutWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const fullBleed = pathname === '/leads' || pathname?.startsWith('/leads/');

  return (
    <div className="h-dvh max-w-[100vw] overflow-hidden bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      <Sidebar
        userRole={profile?.role || 'admin'}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 w-full">
        <Header
          profile={profile}
          userEmail={userEmail}
          notifications={notifications}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          compact={fullBleed}
        />
        <main
          className={
            fullBleed
              ? 'flex-1 min-h-0 min-w-0 overflow-hidden w-full'
              : 'flex-1 min-h-0 min-w-0 overflow-y-auto w-full p-3 sm:p-4'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
