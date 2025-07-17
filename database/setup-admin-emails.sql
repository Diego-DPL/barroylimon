-- Setup Admin Emails for Order Notifications
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuarios y roles existentes
SELECT 
    u.email, 
    p.role, 
    p.full_name,
    p.created_at 
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.created_at;

-- 2. Actualizar tu usuario principal como admin (reemplaza con tu email)
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'tu-email@ejemplo.com'  -- 🔴 CAMBIAR POR TU EMAIL REAL
);

-- 3. Agregar usuarios admin adicionales (opcional)
-- Si tienes otros emails que deben recibir notificaciones de pedidos

-- Para agregar más admins, primero deben registrarse en la app
-- y luego ejecutar:
-- UPDATE profiles SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'otro-admin@ejemplo.com');

-- 4. Verificar que los admins están configurados
SELECT 
    u.email, 
    p.role,
    p.full_name,
    p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- 5. Mensaje de confirmación
DO $$
DECLARE
    admin_count INTEGER;
    admin_email TEXT;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM profiles p
    WHERE p.role = 'admin';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  NO HAY ADMINISTRADORES CONFIGURADOS';
        RAISE NOTICE 'Actualiza tu email en la línea 15 de este script';
    ELSE
        RAISE NOTICE '✅ Configuración completa: % administrador(es) encontrado(s)', admin_count;
        RAISE NOTICE 'Los siguientes emails recibirán notificaciones de pedidos:';
        
        FOR admin_email IN 
            SELECT u.email 
            FROM profiles p
            JOIN auth.users u ON p.id = u.id
            WHERE p.role = 'admin'
        LOOP
            RAISE NOTICE '  - %', admin_email;
        END LOOP;
    END IF;
END $$;
