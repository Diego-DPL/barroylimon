-- Script para insertar el primer producto: Collar Limón Acero inoxidable
-- Ejecutar en Supabase SQL Editor

-- 1. Crear categoría si no existe
INSERT INTO categories (name, slug) 
VALUES ('Nueva Colección', 'nueva-coleccion')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insertar el producto
INSERT INTO products (
  id,
  name, 
  slug, 
  description, 
  price, 
  stock
) VALUES (
  gen_random_uuid(),
  'Collar Limón Acero inoxidable',
  'collar-limon-acero-inoxidable',
  'Elegante collar con colgante de limón fabricado en arcilla mediterránea y cadena de acero inoxidable dorado. Inspirado en la tradición alfarera de la huerta murciana, cada pieza es única y hecha a mano por nuestros artesanos.',
  25.00,
  10
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock;

-- 3. Asociar producto con categoría
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c 
WHERE p.slug = 'collar-limon-acero-inoxidable' 
AND c.slug = 'nueva-coleccion'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- 4. Insertar imagen placeholder (actualizar URL después)
INSERT INTO product_images (product_id, url, alt_text, position)
SELECT 
  p.id,
  'https://via.placeholder.com/400x400/d97706/ffffff?text=Collar+Limón',
  'Collar Limón Acero inoxidable',
  0
FROM products p
WHERE p.slug = 'collar-limon-acero-inoxidable'
ON CONFLICT DO NOTHING;

-- 5. Verificar que se insertó correctamente
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.stock,
  c.name as category_name,
  pi.url as image_url
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.slug = 'collar-limon-acero-inoxidable';
