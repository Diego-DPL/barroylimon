-- Script para corregir y actualizar la estructura de la tabla products
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar las columnas actuales de la tabla products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Renombrar la columna stock a stock_quantity si existe
DO $$
BEGIN
    -- Verificar si existe la columna 'stock'
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'products' AND column_name = 'stock') THEN
        -- Renombrar la columna
        ALTER TABLE products RENAME COLUMN stock TO stock_quantity;
        RAISE NOTICE 'Columna stock renombrada a stock_quantity';
    END IF;
    
    -- Si no existe stock_quantity, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Columna stock_quantity creada';
    END IF;
END $$;

-- 3. Agregar otras columnas necesarias si no existen
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS weight decimal(10,2),
ADD COLUMN IF NOT EXISTS dimensions text,
ADD COLUMN IF NOT EXISTS material text,
ADD COLUMN IF NOT EXISTS care_instructions text;

-- 4. Asegurar que price sea decimal para cálculos precisos
DO $$
BEGIN
    -- Verificar el tipo de la columna price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'products' AND column_name = 'price' AND data_type != 'numeric') THEN
        -- Cambiar a decimal si no lo es
        ALTER TABLE products ALTER COLUMN price TYPE decimal(10,2);
        RAISE NOTICE 'Columna price convertida a decimal(10,2)';
    END IF;
END $$;

-- 5. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- 6. Actualizar productos existentes para asociarlos con categorías
UPDATE products 
SET category_id = (
    SELECT c.id 
    FROM categories c 
    WHERE c.slug = 'nueva-coleccion'
    LIMIT 1
)
WHERE category_id IS NULL
AND EXISTS (
    SELECT 1 FROM categories WHERE slug = 'nueva-coleccion'
);

-- 7. Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 8. Mostrar productos con su información completa
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.stock_quantity,
    p.is_active,
    c.name as category_name,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;

-- 9. Comentarios para documentar
COMMENT ON COLUMN products.stock_quantity IS 'Cantidad disponible en inventario';
COMMENT ON COLUMN products.is_active IS 'Indica si el producto está activo para la venta';
COMMENT ON COLUMN products.category_id IS 'Referencia a la categoría del producto';
COMMENT ON COLUMN products.weight IS 'Peso del producto en gramos';
COMMENT ON COLUMN products.dimensions IS 'Dimensiones del producto (ej: "5x3x1 cm")';
COMMENT ON COLUMN products.material IS 'Material principal del producto';
COMMENT ON COLUMN products.care_instructions IS 'Instrucciones de cuidado del producto';
