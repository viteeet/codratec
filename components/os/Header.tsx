'use client';

import { logout } from '@/actions/auth';
import { Profile } from '@/types/database';
import { getRoleLabel } from '@/lib/permissions';
import { NotificationPopover } from '@/components/os/NotificationPopover';
import { ThemeToggle } from '@/components/os/ThemeToggle';
import { LogOut, Menu } from 'lucide-react';
import { useTransition } from 'react';

interface HeaderProps {
  profile?: Profile | null;
  userEmail?: string | null;
  notifications?: any[];
  onMobileMenuToggle?: () => void;
  compact?: boolean;
}

export function Header({
  profile,
  userEmail,
  notifications = [],
  onMobileMenuToggle,
  compact = false,
}: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const email = profile?.email || userEmail || 'victor.hg.pereira@gmail.com';
  let displayName = profile?.full_name;

  if (!displayName || displayName === 'Usuário Codratec') {
    if (email.includes('victor')) {
      displayName = 'Victor Pereira';
    } else {
      displayName = email.split('@')[0].replace('.', ' ').toUpperCase();
    }
  }

  const roleBadge = getRoleLabel(profile?.role || 'admin');
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header
      className={`print:hidden bg-slate-900 border-b border-slate-800/80 px-2 sm:px-6 flex items-center justify-between sticky top-0 z-30 ${
        compact ? 'h-11 lg:h-16 px-2 lg:px-6' : 'h-14 sm:h-16'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          title="Abrir Menu Lateral"
          className="lg:hidden inline-flex items-center justify-center min-w-11 min-h-11 text-slate-300 hover:text-white bg-slate-800/60 rounded-none border border-slate-700/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2
          className={`font-semibold text-slate-200 truncate ${
            compact ? 'text-sm lg:text-sm' : 'text-xs sm:text-sm'
          }`}
        >
          {compact ? 'Leads' : 'Operação Codratec'}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <div className={compact ? 'hidden lg:contents' : 'hidden sm:contents'}>
          <ThemeToggle />
          <NotificationPopover initialNotifications={notifications} />
        </div>
        <div className="h-4 w-px bg-slate-800 hidden sm:block" />
        <div className={`items-center gap-2 ${compact ? 'hidden lg:flex' : 'hidden sm:flex'}`}>
          <div className="w-8 h-8 rounded-none bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{displayName}</p>
            <p className="text-[10px] font-medium text-blue-400 leading-tight mt-0.5">{roleBadge}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          title="Sair do sistema"
          className="inline-flex items-center justify-center min-w-11 min-h-11 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-none transition gap-1.5 text-xs font-medium border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
