-- Script para verificar y corregir newsletter_subscribers
-- Ejecuta esto en Supabase SQL Editor

-- 1. Verificar columnas de newsletter_subscribers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'newsletter_subscribers' 
AND table_schema = 'public';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS para newsletter_subscribers
DROP POLICY IF EXISTS "Users can view own subscriptions" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;

CREATE POLICY "Users can view own subscriptions" ON newsletter_subscribers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- 4. Política para admins (opcional)
CREATE POLICY "Admins can view all subscriptions" ON newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
