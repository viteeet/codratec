'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types/database';
import { canAccessModule } from '@/lib/permissions';
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
      { name: 'Vendedores', href: '/vendedores', icon: UserCheck, module: 'vendedores' },
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

  const showLabels = !isCollapsed || mobileOpen;
  const collapsedDesktop = mounted && isCollapsed && !mobileOpen;

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
          className="os-sidebar-backdrop lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px]"
        />
      )}

      <aside
        className={`os-sidebar fixed lg:sticky top-0 left-0 z-50 flex h-screen flex-col border-r transition-[width,transform] duration-200 ease-out ${
          mobileOpen ? 'translate-x-0 w-[17.5rem]' : '-translate-x-full lg:translate-x-0'
        } ${collapsedDesktop ? 'lg:w-[4.5rem]' : 'lg:w-[17.5rem]'}`}
      >
        <div className="os-sidebar-brand flex h-16 items-center gap-3 border-b px-3.5">
          <div className="os-sidebar-logo relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border">
            <img src="/codratec-logo.png" alt="Codratec" className="h-full w-full object-cover" />
          </div>

          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="os-sidebar-brand-title truncate text-[13px] font-semibold tracking-tight">
                Codratec OS
              </p>
              <p className="os-sidebar-brand-sub truncate text-[10px] font-medium uppercase tracking-[0.14em]">
                Operação
              </p>
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

        <nav className="os-sidebar-nav flex-1 overflow-y-auto px-2.5 py-3">
          {groups.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex > 0 ? 'mt-4' : ''}>
              {showLabels ? (
                <p className="os-sidebar-group-label mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  {group.label}
                </p>
              ) : (
                <div className="os-sidebar-group-rule mx-auto mb-2 h-px w-6" aria-hidden />
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen?.(false)}
                        title={collapsedDesktop ? item.name : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        data-active={isActive ? 'true' : 'false'}
                        className={`os-sidebar-link group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium transition-colors ${
                          collapsedDesktop ? 'justify-center px-0' : ''
                        }`}
                      >
                        <span className="os-sidebar-active-rail" aria-hidden />
                        <Icon className="os-sidebar-link-icon h-[15px] w-[15px] shrink-0" />
                        {showLabels && <span className="truncate">{item.name}</span>}

                        {collapsedDesktop && (
                          <span className="os-sidebar-tooltip pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-sm px-2 py-1 text-[11px] font-semibold opacity-0 shadow-lg transition group-hover:opacity-100">
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

        <div className="os-sidebar-footer border-t p-2.5">
          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className="os-sidebar-collapse hidden w-full items-center justify-center gap-2 rounded-sm px-2.5 py-2 text-[12px] font-medium lg:flex"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
