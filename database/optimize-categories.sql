-- ================================================
-- OPTIMIZACIÓN DEL SISTEMA DE CATEGORÍAS
-- ================================================

-- 1. Añadir campos opcionales a la tabla categories para mejor organización
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS category_type VARCHAR(50) DEFAULT 'general';

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(category_type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON public.product_categories(category_id);

-- 3. Insertar categorías base para tu sistema
INSERT INTO public.categories (name, slug, description, category_type, sort_order) VALUES
-- Tipos de producto
('Collares', 'collares', 'Collares y colgantes artesanales', 'product_type', 1),
('Pulseras', 'pulseras', 'Pulseras y brazaletes únicos', 'product_type', 2),
('Pendientes', 'pendientes', 'Pendientes y aretes artesanales', 'product_type', 3),
('Anillos', 'anillos', 'Anillos únicos de arcilla', 'product_type', 4),
('Broches', 'broches', 'Broches y pins decorativos', 'product_type', 5),

-- Materiales
('Arcilla Mediterránea', 'arcilla-mediterranea', 'Productos hechos con arcilla mediterránea', 'material', 10),
('Cristal', 'cristal', 'Productos con elementos de cristal', 'material', 11),
('Acero Dorado', 'acero-dorado', 'Cadenas y elementos de acero dorado', 'material', 12),
('Acero Plateado', 'acero-plateado', 'Cadenas y elementos de acero plateado', 'material', 13),
('Cuero', 'cuero', 'Productos con elementos de cuero', 'material', 14),

-- Colecciones
('Nueva Colección', 'nueva-coleccion', 'Últimos productos añadidos', 'collection', 20),
('Colección Mediterránea', 'coleccion-mediterranea', 'Inspirada en el Mediterráneo', 'collection', 21),
('Colección Huerta', 'coleccion-huerta', 'Inspirada en la huerta murciana', 'collection', 22),
('Colección Vintage', 'coleccion-vintage', 'Diseños con aires vintage', 'collection', 23),

-- Estilos
('Minimalista', 'minimalista', 'Diseños simples y elegantes', 'style', 30),
('Bohemio', 'bohemio', 'Estilo bohemio y libre', 'style', 31),
('Clásico', 'clasico', 'Diseños atemporales', 'style', 32),
('Moderno', 'moderno', 'Diseños contemporáneos', 'style', 33),

-- Ocasiones
('Diario', 'diario', 'Para el día a día', 'occasion', 40),
('Especial', 'especial', 'Para ocasiones especiales', 'occasion', 41),
('Noche', 'noche', 'Para eventos nocturnos', 'occasion', 42),
('Boda', 'boda', 'Para bodas y ceremonias', 'occasion', 43)

ON CONFLICT (slug) DO NOTHING;

-- 4. Función para obtener todas las categorías de un producto
CREATE OR REPLACE FUNCTION get_product_categories(product_uuid UUID)
RETURNS TABLE(
    id BIGINT,
    name TEXT,
    slug TEXT,
    category_type VARCHAR(50),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.category_type,
        c.description
    FROM categories c
    INNER JOIN product_categories pc ON c.id = pc.category_id
    WHERE pc.product_id = product_uuid
    AND c.is_active = true
    ORDER BY c.category_type, c.sort_order, c.name;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para obtener productos por categoría
CREATE OR REPLACE FUNCTION get_products_by_category(category_slug_param TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    price NUMERIC,
    stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock
    FROM products p
    INNER JOIN product_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    WHERE c.slug = category_slug_param
    AND c.is_active = true
    AND p.stock > 0
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para buscar productos por múltiples categorías
CREATE OR REPLACE FUNCTION get_products_by_multiple_categories(category_slugs TEXT[])
RETURNS TABLE(
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    price NUMERIC,
    stock INTEGER,
    matching_categories INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        COUNT(DISTINCT c.id)::INTEGER as matching_categories
    FROM products p
    INNER JOIN product_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    WHERE c.slug = ANY(category_slugs)
    AND c.is_active = true
    AND p.stock > 0
    GROUP BY p.id, p.name, p.slug, p.description, p.price, p.stock
    ORDER BY matching_categories DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Vista para obtener productos con sus categorías (útil para consultas)
CREATE OR REPLACE VIEW products_with_categories AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.stock,
    p.created_at,
    p.updated_at,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'type', c.category_type
        ) ORDER BY c.category_type, c.sort_order
    ) as categories
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id AND c.is_active = true
GROUP BY p.id, p.name, p.slug, p.description, p.price, p.stock, p.created_at, p.updated_at;

-- 8. Función para asignar múltiples categorías a un producto
CREATE OR REPLACE FUNCTION assign_categories_to_product(
    product_uuid UUID,
    category_ids BIGINT[]
)
RETURNS VOID AS $$
DECLARE
    category_id BIGINT;
BEGIN
    -- Eliminar categorías existentes
    DELETE FROM product_categories WHERE product_id = product_uuid;
    
    -- Insertar nuevas categorías
    FOREACH category_id IN ARRAY category_ids
    LOOP
        INSERT INTO product_categories (product_id, category_id)
        VALUES (product_uuid, category_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear políticas RLS para categories si no existen
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Política para lectura (todos pueden ver categorías activas)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (is_active = true);

-- Política para administradores (pueden hacer todo)
DROP POLICY IF EXISTS "Categories are manageable by admins" ON public.categories;
CREATE POLICY "Categories are manageable by admins" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 10. RLS para product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver las relaciones
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON public.product_categories;
CREATE POLICY "Product categories are viewable by everyone" ON public.product_categories
    FOR SELECT USING (true);

-- Solo admins pueden modificar
DROP POLICY IF EXISTS "Product categories are manageable by admins" ON public.product_categories;
CREATE POLICY "Product categories are manageable by admins" ON public.product_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
