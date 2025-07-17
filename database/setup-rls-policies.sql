-- Script simple para configurar las políticas RLS necesarias
-- Ejecutar en Supabase SQL Editor

-- 1. Asegurar que RLS está habilitado en las tablas principales
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para productos y categorías (todos pueden ver)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- 3. Políticas para pedidos (usuarios ven los suyos, admins ven todos)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Políticas para items de pedidos
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM profiles 
             WHERE profiles.id = auth.uid() 
             AND profiles.role = 'admin'
           ))
    )
  );

DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- 5. Políticas para administradores
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Función para obtener estadísticas de pedidos (solo para admins)
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

-- 7. Verificar que todo funciona
SELECT 'Políticas RLS configuradas correctamente' as status;
