-- Insertar el nuevo producto: Collar Marina
-- Collar con cuerda larga de antelina negro y colgante de limón

-- 1. Insertar el producto
INSERT INTO products (
    name,
    slug,
    description,
    price,
    stock
) VALUES (
    'Collar Marina',
    'collar-marina',
    'Elegante collar con colgante de limón artesanal en arcilla mediterránea. Incluye cuerda larga de antelina negra ajustable. Perfecto para un look casual y sofisticado.',
    20.00,
    3
);

-- 2. Insertar imagen del producto
INSERT INTO product_images (product_id, url, alt_text, position)
SELECT 
  p.id,
  'https://fryhuomvlpzhrmkttahv.supabase.co/storage/v1/object/public/product-images//collar-marina.webp',
  'Collar Marina con colgante de limón en cuerda de antelina negra',
  0
FROM products p
WHERE p.slug = 'collar-marina'
ON CONFLICT DO NOTHING;

-- 3. Crear la categoría Antelina si no existe
INSERT INTO categories (name, slug, category_type, description, sort_order)
SELECT 'Antelina', 'antelina', 'material', 'Cuerda de antelina suave y elegante', 10
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Antelina' AND category_type = 'material');

-- 4. ASIGNACIÓN DE CATEGORÍAS AL COLLAR MARINA
-- Categorías que le asignaremos:
-- - Tipo: Collares
-- - Material: Arcilla Mediterránea + Antelina
-- - Colección: Colección Mediterránea + Colección Huerta
-- - Estilo: Casual + Bohemio
-- - Ocasión: Diario + Verano

DO $$
DECLARE
    product_uuid UUID;
    category_ids BIGINT[];
BEGIN
    -- Obtener el UUID del producto recién insertado
    SELECT id INTO product_uuid FROM products WHERE slug = 'collar-marina';
    
    -- Obtener los IDs de las categorías para el collar marina
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM categories 
    WHERE slug IN (
        'collares',
        'arcilla-mediterranea',
        'antelina',
        'coleccion-mediterranea',
        'coleccion-huerta',
        'casual',
        'bohemio',
        'diario',
        'verano'
    );
    
    -- Asignar categorías al producto
    PERFORM assign_categories_to_product(product_uuid, category_ids);
    
    RAISE NOTICE 'Categorías asignadas al Collar Marina: %', array_length(category_ids, 1);
END $$;

-- 5. Verificar que el producto se insertó correctamente con sus categorías
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.stock,
    COALESCE(
        (SELECT STRING_AGG(c.name, ', ')
         FROM product_categories pc 
         JOIN categories c ON pc.category_id = c.id 
         WHERE pc.product_id = p.id AND c.category_type = 'product_type'),
        'Sin tipo'
    ) as tipos,
    COALESCE(
        (SELECT STRING_AGG(c.name, ', ')
         FROM product_categories pc 
         JOIN categories c ON pc.category_id = c.id 
         WHERE pc.product_id = p.id AND c.category_type = 'material'),
        'Sin material'
    ) as materiales,
    COALESCE(
        (SELECT STRING_AGG(c.name, ', ')
         FROM product_categories pc 
         JOIN categories c ON pc.category_id = c.id 
         WHERE pc.product_id = p.id AND c.category_type = 'collection'),
        'Sin colección'
    ) as colecciones,
    COALESCE(
        (SELECT STRING_AGG(c.name, ', ')
         FROM product_categories pc 
         JOIN categories c ON pc.category_id = c.id 
         WHERE pc.product_id = p.id AND c.category_type = 'style'),
        'Sin estilo'
    ) as estilos,
    COALESCE(
        (SELECT STRING_AGG(c.name, ', ')
         FROM product_categories pc 
         JOIN categories c ON pc.category_id = c.id 
         WHERE pc.product_id = p.id AND c.category_type = 'occasion'),
        'Sin ocasión'
    ) as ocasiones
FROM products p
WHERE p.slug = 'collar-marina';
