'use client';

import { logout } from '@/actions/auth';
import { Profile } from '@/types/database';
import { getRoleLabel } from '@/lib/permissions';
import { getOsPageTitle } from '@/lib/os/page-title';
import { NotificationPopover } from '@/components/os/NotificationPopover';
import { ThemeToggle } from '@/components/os/ThemeToggle';
import { LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const pageTitle = getOsPageTitle(pathname);
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
    <header className={`os-header print:hidden${compact ? ' is-compact' : ''}`}>
      <div className="os-header-left">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          title="Abrir menu lateral"
          className="os-icon-btn lg:hidden"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" aria-hidden />
        </button>

        <h2 className="os-header-title">{pageTitle}</h2>
      </div>

      <div className="os-header-right">
        <ThemeToggle />
        <NotificationPopover initialNotifications={notifications} />
        <div className="os-header-rule" aria-hidden />
        <div className={`os-header-user ${compact ? 'hidden lg:flex' : 'hidden sm:flex'}`}>
          <div className="os-header-avatar" aria-hidden>
            {initials}
          </div>
          <div className="os-header-user-copy">
            <p className="os-header-user-name">{displayName}</p>
            <p className="os-header-user-role">{roleBadge}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          title="Sair do sistema"
          className="os-icon-btn os-icon-btn--danger"
          aria-label="Sair do sistema"
        >
          <LogOut className="w-4 h-4" aria-hidden />
          <span className="os-header-logout-label">Sair</span>
        </button>
      </div>
    </header>
  );
}
