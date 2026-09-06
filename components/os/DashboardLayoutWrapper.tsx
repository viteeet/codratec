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
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      <Sidebar
        userRole={profile?.role || 'admin'}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header
          profile={profile}
          userEmail={userEmail}
          notifications={notifications}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main
          className={
            fullBleed
              ? 'flex-1 min-h-0 overflow-hidden'
              : 'flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
