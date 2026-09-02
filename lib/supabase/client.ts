import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgxhuoaclkeegzkhfnun.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneGh1b2FjbGtlZWd6a2hmbnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTYwMDYsImV4cCI6MjEwMzkzMjAwNn0.yedf59yYMqYlmhq6X_VbkGf1FP28dPbYRNgcolAZCs4';

  return createBrowserClient<Database>(url, key);
}
