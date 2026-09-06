-- ==============================================================================
-- CODRATEC OS - SETUP COMPLETO DO BANCO E USUÁRIO ADMINISTRADOR
-- Execute todo o conteúdo abaixo no SQL Editor do Supabase Dashboard
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendedor', 'dev');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'dev',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = 'admin', false);
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users or admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
    (SELECT auth.uid()) = id OR public.is_admin()
);

CREATE POLICY "Users or admins can update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
    (SELECT auth.uid()) = id OR public.is_admin()
)
WITH CHECK (
    (SELECT auth.uid()) = id OR public.is_admin()
);

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'victor.hg.pereira@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'victor.hg.pereira@gmail.com', crypt('Victor2247#', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Victor Pereira","role":"admin"}', now(), now()
    );

    INSERT INTO public.profiles (id, email, full_name, role, active)
    VALUES (new_user_id, 'victor.hg.pereira@gmail.com', 'Victor Pereira', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Victor Pereira';
  ELSE
    UPDATE public.profiles SET role = 'admin', full_name = 'Victor Pereira' WHERE email = 'victor.hg.pereira@gmail.com';
  END IF;
END $$;
