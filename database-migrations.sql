-- Migraciones para agregar columnas de provincia y país a la tabla orders
-- Ejecutar estas consultas en el editor SQL de Supabase si quieres las columnas adicionales

-- Agregar columnas de provincia y país para envío
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100) DEFAULT 'España';

-- Agregar columnas de provincia y país para facturación  
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100) DEFAULT 'España';

-- Actualizar registros existentes (opcional)
UPDATE orders 
SET shipping_country = 'España', billing_country = 'España' 
WHERE shipping_country IS NULL OR billing_country IS NULL;

-- Comentarios:
-- Estas columnas son opcionales y el sistema funciona sin ellas
-- Solo agrégalas si quieres almacenar información más detallada
-- El formulario seguirá validando provincia y país en el frontend
