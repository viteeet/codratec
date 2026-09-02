-- ==============================================================================
-- MIGRAÇÃO 08: GARANTIR PERFIL E NOME REAL DO ADMINISTRADOR (VICTOR PEREIRA)
-- ==============================================================================

-- Atualizar o perfil do administrador principal caso já exista na tabela profiles
UPDATE public.profiles
SET full_name = 'Victor Pereira',
    role = 'admin',
    updated_at = now()
WHERE email = 'victor.hg.pereira@gmail.com';

-- Inserir perfil se não existir
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Victor Pereira', 'admin'::public.user_role
FROM auth.users
WHERE email = 'victor.hg.pereira@gmail.com'
ON CONFLICT (id) DO UPDATE
SET full_name = 'Victor Pereira',
    role = 'admin'::public.user_role;
