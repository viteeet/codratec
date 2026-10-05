'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { canHandleHandoffs, getDbClient, loadAuthProfile } from '@/lib/server/actions-helpers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Por favor, preencha email e senha.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciais inválidas. Verifique seu email e senha.' };
  }

  const raw = String(formData.get('redirectTo') || '/dashboard');
  const redirectTo =
    raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : '/dashboard';
  redirect(redirectTo);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getAuthProfile() {
  return loadAuthProfile();
}

export async function getNotifications() {
  const supabase = getDbClient();
  const notifications: any[] = [];

  // 1. Calls comercial agendadas
  const { data: calls } = await supabase
    .from('leads')
    .select('id, name, scheduled_call_at')
    .not('scheduled_call_at', 'is', null)
    .order('scheduled_call_at', { ascending: true })
    .limit(4);

  if (calls) {
    calls.forEach((c: any) => {
      notifications.push({
        id: `call-${c.id}`,
        title: '📞 Reunião Comercial Agendada',
        message: `Call com ${c.name} agendada para ${new Date(c.scheduled_call_at).toLocaleDateString('pt-BR')}`,
        type: 'call',
        link: '/leads',
        date: c.scheduled_call_at,
      });
    });
  }

  // 2. Orçamentos enviados aguardando resposta
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, title, total_amount')
    .eq('status', 'ENVIADO')
    .limit(3);

  if (quotes) {
    quotes.forEach((q: any) => {
      notifications.push({
        id: `quote-${q.id}`,
        title: '📄 Orçamento Aguardando Cliente',
        message: `${q.title} (R$ ${Number(q.total_amount || 0).toLocaleString('pt-BR')}) enviado`,
        type: 'quote',
        link: '/orcamentos',
        date: new Date().toISOString(),
      });
    });
  }

  // 3. Leads novos sem consultor atribuído
  const { data: newLeads } = await supabase
    .from('leads')
    .select('id, name')
    .eq('status', 'NOVO')
    .is('assigned_to', null)
    .limit(3);

  if (newLeads) {
    newLeads.forEach((l: any) => {
      notifications.push({
        id: `lead-${l.id}`,
        title: '🎯 Novo Lead na Fila Pública',
        message: `${l.name} aguardando atendimento comercial`,
        type: 'lead',
        link: '/leads',
        date: new Date().toISOString(),
      });
    });
  }

  // 4. Leads enviados pelo comercial para proposta (só quem faz orçamento)
  const profile = await getAuthProfile();
  if (profile && canHandleHandoffs(profile.role)) {
    const { data: handoffs } = await supabase
      .from('lead_handoffs')
      .select('id, created_at, temperature, lead:leads(name, company)')
      .eq('status', 'ENVIADO')
      .order('created_at', { ascending: true })
      .limit(5);

    (handoffs || []).forEach((h: any) => {
      const who = h.lead?.company || h.lead?.name || 'Lead';
      notifications.unshift({
        id: `handoff-${h.id}`,
        title: h.temperature === 'QUENTE' ? '🔥 Lead quente para proposta' : '📝 Lead enviado para proposta',
        message: `${who} aguardando orçamento`,
        type: 'handoff',
        link: '/orcamentos?aba=propostas',
        date: h.created_at,
      });
    });
  }

  return notifications;
}
