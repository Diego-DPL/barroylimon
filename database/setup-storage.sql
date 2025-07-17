-- Script para configurar Supabase Storage para imágenes de productos
-- Ejecutar en Supabase SQL Editor

-- 1. Crear bucket para productos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear política para permitir subida de imágenes (solo admins)
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. Crear política para permitir ver imágenes (público)
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 4. Crear política para eliminar imágenes (solo admins)
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 5. Insertar imagen del collar de limón (usando URL temporal)
-- Después de subir la imagen real, actualiza esta URL
INSERT INTO product_images (product_id, url, alt_text, position)
SELECT 
  p.id,
  'https://via.placeholder.com/400x500/d6d3d1/78716c?text=Collar+Limón+Acero',
  'Collar Limón Acero inoxidable',
  0
FROM products p 
WHERE p.slug = 'collar-limon-acero-inoxidable'
ON CONFLICT DO NOTHING;

-- 6. Verificar que todo está configurado
SELECT 
  p.name,
  p.price,
  p.stock,
  pi.url,
  pi.alt_text
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.slug = 'collar-limon-acero-inoxidable';
