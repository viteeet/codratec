'use client';

import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  userRole?: UserRole;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { name: 'Leads', href: '/leads', icon: Users, module: 'leads' },
  { name: 'Vendedores', href: '/vendedores', icon: UserCheck, module: 'vendedores' },
  { name: 'Clientes', href: '/clientes', icon: Building2, module: 'clientes' },
  { name: 'Orçamentos', href: '/orcamentos', icon: FileText, module: 'orcamentos' },
  { name: 'Projetos', href: '/projetos', icon: FolderKanban, module: 'projetos' },
  { name: 'Demandas', href: '/demandas', icon: CheckSquare, module: 'demandas' },
  { name: 'Equipe', href: '/equipe', icon: UserCog, module: 'equipe' },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign, module: 'financeiro' },
  { name: 'Configurações', href: '/configuracoes', icon: Settings, module: 'configuracoes' },
];

export function Sidebar({ userRole = 'admin', mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Carregar e persistir a preferência de recolher/expandir no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('codratec_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('codratec_sidebar_collapsed', String(nextState));
  };

  const filteredItems = MENU_ITEMS.filter((item) => canAccessModule(item.module, userRole));

  return (
    <>
      {/* Backdrop para Dispositivos Móveis */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-opacity"
        />
      )}

      {/* Sidebar Principal (Responsiva Mobile + Recolhível no Desktop) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800/80 flex flex-col transition-all duration-300 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Header da Sidebar */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-950 border border-blue-500/30 flex items-center justify-center shrink-0">
              <img
                src="/codratec-logo.png"
                alt="Codratec Logo"
                className="w-full h-full object-cover"
              />
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="truncate">
                <h1 className="font-bold text-white tracking-tight leading-none text-sm">Codratec OS</h1>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Painel Operacional</p>
              </div>
            )}
          </div>

          {/* Botão Fechar no Mobile */}
          {mobileOpen && setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                } ${isCollapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />

                {(!isCollapsed || mobileOpen) && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Tooltip flutuante quando recolhido no Desktop */}
                {isCollapsed && !mobileOpen && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer com Botão Recolher/Expandir */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          {(!isCollapsed || mobileOpen) && (
            <div className="bg-slate-950/60 rounded-md p-2 border border-slate-800/50 text-[11px] text-slate-400 truncate max-w-[170px]">
              <p className="font-semibold text-slate-300">Codratec OS v1.1</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Operação Ativa</p>
            </div>
          )}

          {/* Botão de Toggle Recolher / Expandir no Desktop */}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            className="hidden lg:flex p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition mx-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
