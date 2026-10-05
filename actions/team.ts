'use server';

import { revalidatePath } from 'next/cache';
import { UserRole } from '@/types/database';
import { assertIsAdmin, getDbClient, loadAuthProfile } from '@/lib/server/actions-helpers';
import type { TeamMember } from '@/types/rows';

export async function getTeamMembers() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar membros:', error);
  return (data || []) as TeamMember[];
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: 'Falha ao alterar perfil do colaborador.' };

  revalidatePath('/equipe');
  revalidatePath('/vendedores');
  revalidatePath('/configuracoes');
  return { success: true };
}

export async function updateTeamMember(input: {
  userId: string;
  full_name?: string;
  role?: UserRole;
  active?: boolean;
}) {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };
  if (!input.userId) return { error: 'Colaborador inválido.' };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input.full_name === 'string') payload.full_name = input.full_name.trim();
  if (input.role) payload.role = input.role;
  if (typeof input.active === 'boolean') payload.active = input.active;

  const supabase = getDbClient();
  const { error } = await supabase.from('profiles').update(payload).eq('id', input.userId);
  if (error) return { error: error.message || 'Falha ao atualizar colaborador.' };
  revalidatePath('/equipe');
  revalidatePath('/vendedores');
  revalidatePath('/configuracoes');
  return { success: true };
}

export async function inviteTeamMember(input: {
  email: string;
  full_name: string;
  role: UserRole;
}) {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };

  const email = input.email.trim().toLowerCase();
  const full_name = input.full_name.trim();
  const role = input.role || 'vendedor';
  if (!email || !email.includes('@') || !full_name) {
    return { error: 'Informe nome e e-mail válidos.' };
  }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();
  if (!admin) {
    return { error: 'Defina SUPABASE_SERVICE_ROLE_KEY para convidar colaboradores pelo app.' };
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
  });
  if (error || !data.user) return { error: error?.message || 'Falha ao convidar colaborador.' };

  await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name,
    role,
    active: true,
    updated_at: new Date().toISOString(),
  });

  revalidatePath('/equipe');
  revalidatePath('/configuracoes');
  revalidatePath('/vendedores');
  return { success: true };
}

export async function deleteTeamMember(userId: string) {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };
  const me = await loadAuthProfile();
  if (!userId) return { error: 'Colaborador inválido.' };
  if (me?.id === userId) return { error: 'Você não pode excluir a própria conta.' };

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { error: error.message || 'Falha ao excluir colaborador.' };
  } else {
    const supabase = getDbClient();
    const { error } = await supabase
      .from('profiles')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) return { error: error.message || 'Falha ao desativar colaborador.' };
  }

  revalidatePath('/equipe');
  revalidatePath('/configuracoes');
  revalidatePath('/vendedores');
  return { success: true };
}
