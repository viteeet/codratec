const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pgxhuoaclkeegzkhfnun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneGh1b2FjbGtlZWd6a2hmbnVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM1NjAwNiwiZXhwIjoyMTAzOTMyMDA2fQ.4k-H1dPHOgoo6bh4OusOh8Yt0abln_9_Um7i3ADZnSQ';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('Testando conexão com Supabase e criação de usuário...');

  const email = 'victor.hg.pereira@gmail.com';
  const password = 'Victor2247#';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Victor Pereira', role: 'admin' },
  });

  if (error) {
    console.error('ERRO DETALHADO DO SUPABASE AUTH:', error);
  } else {
    console.log('✅ USUÁRIO CRIADO COM SUCESSO VIA ADMIN API!');
    console.log('User Data:', data.user);
  }
}

main();
