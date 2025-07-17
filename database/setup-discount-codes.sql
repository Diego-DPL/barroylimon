-- Sistema de códigos de descuento para Barro y Limón
-- Ejecutar en Supabase SQL Editor

-- Crear tabla de códigos de descuento
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' o 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  is_single_use BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  max_uses INTEGER, -- NULL para uso ilimitado
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de usos de códigos (para rastrear quién usa qué código)
CREATE TABLE IF NOT EXISTS discount_code_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discount_amount DECIMAL(10,2) NOT NULL
);

-- Agregar columnas a la tabla orders para descuentos
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2);

-- Actualizar total_amount para ser subtotal + shipping - discount
-- (en el futuro se puede agregar shipping_cost)

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en discount_codes
CREATE TRIGGER update_discount_codes_updated_at 
  BEFORE UPDATE ON discount_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para discount_codes
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver códigos activos (para validar en checkout)
CREATE POLICY "Users can view active discount codes" ON discount_codes
FOR SELECT USING (is_active = true);

-- Solo admins pueden gestionar códigos
CREATE POLICY "Admins can manage discount codes" ON discount_codes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Políticas RLS para discount_code_uses
ALTER TABLE discount_code_uses ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios usos
CREATE POLICY "Users can view own discount uses" ON discount_code_uses
FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden crear registros de uso (para checkout)
CREATE POLICY "Users can create discount uses" ON discount_code_uses
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Los admins pueden ver todos los usos
CREATE POLICY "Admins can view all discount uses" ON discount_code_uses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Función para validar y aplicar código de descuento
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_user_id UUID,
  p_subtotal DECIMAL(10,2)
)
RETURNS JSON AS $$
DECLARE
  v_discount_code discount_codes%ROWTYPE;
  v_usage_count INTEGER;
  v_user_usage_count INTEGER;
  v_discount_amount DECIMAL(10,2);
  v_result JSON;
BEGIN
  -- Buscar el código
  SELECT * INTO v_discount_code
  FROM discount_codes
  WHERE code = UPPER(p_code) AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Código de descuento no válido');
  END IF;

  -- Verificar fechas de validez
  IF v_discount_code.valid_from > NOW() THEN
    RETURN json_build_object('valid', false, 'error', 'Código de descuento aún no válido');
  END IF;

  IF v_discount_code.valid_until IS NOT NULL AND v_discount_code.valid_until < NOW() THEN
    RETURN json_build_object('valid', false, 'error', 'Código de descuento expirado');
  END IF;

  -- Verificar límites de uso
  IF v_discount_code.max_uses IS NOT NULL THEN
    SELECT usage_count INTO v_usage_count FROM discount_codes WHERE id = v_discount_code.id;
    IF v_usage_count >= v_discount_code.max_uses THEN
      RETURN json_build_object('valid', false, 'error', 'Código de descuento agotado');
    END IF;
  END IF;

  -- Verificar uso único por usuario
  IF v_discount_code.is_single_use THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM discount_code_uses
    WHERE discount_code_id = v_discount_code.id AND user_id = p_user_id;
    
    IF v_user_usage_count > 0 THEN
      RETURN json_build_object('valid', false, 'error', 'Ya has usado este código de descuento');
    END IF;
  END IF;

  -- Calcular descuento
  IF v_discount_code.discount_type = 'percentage' THEN
    v_discount_amount := ROUND(p_subtotal * (v_discount_code.discount_value / 100), 2);
  ELSE -- fixed
    v_discount_amount := v_discount_code.discount_value;
  END IF;

  -- Asegurar que el descuento no sea mayor al subtotal
  IF v_discount_amount > p_subtotal THEN
    v_discount_amount := p_subtotal;
  END IF;

  RETURN json_build_object(
    'valid', true,
    'code_id', v_discount_code.id,
    'discount_amount', v_discount_amount,
    'discount_type', v_discount_code.discount_type,
    'discount_value', v_discount_code.discount_value,
    'description', v_discount_code.description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar algunos códigos de prueba
INSERT INTO discount_codes (code, description, discount_type, discount_value, is_single_use, is_active, max_uses)
VALUES 
  ('BIENVENIDO10', 'Descuento de bienvenida del 10%', 'percentage', 10.00, true, true, NULL),
  ('VERANO2025', 'Descuento de verano 15%', 'percentage', 15.00, false, true, 100),
  ('ENVIOGRATIS', 'Descuento fijo de 5€', 'fixed', 5.00, false, true, NULL);

-- Comentarios para documenter el sistema
COMMENT ON TABLE discount_codes IS 'Códigos de descuento del sistema';
COMMENT ON TABLE discount_code_uses IS 'Registro de usos de códigos de descuento';
COMMENT ON COLUMN discount_codes.discount_type IS 'Tipo: percentage (porcentaje) o fixed (cantidad fija)';
COMMENT ON COLUMN discount_codes.is_single_use IS 'Si es true, cada usuario solo puede usarlo una vez';
COMMENT ON COLUMN discount_codes.max_uses IS 'Máximo número de usos totales (NULL = ilimitado)';
