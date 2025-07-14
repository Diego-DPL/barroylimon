-- Script para verificar columnas y crear función básica
-- Ejecuta esto paso a paso

-- 1. Verificar qué columnas existen en profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 2. Crear función is_admin si no existe
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

-- 3. Función corregida basada en el esquema real
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
    COALESCE(p.role, 'customer'::user_role) as role,
    p.created_at,
    CASE 
      WHEN ns.email IS NOT NULL AND ns.unsubscribed_at IS NULL THEN true
      ELSE false
    END as newsletter_subscribed
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  LEFT JOIN newsletter_subscribers ns ON p.id = ns.user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asignar rol de admin a tu usuario (REEMPLAZA el email)
-- UPDATE profiles SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');
