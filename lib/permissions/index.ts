import { UserRole } from '@/types/database';

export const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ['admin', 'gerente', 'vendedor', 'dev'],
  leads: ['admin', 'gerente', 'vendedor'],
  vendedores: ['admin', 'gerente', 'vendedor'],
  clientes: ['admin', 'gerente', 'vendedor'],
  orcamentos: ['admin', 'gerente'],
  projetos: ['admin', 'gerente', 'dev', 'vendedor'],
  demandas: ['admin', 'gerente', 'dev'],
  equipe: ['admin'],
  financeiro: ['admin'],
  configuracoes: ['admin'],
};

export function isAdmin(role?: UserRole | null): boolean {
  return !role || role === 'admin';
}

export function isGerente(role?: UserRole | null): boolean {
  return role === 'gerente';
}

export function isVendedor(role?: UserRole | null): boolean {
  return role === 'vendedor';
}

export function isDev(role?: UserRole | null): boolean {
  return role === 'dev';
}

export function canAccessModule(moduleName: string, role?: UserRole | null): boolean {
  if (!role || role === 'admin') return true;
  const allowedRoles = MODULE_PERMISSIONS[moduleName];
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}

export function canCreateQuote(role?: UserRole | null): boolean {
  return !role || role === 'admin' || role === 'gerente';
}

export function getRoleLabel(role?: UserRole | null): string {
  switch (role) {
    case 'admin':
      return 'Administrador (Dono)';
    case 'gerente':
      return 'Gerente Comercial / Operacional';
    case 'vendedor':
      return 'Consultor Comercial';
    case 'dev':
      return 'Desenvolvedor / Técnico';
    default:
      return 'Administrador (Dono)';
  }
}
