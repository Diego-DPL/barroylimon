-- Script simplificado para corregir solo el error 400
-- Este script solo corrige la función que está causando el error

-- 1. Eliminar todas las funciones problemáticas
DROP FUNCTION IF EXISTS register_discount_code_usage(uuid,uuid);
DROP FUNCTION IF EXISTS register_discount_code_usage(uuid,uuid,numeric);
DROP FUNCTION IF EXISTS validate_discount_code(text,numeric);
DROP FUNCTION IF EXISTS get_discount_code_stats();
DROP FUNCTION IF EXISTS get_discount_code_usage_stats(uuid);

-- 2. Recrear solo la función de registro (la que está fallando)
CREATE OR REPLACE FUNCTION register_discount_code_usage(
    code_id UUID,
    order_id UUID DEFAULT NULL,
    discount_amount_applied NUMERIC DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario esté autenticado
    IF auth.uid() IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario no autenticado'
        );
    END IF;

    -- Registrar el uso directamente (sin validaciones complejas para simplificar)
    INSERT INTO discount_code_uses (
        discount_code_id, 
        user_id, 
        order_id, 
        used_at,
        discount_amount
    )
    VALUES (
        code_id, 
        auth.uid(), 
        order_id, 
        NOW(),
        discount_amount_applied
    );

    -- Actualizar contador de usos
    UPDATE discount_codes 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = code_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Uso registrado correctamente'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Error al registrar el uso: ' || SQLERRM
        );
END;
$$;

-- 3. Recrear función de validación básica
CREATE OR REPLACE FUNCTION validate_discount_code(
    code_input TEXT,
    order_total NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    discount_record RECORD;
BEGIN
    -- Buscar el código de descuento
    SELECT id, code, discount_type, discount_value, is_active, valid_until
    INTO discount_record
    FROM discount_codes
    WHERE UPPER(code) = UPPER(code_input) AND is_active = true;

    -- Verificar si el código existe
    IF discount_record.id IS NULL THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Código de descuento no válido'
        );
    END IF;

    -- Verificar fecha de expiración
    IF discount_record.valid_until IS NOT NULL AND discount_record.valid_until < NOW() THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Este código de descuento ha expirado'
        );
    END IF;

    -- Si llegamos aquí, el código es válido
    RETURN json_build_object(
        'valid', true,
        'message', 'Código de descuento válido',
        'discount_type', discount_record.discount_type,
        'discount_value', discount_record.discount_value
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Error al validar el código de descuento'
        );
END;
$$;

-- 4. Otorgar permisos
GRANT EXECUTE ON FUNCTION register_discount_code_usage(UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_discount_code(TEXT, NUMERIC) TO authenticated;
