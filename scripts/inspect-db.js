const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pgxhuoaclkeegzkhfnun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneGh1b2FjbGtlZWd6a2hmbnVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM1NjAwNiwiZXhwIjoyMTAzOTMyMDA2fQ.4k-H1dPHOgoo6bh4OusOh8Yt0abln_9_Um7i3ADZnSQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('Testando query na tabela public.profiles...');
  const { data, error } = await supabase.from('profiles').select('*');

  if (error) {
    console.error('Erro ao acessar public.profiles:', error);
  } else {
    console.log('Tabela public.profiles acessada com sucesso!');
    console.log('Registros:', data);
  }
}

main();
