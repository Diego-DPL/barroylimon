-- ================================================
-- ASIGNACIÓN DE CATEGORÍAS A PRODUCTOS EXISTENTES
-- ================================================

-- Este script asigna categorías múltiples a los 3 productos existentes en la base de datos

-- 1. COLLAR CUERDA LIMÓN, SANDÍA Y ESTRELLA
-- ID: 22bfc750-a11d-42d9-9aa0-4dba32d603a9
-- Categorías que le asignaremos:
-- - Tipo: Collares
-- - Material: Arcilla Mediterránea + Cristal + Cuero (cuerda)
-- - Colección: Colección Mediterránea + Colección Huerta
-- - Estilo: Bohemio
-- - Ocasión: Diario + Especial

DO $$
DECLARE
    product_uuid UUID := '22bfc750-a11d-42d9-9aa0-4dba32d603a9';
    category_ids BIGINT[];
BEGIN
    -- Obtener los IDs de las categorías para el collar de cuerda
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM categories 
    WHERE slug IN (
        'collares',
        'arcilla-mediterranea', 
        'cristal',
        'cuero',
        'coleccion-mediterranea',
        'coleccion-huerta',
        'bohemio',
        'diario',
        'especial'
    );
    
    -- Asignar categorías al producto
    PERFORM assign_categories_to_product(product_uuid, category_ids);
    
    RAISE NOTICE 'Categorías asignadas al Collar Cuerda Limón, Sandía y Estrella';
END $$;

-- 2. COLLAR LIMÓN ACERO INOXIDABLE
-- ID: d304430b-442f-4d6c-ae61-e6dbf46e2a6b
-- Categorías que le asignaremos:
-- - Tipo: Collares
-- - Material: Arcilla Mediterránea + Acero Dorado
-- - Colección: Colección Mediterránea + Colección Huerta
-- - Estilo: Clásico
-- - Ocasión: Diario + Especial

DO $$
DECLARE
    product_uuid UUID := 'd304430b-442f-4d6c-ae61-e6dbf46e2a6b';
    category_ids BIGINT[];
BEGIN
    -- Obtener los IDs de las categorías para el collar de acero
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM categories 
    WHERE slug IN (
        'collares',
        'arcilla-mediterranea',
        'acero-dorado',
        'coleccion-mediterranea',
        'coleccion-huerta',
        'clasico',
        'diario',
        'especial'
    );
    
    -- Asignar categorías al producto
    PERFORM assign_categories_to_product(product_uuid, category_ids);
    
    RAISE NOTICE 'Categorías asignadas al Collar Limón Acero inoxidable';
END $$;

-- 3. PENDIENTE LIMÓN ACERO INOXIDABLE
-- ID: b6342d3b-188e-4604-83d1-becef1dbdb4a
-- Categorías que le asignaremos:
-- - Tipo: Pendientes (usar la categoría existente con slug 'pendientes')
-- - Material: Arcilla Mediterránea + Acero Dorado
-- - Colección: Colección Mediterránea + Colección Huerta
-- - Estilo: Clásico + Moderno
-- - Ocasión: Diario + Noche

-- Actualizar la categoría existente para que sea del tipo product_type
UPDATE public.categories 
SET category_type = 'product_type', 
    description = 'Pendientes y aretes artesanales',
    sort_order = 3
WHERE slug = 'pendientes' AND category_type = 'general';

DO $$
DECLARE
    product_uuid UUID := 'b6342d3b-188e-4604-83d1-becef1dbdb4a';
    category_ids BIGINT[];
BEGIN
    -- Obtener los IDs de las categorías para los pendientes
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM categories 
    WHERE slug IN (
        'pendientes',  -- Usar la categoría existente
        'arcilla-mediterranea',
        'acero-dorado',
        'coleccion-mediterranea',
        'coleccion-huerta',
        'clasico',
        'moderno',
        'diario',
        'noche'
    );
    
    -- Asignar categorías al producto
    PERFORM assign_categories_to_product(product_uuid, category_ids);
    
    RAISE NOTICE 'Categorías asignadas al Pendiente Limón Acero inoxidable';
END $$;

-- ================================================
-- CONSULTAS DE VERIFICACIÓN
-- ================================================

-- 1. Ver todos los productos con sus categorías organizadas por tipo
SELECT 
    p.name as producto,
    p.price as precio,
    c.category_type as tipo_categoria,
    c.name as categoria
FROM products p
JOIN product_categories pc ON p.id = pc.product_id
JOIN categories c ON pc.category_id = c.id
ORDER BY p.name, 
         CASE c.category_type 
           WHEN 'product_type' THEN 1
           WHEN 'material' THEN 2
           WHEN 'collection' THEN 3
           WHEN 'style' THEN 4
           WHEN 'occasion' THEN 5
           ELSE 6
         END,
         c.sort_order;

-- 2. Resumen de categorías por producto
SELECT 
    p.name as producto,
    p.price as precio,
    COUNT(pc.category_id) as total_categorias,
    STRING_AGG(
        c.name, 
        ' | ' 
        ORDER BY c.category_type, c.sort_order
    ) as categorias_completas
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id, p.name, p.price
ORDER BY p.name;

-- 3. Productos por tipo de material
SELECT 
    c.name as material,
    COUNT(DISTINCT p.id) as productos_con_material,
    STRING_AGG(DISTINCT p.name, ', ') as productos
FROM categories c
JOIN product_categories pc ON c.id = pc.category_id
JOIN products p ON pc.product_id = p.id
WHERE c.category_type = 'material'
GROUP BY c.id, c.name
ORDER BY productos_con_material DESC;

-- 4. Productos por colección
SELECT 
    c.name as coleccion,
    COUNT(DISTINCT p.id) as productos_en_coleccion,
    STRING_AGG(DISTINCT p.name, ', ') as productos
FROM categories c
JOIN product_categories pc ON c.id = pc.category_id
JOIN products p ON pc.product_id = p.id
WHERE c.category_type = 'collection'
GROUP BY c.id, c.name
ORDER BY productos_en_coleccion DESC;

-- 5. Búsqueda: Productos con arcilla mediterránea
SELECT DISTINCT 
    p.name,
    p.price,
    p.description
FROM products p
JOIN product_categories pc ON p.id = pc.product_id
JOIN categories c ON pc.category_id = c.id
WHERE c.slug = 'arcilla-mediterranea';

-- 6. Búsqueda: Productos para uso diario
SELECT DISTINCT 
    p.name,
    p.price,
    p.stock
FROM products p
JOIN product_categories pc ON p.id = pc.product_id
JOIN categories c ON pc.category_id = c.id
WHERE c.slug = 'diario'
ORDER BY p.price;

-- 7. Vista completa de productos con todas sus categorías agrupadas
SELECT 
    p.id,
    p.name,
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
ORDER BY p.name;
