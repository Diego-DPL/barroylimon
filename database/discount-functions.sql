-- Script completo para funciones de códigos de descuento
-- Ejecuta este script después de crear las tablas de códigos de descuento

-- 1. Función para validar códigos de descuento
CREATE OR REPLACE FUNCTION validate_discount_code(
    code_input TEXT,
    order_total DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    discount_record RECORD;
    usage_count INTEGER;
    user_usage_count INTEGER;
    result JSON;
BEGIN
    -- Buscar el código de descuento
    SELECT id, code, discount_type, discount_value, is_active, is_single_use, max_uses, valid_until
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

    -- Contar uso total del código
    SELECT COUNT(*) INTO usage_count
    FROM discount_code_uses
    WHERE discount_code_id = discount_record.id;

    -- Verificar límite máximo de usos
    IF discount_record.max_uses IS NOT NULL AND usage_count >= discount_record.max_uses THEN
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

-- 2. Función para obtener estadísticas de códigos de descuento (solo admins)
CREATE OR REPLACE FUNCTION get_discount_code_stats()
RETURNS TABLE(
    id UUID,
    code TEXT,
    description TEXT,
    discount_type TEXT,
    discount_value DECIMAL,
    is_active BOOLEAN,
    max_uses INTEGER,
    created_at TIMESTAMPTZ,
    total_uses BIGINT,
    total_discount_given DECIMAL,
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
        dc.code,
        dc.description,
        dc.discount_type::TEXT,
        dc.discount_value,
        dc.is_active,
        dc.max_uses,
        dc.created_at,
        COUNT(dcu.id) as total_uses,
        COALESCE(SUM(o.discount_amount), 0) as total_discount_given,
        COUNT(DISTINCT dcu.user_id) as unique_users
    FROM discount_codes dc
    LEFT JOIN discount_code_uses dcu ON dc.id = dcu.discount_code_id
    LEFT JOIN orders o ON dc.id = o.discount_code_id AND o.status = 'completed'
    GROUP BY dc.id, dc.code, dc.description, dc.discount_type, dc.discount_value, 
             dc.is_active, dc.max_uses, dc.created_at
    ORDER BY dc.created_at DESC;
END;
$$;

-- 3. Función para obtener estadísticas de uso de un código específico
CREATE OR REPLACE FUNCTION get_discount_code_usage_stats(code_id UUID)
RETURNS TABLE(
    total_uses BIGINT,
    total_discount_amount DECIMAL,
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
        COALESCE(SUM(o.discount_amount), 0) as total_discount_amount,
        COUNT(DISTINCT dcu.user_id) as unique_users,
        COUNT(CASE WHEN dcu.used_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_uses
    FROM discount_code_uses dcu
    LEFT JOIN orders o ON dcu.order_id = o.id AND o.status = 'completed'
    WHERE dcu.discount_code_id = code_id;
END;
$$;

-- 4. Función para registrar el uso de un código de descuento
CREATE OR REPLACE FUNCTION register_discount_code_usage(
    code_id UUID,
    order_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_usage_count INTEGER;
BEGIN
    -- Verificar que el usuario esté autenticado
    IF auth.uid() IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario no autenticado'
        );
    END IF;

    -- Verificar que el código existe y está activo
    IF NOT EXISTS (
        SELECT 1 FROM discount_codes 
        WHERE id = code_id AND is_active = true
    ) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Código de descuento no válido o inactivo'
        );
    END IF;

    -- Para códigos de un solo uso, verificar si ya se usó
    SELECT COUNT(*) INTO existing_usage_count
    FROM discount_code_uses dcu
    JOIN discount_codes dc ON dcu.discount_code_id = dc.id
    WHERE dcu.discount_code_id = code_id 
    AND dcu.user_id = auth.uid()
    AND dc.is_single_use = true;

    IF existing_usage_count > 0 THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Este código ya ha sido usado por el usuario'
        );
    END IF;

    -- Registrar el uso
    INSERT INTO discount_code_uses (discount_code_id, user_id, order_id, used_at)
    VALUES (code_id, auth.uid(), order_id, NOW());

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

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION validate_discount_code(TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_discount_code_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_discount_code_usage_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION register_discount_code_usage(UUID, UUID) TO authenticated;

-- Comentarios
COMMENT ON FUNCTION validate_discount_code(TEXT, DECIMAL) IS 'Valida si un código de descuento es válido y puede ser aplicado';
COMMENT ON FUNCTION get_discount_code_stats() IS 'Obtiene estadísticas de todos los códigos de descuento (solo admins)';
COMMENT ON FUNCTION get_discount_code_usage_stats(UUID) IS 'Obtiene estadísticas de uso de un código específico (solo admins)';
COMMENT ON FUNCTION register_discount_code_usage(UUID, UUID) IS 'Registra el uso de un código de descuento por un usuario con validaciones';
