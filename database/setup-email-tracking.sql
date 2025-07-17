-- Añadir columnas para tracking de envío de emails
-- Ejecutar en Supabase SQL Editor

-- Añadir columnas para control de envío de emails
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Crear índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_email_sent ON orders(email_sent, email_sent_at);

-- Comentarios sobre las nuevas columnas
COMMENT ON COLUMN orders.email_sent IS 'Indica si se envió el email de confirmación';
COMMENT ON COLUMN orders.email_sent_at IS 'Timestamp de cuando se envió el email de confirmación';

-- Función para marcar email como enviado
CREATE OR REPLACE FUNCTION mark_email_as_sent(order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE orders 
    SET email_sent = TRUE,
        email_sent_at = NOW()
    WHERE id = order_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION mark_email_as_sent(UUID) TO service_role;

-- Verificar que las columnas se añadieron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('email_sent', 'email_sent_at');
