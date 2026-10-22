import { createClient } from '@/lib/supabase/server';
import { DashboardLayoutWrapper } from '@/components/os/DashboardLayoutWrapper';
import { getNotifications } from '@/actions/auth';
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
      // Sem linha em profiles o middleware já desloga; aqui só mostra a sessão, sem papel (sem acesso).
      profile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      };
    }
  }

  return (
    <DashboardLayoutWrapper profile={profile} userEmail={user?.email} notifications={notifications}>
      {children}
    </DashboardLayoutWrapper>
  );
}
