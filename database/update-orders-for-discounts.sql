-- Actualizar la tabla orders para incluir información de descuentos
-- Este script actualiza la tabla orders existente para soportar códigos de descuento

-- 1. Añadir columnas para información de descuentos
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- 2. Actualizar registros existentes para que tengan subtotal_amount igual a total_amount
UPDATE orders 
SET subtotal_amount = total_amount,
    discount_amount = 0
WHERE subtotal_amount IS NULL;

-- 3. Hacer que subtotal_amount sea NOT NULL después de la actualización
ALTER TABLE orders 
ALTER COLUMN subtotal_amount SET NOT NULL;

-- 4. Añadir comentarios para documentar las columnas
COMMENT ON COLUMN orders.subtotal_amount IS 'Subtotal del pedido antes de aplicar descuentos';
COMMENT ON COLUMN orders.discount_code_id IS 'ID del código de descuento aplicado (si existe)';
COMMENT ON COLUMN orders.discount_amount IS 'Cantidad del descuento aplicado en euros';

-- 5. Crear índice para mejorar consultas por código de descuento
CREATE INDEX IF NOT EXISTS idx_orders_discount_code_id ON orders(discount_code_id);

-- 6. Actualizar la política RLS para incluir las nuevas columnas
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Permitir a los administradores ver todas las órdenes
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 8. Crear vista para estadísticas de códigos de descuento
CREATE OR REPLACE VIEW discount_code_stats AS
SELECT 
    dc.id,
    dc.code,
    dc.description,
    dc.discount_type,
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
         dc.is_active, dc.max_uses, dc.created_at;

-- 9. Permitir que los administradores vean las estadísticas
GRANT SELECT ON discount_code_stats TO authenticated;

-- Nota: Las vistas no soportan RLS directamente, pero la seguridad se maneja 
-- a través de las tablas subyacentes que ya tienen RLS aplicado

-- 10. Función para obtener estadísticas de códigos de descuento (solo admins)
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

-- 11. Función para obtener estadísticas de uso de códigos
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

-- Comentario final
-- Este script actualiza la base de datos para soportar completamente el sistema de códigos de descuento
-- Las órdenes existentes se mantienen intactas y se les asigna subtotal_amount = total_amount
