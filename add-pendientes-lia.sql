-- Insertar el nuevo producto: Pendientes Lia
-- Pendientes de acero inoxidable color plata con colgante de limón

-- 1. Insertar el producto
INSERT INTO products (
    name,
    slug,
    description,
    price,
    stock
) VALUES (
    'Pendientes Lia',
    'pendientes-lia',
    'Elegantes pendientes con colgante de limón artesanal en arcilla mediterránea y cadena de acero inoxidable color plata. Perfectos para un look sofisticado y moderno.',
    25.00,
    5
);

-- 2. Insertar imagen del producto
INSERT INTO product_images (product_id, url, alt_text, position)
SELECT 
  p.id,
  'https://fryhuomvlpzhrmkttahv.supabase.co/storage/v1/object/public/product-images//pendientes-lia.webp',
  'Pendientes Lia con colgante de limón en cadena de acero inoxidable plata',
  0
FROM products p
WHERE p.slug = 'pendientes-lia'
ON CONFLICT DO NOTHING;

-- 3. Crear la categoría Acero Plateado si no existe
INSERT INTO categories (name, slug, category_type, description, sort_order)
SELECT 'Acero Plateado', 'acero-plateado', 'material', 'Acero inoxidable con acabado plateado brillante', 11
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Acero Plateado' AND category_type = 'material');

-- 4. ASIGNACIÓN DE CATEGORÍAS A LOS PENDIENTES LIA
-- Categorías que le asignaremos:
-- - Tipo: Pendientes
-- - Material: Arcilla Mediterránea + Acero Plateado
-- - Colección: Colección Mediterránea + Colección Huerta
-- - Estilo: Clásico + Moderno + Elegante
-- - Ocasión: Diario + Noche + Especial

DO $$
DECLARE
    product_uuid UUID;
    category_ids BIGINT[];
BEGIN
    -- Obtener el UUID del producto recién insertado
    SELECT id INTO product_uuid FROM products WHERE slug = 'pendientes-lia';
    
    -- Obtener los IDs de las categorías para los pendientes lia
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM categories 
    WHERE slug IN (
        'pendientes',
        'arcilla-mediterranea',
        'acero-plateado',
        'coleccion-mediterranea',
        'coleccion-huerta',
        'clasico',
        'moderno',
        'elegante',
        'diario',
        'noche',
        'especial'
    );
    
    -- Asignar categorías al producto
    PERFORM assign_categories_to_product(product_uuid, category_ids);
    
    RAISE NOTICE 'Categorías asignadas a los Pendientes Lia: %', array_length(category_ids, 1);
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
WHERE p.slug = 'pendientes-lia';
