import { createClient } from '@/lib/supabase/server';
import { DashboardLayoutWrapper } from '@/components/os/DashboardLayoutWrapper';
import { getNotifications } from '@/actions/os';
import { Profile } from '@/types/database';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  const notifications = await getNotifications();

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      profile = data as Profile;
    } else {
      // Perfil de fallback com os dados reais da sessão do usuário
      profile = {
        id: user.id,
        email: user.email || 'victor.hg.pereira@gmail.com',
        full_name: user.user_metadata?.full_name || (user.email?.includes('victor') ? 'Victor Pereira' : user.email?.split('@')[0]),
        role: 'admin',
      };
    }
  }

  return (
    <DashboardLayoutWrapper profile={profile} userEmail={user?.email} notifications={notifications}>
      {children}
    </DashboardLayoutWrapper>
  );
}
