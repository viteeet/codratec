'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types/database';
import { canAccessModule } from '@/lib/permissions';
import { CodratecLogo } from '@/components/CodratecLogo';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  FileText,
  FolderKanban,
  CheckSquare,
  UserCog,
  DollarSign,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  userRole?: UserRole;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

type MenuItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  module: string;
};

type MenuGroup = {
  id: string;
  label: string;
  items: MenuItem[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'overview',
    label: 'Visão geral',
    items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' }],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    items: [
      { name: 'Leads', href: '/leads', icon: Users, module: 'leads' },
      { name: 'Consultores', href: '/vendedores', icon: UserCheck, module: 'vendedores' },
      { name: 'Clientes', href: '/clientes', icon: Building2, module: 'clientes' },
      { name: 'Orçamentos', href: '/orcamentos', icon: FileText, module: 'orcamentos' },
    ],
  },
  {
    id: 'operacao',
    label: 'Operação',
    items: [
      { name: 'Projetos', href: '/projetos', icon: FolderKanban, module: 'projetos' },
      { name: 'Demandas', href: '/demandas', icon: CheckSquare, module: 'demandas' },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    items: [
      { name: 'Equipe', href: '/equipe', icon: UserCog, module: 'equipe' },
      { name: 'Financeiro', href: '/financeiro', icon: DollarSign, module: 'financeiro' },
      { name: 'Configurações', href: '/configuracoes', icon: Settings, module: 'configuracoes' },
    ],
  },
];

export function Sidebar({ userRole = 'admin', mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('codratec_sidebar_collapsed');
    if (saved !== null) setIsCollapsed(saved === 'true');
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('codratec_sidebar_collapsed', String(next));
  };

  /** No desktop, só recolhe após montar (evita flash). Mobile aberto sempre expandido. */
  const collapsed = mounted && isCollapsed && !mobileOpen;
  const showLabels = !collapsed;

  const groups = MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessModule(item.module, userRole)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen?.(false)}
          className="os-sidebar-backdrop lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px] print:hidden"
        />
      )}

      <aside
        data-collapsed={collapsed ? 'true' : 'false'}
        className={`os-sidebar print:hidden fixed lg:sticky top-0 left-0 z-50 flex h-dvh flex-col border-r transition-[width,transform] duration-200 ease-out pt-[env(safe-area-inset-top,0px)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="os-sidebar-brand">
          {collapsed ? (
            <CodratecLogo variant="mark" className="os-sidebar-logo-svg" />
          ) : (
            <div className="os-sidebar-brand-text">
              <CodratecLogo variant="wordmark" className="os-sidebar-wordmark" />
              <p className="os-sidebar-brand-sub">Operação</p>
            </div>
          )}

          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen?.(false)}
              className="os-sidebar-icon-btn lg:hidden"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="os-sidebar-nav">
          {groups.map((group) => (
            <div key={group.id} className="os-sidebar-group">
              {showLabels ? (
                <p className="os-sidebar-group-label">{group.label}</p>
              ) : (
                <div className="os-sidebar-group-rule" aria-hidden />
              )}

              <ul className="os-sidebar-list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen?.(false)}
                        title={item.name}
                        aria-current={isActive ? 'page' : undefined}
                        data-active={isActive ? 'true' : 'false'}
                        className="os-sidebar-link"
                      >
                        <Icon className="os-sidebar-link-icon" aria-hidden />
                        {showLabels && <span className="os-sidebar-link-label">{item.name}</span>}
                        {collapsed && (
                          <span className="os-sidebar-tooltip" role="tooltip">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="os-sidebar-footer">
          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className="os-sidebar-collapse"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
