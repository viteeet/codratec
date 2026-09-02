-- ==============================================================================
-- TRIGGER FAIL-SAFE PARA CRIAÇÃO DE USUÁRIOS NO SUPABASE AUTH
-- Executar no SQL Editor do Supabase Dashboard
-- ==============================================================================

-- 1. Remove triggers antigas que possam estar travando o auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Função ultra segura que NUNCA trava o cadastro em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_val public.user_role := 'admin'::public.user_role;
    name_val text;
BEGIN
    -- Extrai o nome
    IF new.raw_user_meta_data IS NOT NULL AND new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        name_val := new.raw_user_meta_data->>'full_name';
    ELSE
        name_val := split_part(new.email, '@', 1);
    END IF;

    -- Extrai o cargo com fallback
    BEGIN
        IF new.raw_user_meta_data IS NOT NULL AND new.raw_user_meta_data->>'role' IS NOT NULL THEN
            role_val := (new.raw_user_meta_data->>'role')::public.user_role;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        role_val := 'admin'::public.user_role;
    END;

    -- Tenta inserir o perfil
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, role, active)
        VALUES (new.id, new.email, name_val, role_val, true)
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role;
    EXCEPTION WHEN OTHERS THEN
        -- Ignora erros secundários no perfil para NUNCA travar a criação em auth.users
        NULL;
    END;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-cria a trigger oficial
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
