-- Script para corregir la función de registro de uso de códigos de descuento
-- Ejecuta esto para solucionar el error 400 en discount_code_uses

-- Función corregida para registrar el uso de un código de descuento
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
GRANT EXECUTE ON FUNCTION register_discount_code_usage(UUID, UUID) TO authenticated;

-- Comentario
COMMENT ON FUNCTION register_discount_code_usage(UUID, UUID) IS 'Registra el uso de un código de descuento por un usuario con validaciones';
