-- Agregar campos de dirección y contacto a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_first_name text,
ADD COLUMN IF NOT EXISTS shipping_last_name text,
ADD COLUMN IF NOT EXISTS shipping_address_line_1 text,
ADD COLUMN IF NOT EXISTS shipping_address_line_2 text,
ADD COLUMN IF NOT EXISTS shipping_city text,
ADD COLUMN IF NOT EXISTS shipping_postal_code text,
ADD COLUMN IF NOT EXISTS shipping_phone text,
ADD COLUMN IF NOT EXISTS billing_first_name text,
ADD COLUMN IF NOT EXISTS billing_last_name text,
ADD COLUMN IF NOT EXISTS billing_address_line_1 text,
ADD COLUMN IF NOT EXISTS billing_address_line_2 text,
ADD COLUMN IF NOT EXISTS billing_city text,
ADD COLUMN IF NOT EXISTS billing_postal_code text,
ADD COLUMN IF NOT EXISTS billing_phone text,
ADD COLUMN IF NOT EXISTS email text;

-- Asegurar que los campos obligatorios no sean null para nuevos pedidos
-- (Los pedidos existentes pueden tener null por compatibilidad)

-- Política RLS para que los usuarios puedan ver sus propios pedidos
-- (Ya existe, pero verificamos que esté activa)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

-- Recrear políticas
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Función para obtener estadísticas de pedidos (solo para admins)
CREATE OR REPLACE FUNCTION public.get_order_stats()
RETURNS TABLE (
  total_orders bigint,
  pending_orders bigint,
  confirmed_orders bigint,
  shipped_orders bigint,
  delivered_orders bigint,
  cancelled_orders bigint,
  total_revenue numeric
) AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_orders,
    COUNT(*) FILTER (WHERE status = 'pending')::bigint as pending_orders,
    COUNT(*) FILTER (WHERE status = 'confirmed')::bigint as confirmed_orders,
    COUNT(*) FILTER (WHERE status = 'shipped')::bigint as shipped_orders,
    COUNT(*) FILTER (WHERE status = 'delivered')::bigint as delivered_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled')::bigint as cancelled_orders,
    COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) as total_revenue
  FROM orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar stock antes de crear un pedido
CREATE OR REPLACE FUNCTION public.check_product_stock(product_id_param uuid, quantity_param integer)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products 
    WHERE id = product_id_param 
    AND stock >= quantity_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para verificar stock automáticamente al crear order_items
CREATE OR REPLACE FUNCTION check_stock_before_order_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que hay suficiente stock
  IF NOT check_product_stock(NEW.product_id, NEW.quantity) THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_check_stock_before_order_item ON order_items;
CREATE TRIGGER trigger_check_stock_before_order_item
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_before_order_item();

-- Comentarios para documentar la estructura
COMMENT ON COLUMN orders.shipping_first_name IS 'Nombre para envío';
COMMENT ON COLUMN orders.shipping_last_name IS 'Apellidos para envío';
COMMENT ON COLUMN orders.shipping_address_line_1 IS 'Dirección de envío línea 1';
COMMENT ON COLUMN orders.shipping_address_line_2 IS 'Dirección de envío línea 2 (opcional)';
COMMENT ON COLUMN orders.shipping_city IS 'Ciudad de envío';
COMMENT ON COLUMN orders.shipping_postal_code IS 'Código postal de envío';
COMMENT ON COLUMN orders.shipping_phone IS 'Teléfono de contacto para envío';
COMMENT ON COLUMN orders.billing_first_name IS 'Nombre para facturación';
COMMENT ON COLUMN orders.billing_last_name IS 'Apellidos para facturación';
COMMENT ON COLUMN orders.billing_address_line_1 IS 'Dirección de facturación línea 1';
COMMENT ON COLUMN orders.billing_address_line_2 IS 'Dirección de facturación línea 2 (opcional)';
COMMENT ON COLUMN orders.billing_city IS 'Ciudad de facturación';
COMMENT ON COLUMN orders.billing_postal_code IS 'Código postal de facturación';
COMMENT ON COLUMN orders.billing_phone IS 'Teléfono para facturación';
COMMENT ON COLUMN orders.email IS 'Email de contacto del cliente';
