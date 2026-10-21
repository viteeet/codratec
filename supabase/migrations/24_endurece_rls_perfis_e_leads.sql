-- ==============================================================================
-- MIGRAÇÃO 24: Fecha duas brechas de RLS achadas no code review (out/2026)
--
-- 1) profiles: a policy de UPDATE deixa cada usuário editar a própria linha inteira,
--    inclusive `role` e `active`. Um vendedor podia se promover a admin pelo
--    supabase-js no navegador (a anon key é pública). O trigger abaixo só deixa
--    admin (ou o service role / SQL Editor) mudar papel e status.
--
-- 2) leads: as policies antigas das migrations 10/11 não exigem perfil Codratec.
--    Como o projeto Supabase é compartilhado com o CRM FIDC, qualquer usuário de lá
--    lê e edita leads com `assigned_to IS NULL` (fila pública). A policy
--    "Equipe Codratec acessa leads" (migração 22) já cobre tudo para a equipe,
--    então as antigas saem sem mudar nada para quem usa o Codratec.
--
-- Rode no SQL Editor do Supabase.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.protege_papel_do_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Service role (convite pelo app) e SQL Editor não têm auth.uid().
  IF (SELECT auth.uid()) IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.active IS DISTINCT FROM OLD.active THEN
    RAISE EXCEPTION 'Só administradores podem mudar papel ou status de um colaborador.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protege_papel_do_perfil() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protege_papel_do_perfil ON public.profiles;
CREATE TRIGGER protege_papel_do_perfil
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protege_papel_do_perfil();

DROP POLICY IF EXISTS "Vendedores visualizam leads atribuidos ou sem dono" ON public.leads;
DROP POLICY IF EXISTS "Vendedores atualizam seus proprios leads" ON public.leads;
DROP POLICY IF EXISTS "Admins possuem acesso total aos leads" ON public.leads;
