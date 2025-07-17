-- Script de corrección completo para códigos de descuento
-- Adaptado al esquema existente de la base de datos

-- 1. Eliminar TODAS las funciones existentes para evitar conflictos de tipos
DROP FUNCTION IF EXISTS register_discount_code_usage(uuid,uuid);
DROP FUNCTION IF EXISTS register_discount_code_usage(uuid,uuid,numeric);
DROP FUNCTION IF EXISTS validate_discount_code(text,numeric);
DROP FUNCTION IF EXISTS get_discount_code_stats();
DROP FUNCTION IF EXISTS get_discount_code_usage_stats(uuid);

-- 2. Crear función corregida que se adapte al esquema actual
CREATE OR REPLACE FUNCTION register_discount_code_usage(
    code_id UUID,
    order_id UUID DEFAULT NULL,
    discount_amount_applied NUMERIC DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_usage_count INTEGER;
    discount_record RECORD;
BEGIN
    -- Verificar que el usuario esté autenticado
    IF auth.uid() IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario no autenticado'
        );
    END IF;

    -- Obtener información del código de descuento
    SELECT id, code, is_single_use, is_active, max_uses, usage_count
    INTO discount_record
    FROM discount_codes 
    WHERE id = code_id;

    -- Verificar que el código existe y está activo
    IF discount_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Código de descuento no encontrado'
        );
    END IF;

    IF NOT discount_record.is_active THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Código de descuento no está activo'
        );
    END IF;

    -- Para códigos de un solo uso, verificar si ya se usó
    IF discount_record.is_single_use THEN
        SELECT COUNT(*) INTO existing_usage_count
        FROM discount_code_uses
        WHERE discount_code_id = code_id 
        AND user_id = auth.uid();

        IF existing_usage_count > 0 THEN
            RETURN json_build_object(
                'success', false,
                'message', 'Este código ya ha sido usado por el usuario'
            );
        END IF;
    END IF;

    -- Verificar límite máximo de usos
    IF discount_record.max_uses IS NOT NULL AND discount_record.usage_count >= discount_record.max_uses THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Este código ha alcanzado su límite de usos'
        );
    END IF;

    -- Registrar el uso (adaptado al esquema existente)
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

    -- Actualizar contador de usos en discount_codes
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

-- 3. Recrear función de validación (si no existe)
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
    user_usage_count INTEGER;
BEGIN
    -- Buscar el código de descuento
    SELECT id, code, discount_type, discount_value, is_active, is_single_use, max_uses, usage_count, valid_until
    INTO discount_record
    FROM discount_codes
    WHERE UPPER(code) = UPPER(code_input);

    -- Verificar si el código existe
    IF discount_record.id IS NULL THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Código de descuento no válido'
        );
    END IF;

    -- Verificar si está activo
    IF NOT discount_record.is_active THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Este código de descuento no está activo'
        );
    END IF;

    -- Verificar fecha de expiración
    IF discount_record.valid_until IS NOT NULL AND discount_record.valid_until < NOW() THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Este código de descuento ha expirado'
        );
    END IF;

    -- Verificar límite máximo de usos
    IF discount_record.max_uses IS NOT NULL AND discount_record.usage_count >= discount_record.max_uses THEN
        RETURN json_build_object(
            'valid', false,
            'message', 'Este código de descuento ha alcanzado su límite de usos'
        );
    END IF;

    -- Si es de un solo uso, verificar si el usuario ya lo ha usado
    IF discount_record.is_single_use AND auth.uid() IS NOT NULL THEN
        SELECT COUNT(*) INTO user_usage_count
        FROM discount_code_uses
        WHERE discount_code_id = discount_record.id 
        AND user_id = auth.uid();

        IF user_usage_count > 0 THEN
            RETURN json_build_object(
                'valid', false,
                'message', 'Ya has usado este código de descuento'
            );
        END IF;
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

-- 4. Función para estadísticas (adaptada al esquema)
CREATE OR REPLACE FUNCTION get_discount_code_stats()
RETURNS TABLE(
    id UUID,
    code TEXT,
    description TEXT,
    discount_type TEXT,
    discount_value NUMERIC,
    is_active BOOLEAN,
    max_uses INTEGER,
    usage_count INTEGER,
    created_at TIMESTAMPTZ,
    total_discount_given NUMERIC,
    unique_users BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario sea admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Acceso denegado: se requieren permisos de administrador';
    END IF;

    RETURN QUERY
    SELECT 
        dc.id,
        dc.code::TEXT,
        dc.description,
        dc.discount_type::TEXT,
        dc.discount_value,
        dc.is_active,
        dc.max_uses,
        dc.usage_count,
        dc.created_at,
        COALESCE(SUM(dcu.discount_amount), 0) as total_discount_given,
        COUNT(DISTINCT dcu.user_id) as unique_users
    FROM discount_codes dc
    LEFT JOIN discount_code_uses dcu ON dc.id = dcu.discount_code_id
    GROUP BY dc.id, dc.code, dc.description, dc.discount_type, dc.discount_value, 
             dc.is_active, dc.max_uses, dc.usage_count, dc.created_at
    ORDER BY dc.created_at DESC;
END;
$$;

-- 5. Función para estadísticas de un código específico
CREATE OR REPLACE FUNCTION get_discount_code_usage_stats(code_id UUID)
RETURNS TABLE(
    total_uses BIGINT,
    total_discount_amount NUMERIC,
    unique_users BIGINT,
    recent_uses BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario sea admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Acceso denegado: se requieren permisos de administrador';
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(dcu.id) as total_uses,
        COALESCE(SUM(dcu.discount_amount), 0) as total_discount_amount,
        COUNT(DISTINCT dcu.user_id) as unique_users,
        COUNT(CASE WHEN dcu.used_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_uses
    FROM discount_code_uses dcu
    WHERE dcu.discount_code_id = code_id;
END;
$$;

-- 6. Trigger para mantener actualizado el usage_count
CREATE OR REPLACE FUNCTION update_discount_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el contador cuando se inserta un nuevo uso
    UPDATE discount_codes 
    SET usage_count = (
        SELECT COUNT(*) 
        FROM discount_code_uses 
        WHERE discount_code_id = NEW.discount_code_id
    ),
    updated_at = NOW()
    WHERE id = NEW.discount_code_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_discount_usage_count ON discount_code_uses;
CREATE TRIGGER trigger_update_discount_usage_count
    AFTER INSERT ON discount_code_uses
    FOR EACH ROW
    EXECUTE FUNCTION update_discount_usage_count();

-- 7. Otorgar permisos
GRANT EXECUTE ON FUNCTION register_discount_code_usage(UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_discount_code(TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_discount_code_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_discount_code_usage_stats(UUID) TO authenticated;

-- 8. Comentarios
COMMENT ON FUNCTION register_discount_code_usage(UUID, UUID, NUMERIC) IS 'Registra el uso de un código de descuento con el monto descontado';
COMMENT ON FUNCTION validate_discount_code(TEXT, NUMERIC) IS 'Valida si un código de descuento es válido y puede ser aplicado';
COMMENT ON FUNCTION get_discount_code_stats() IS 'Obtiene estadísticas de todos los códigos de descuento (solo admins)';
COMMENT ON FUNCTION get_discount_code_usage_stats(UUID) IS 'Obtiene estadísticas de uso de un código específico (solo admins)';

-- 9. Datos de ejemplo (si no existen)
INSERT INTO discount_codes (code, description, discount_type, discount_value, is_single_use, max_uses, valid_until)
VALUES 
    ('BIENVENIDO10', 'Descuento de bienvenida del 10%', 'percentage', 10, false, null, null),
    ('PRIMERA20', 'Descuento del 20% para primeros usuarios', 'percentage', 20, true, 100, null),
    ('VERANO5', 'Descuento fijo de 5€', 'fixed', 5, false, null, '2025-08-31'),
    ('VERANO2025', 'Descuento de verano 2025', 'percentage', 15, false, 200, '2025-09-15')
ON CONFLICT (code) DO NOTHING;
