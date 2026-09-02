import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgxhuoaclkeegzkhfnun.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneGh1b2FjbGtlZWd6a2hmbnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTYwMDYsImV4cCI6MjEwMzkzMjAwNn0.yedf59yYMqYlmhq6X_VbkGf1FP28dPbYRNgcolAZCs4';

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado a partir de Server Component - pode ignorar se não puder alterar cookies
          }
        },
      },
    }
  );
}
