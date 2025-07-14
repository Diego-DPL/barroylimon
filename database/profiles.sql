-- Modificar tabla de perfiles existente (si es necesario)
-- La tabla profiles ya existe, solo necesitamos verificar que tenga las columnas correctas

-- Verificar si full_name permite NULL (según el esquema actual es NOT NULL)
-- Si queremos permitir NULL para usuarios que no han completado su perfil:
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- Habilitar Row Level Security (RLS) si no está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen para evitar conflictos
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Política para que los usuarios solo puedan ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Función para crear automáticamente un perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el perfil ya existe, no hacer nada
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Crear perfiles para usuarios existentes que no tengan uno
INSERT INTO public.profiles (id, full_name, avatar_url, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Opcional: Habilitar RLS en la tabla newsletter_subscribers si no está habilitado
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes de newsletter si existen
DROP POLICY IF EXISTS "Users can view own subscriptions" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;

-- Políticas para newsletter_subscribers
CREATE POLICY "Users can view own subscriptions" ON newsletter_subscribers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
