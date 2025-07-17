-- Script de verificación del sistema de códigos de descuento
-- Ejecuta este script DESPUÉS de aplicar fix-discount-system-complete.sql

-- 1. Verificar que las tablas existen y tienen las columnas correctas
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('discount_codes', 'discount_code_uses', 'orders')
    AND column_name LIKE '%discount%'
ORDER BY table_name, ordinal_position;

-- 2. Verificar que las funciones existen
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'validate_discount_code', 
        'register_discount_code_usage',
        'get_discount_code_stats'
    );

-- 3. Verificar códigos de descuento disponibles
SELECT 
    code,
    description,
    discount_type,
    discount_value,
    is_active,
    usage_count,
    max_uses,
    valid_until
FROM discount_codes
ORDER BY created_at DESC;

-- 4. Probar función de validación
SELECT validate_discount_code('BIENVENIDO10', 100.00) AS validation_test;

-- 5. Verificar permisos de las funciones
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    array_to_string(p.proacl, ', ') as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname IN (
        'validate_discount_code', 
        'register_discount_code_usage',
        'get_discount_code_stats'
    );

-- 6. Verificar que el trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name = 'trigger_update_discount_usage_count';

-- 7. Estadísticas actuales (solo si eres admin)
-- SELECT * FROM get_discount_code_stats();

COMMENT ON SCHEMA public IS 'Verificación completada. Si todos los queries anteriores devuelven resultados sin errores, el sistema está funcionando correctamente.';
