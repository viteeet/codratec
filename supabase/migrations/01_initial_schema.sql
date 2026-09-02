-- ==============================================================================
-- CODRATEC OS - MIGRATION INICIAL E SETUP DO USUÁRIO ADMINISTRADOR (FASE 1)
-- Copie e cole todo este arquivo no SQL Editor do Supabase Dashboard e clique em RUN
-- ==============================================================================

-- 1. Ativa extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Cria o tipo ENUM para cargos no sistema
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendedor', 'dev');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Cria a tabela de Perfis de Usuário
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

-- 4. Habilita Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users or admins can update profiles" ON public.profiles;

-- RLS Policy: SELECT
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) = id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
);

-- RLS Policy: UPDATE
CREATE POLICY "Users or admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    (SELECT auth.uid()) = id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
)
WITH CHECK (
    (SELECT auth.uid()) = id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
);

-- 5. Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'dev'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 6. CRIAÇÃO AUTOMÁTICA DO USUÁRIO ADMINISTRADOR (Victor Pereira)
-- ==============================================================================
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'victor.hg.pereira@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'victor.hg.pereira@gmail.com',
      crypt('Victor2247#', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Victor Pereira","role":"admin"}',
      now(),
      now()
    );

    INSERT INTO public.profiles (id, email, full_name, role, active)
    VALUES (
      new_user_id,
      'victor.hg.pereira@gmail.com',
      'Victor Pereira',
      'admin',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', full_name = 'Victor Pereira';

    RAISE NOTICE 'Tabela profiles criada e usuário Administrador victor.hg.pereira@gmail.com cadastrado com sucesso!';
  ELSE
    UPDATE public.profiles
    SET role = 'admin', full_name = 'Victor Pereira'
    WHERE email = 'victor.hg.pereira@gmail.com';

    RAISE NOTICE 'Tabela profiles verificada e usuário promovido a Administrador com sucesso!';
  END IF;
END $$;
