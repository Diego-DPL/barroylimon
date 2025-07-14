-- Script simplificado para gestión de usuarios con emails
-- Solo ejecutar si no tienes ya el sistema de roles configurado

-- 1. Agregar columna role a profiles (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Crear enum solo si no existe
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('customer', 'admin', 'moderator');
        END IF;
        
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'customer';
    END IF;
END $$;

-- 2. Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función para obtener usuarios con emails (NUEVA)
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role user_role,
  created_at timestamp with time zone,
  newsletter_subscribed boolean
) AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email::text,
    p.full_name,
    p.role,
    p.created_at,
    p.newsletter_subscribed
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Asignar rol de admin a tu usuario (REEMPLAZA el email)
-- UPDATE profiles SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');
