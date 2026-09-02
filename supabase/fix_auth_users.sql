-- ==============================================================================
-- SCRIPT DE CORREÇÃO DO SUPABASE AUTH E TABELA PROFILES
-- Execute todo este conteúdo no SQL Editor do Supabase Dashboard
-- ==============================================================================

-- 1. Remove registros antigos com erro de integridade do auth
DELETE FROM auth.users WHERE email = 'victor.hg.pereira@gmail.com';

-- 2. Ativa extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Cria o tipo user_role
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendedor', 'dev');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Re-cria a tabela public.profiles se não existir
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

-- 5. Trigger de novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'admin'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin'::user_role;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
