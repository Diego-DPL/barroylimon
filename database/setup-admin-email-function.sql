-- Función RPC para obtener emails de administradores
-- Ejecutar ANTES del script setup-admin-emails.sql

CREATE OR REPLACE FUNCTION get_admin_emails()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_emails TEXT[];
BEGIN
    SELECT ARRAY_AGG(u.email)
    INTO admin_emails
    FROM auth.users u
    JOIN profiles p ON u.id = p.id
    WHERE p.role = 'admin'
      AND u.email IS NOT NULL;
    
    RETURN COALESCE(admin_emails, ARRAY[]::TEXT[]);
END;
$$;

-- Permitir que el service role ejecute esta función
GRANT EXECUTE ON FUNCTION get_admin_emails() TO service_role;
