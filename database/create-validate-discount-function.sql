-- Función para validar códigos de descuento
-- Esta función valida si un código de descuento es válido y puede ser aplicado

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

    -- Verificar monto mínimo (opcional - por ahora no tenemos esta restricción)
    -- Aquí podrías añadir validaciones de monto mínimo si las necesitas

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

-- Permitir que usuarios autenticados usen esta función
GRANT EXECUTE ON FUNCTION validate_discount_code(TEXT, DECIMAL) TO authenticated;

-- Comentarios sobre la función
COMMENT ON FUNCTION validate_discount_code(TEXT, DECIMAL) IS 'Valida si un código de descuento es válido y puede ser aplicado por el usuario actual';
