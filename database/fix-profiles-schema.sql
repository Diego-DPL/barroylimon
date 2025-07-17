-- Script para corregir y actualizar la estructura de la tabla profiles
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar las columnas actuales de la tabla profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Agregar columnas necesarias si no existen
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS newsletter_subscribed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS address_line_1 text,
ADD COLUMN IF NOT EXISTS address_line_2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'España';

-- 3. Asegurar que created_at existe con valor por defecto
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Columna created_at añadida a profiles';
    END IF;
END $$;

-- 4. Asegurar que updated_at existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Columna updated_at añadida a profiles';
    END IF;
END $$;

-- 5. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Aplicar trigger a la tabla profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter ON profiles(newsletter_subscribed);

-- 8. Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 9. Mostrar perfiles existentes
SELECT 
    id,
    full_name,
    phone,
    newsletter_subscribed,
    role,
    created_at,
    updated_at
FROM profiles
ORDER BY created_at DESC;

-- 10. Comentarios para documentar
COMMENT ON COLUMN profiles.phone IS 'Número de teléfono del usuario';
COMMENT ON COLUMN profiles.newsletter_subscribed IS 'Indica si el usuario está suscrito al newsletter';
COMMENT ON COLUMN profiles.birth_date IS 'Fecha de nacimiento del usuario';
COMMENT ON COLUMN profiles.address_line_1 IS 'Dirección principal del usuario';
COMMENT ON COLUMN profiles.address_line_2 IS 'Dirección secundaria (opcional)';
COMMENT ON COLUMN profiles.city IS 'Ciudad del usuario';
COMMENT ON COLUMN profiles.postal_code IS 'Código postal del usuario';
COMMENT ON COLUMN profiles.country IS 'País del usuario';
