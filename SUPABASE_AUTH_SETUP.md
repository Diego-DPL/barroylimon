# Configuración de Autenticación en Supabase

## Pasos para configurar la autenticación:

### 1. Configurar la autenticación en el Dashboard de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. En el panel lateral, haz clic en **Authentication**
3. Ve a la pestaña **Settings**
4. En **Site URL**, asegúrate de que esté configurado como:
   - Para desarrollo: `http://localhost:5173`
   - Para producción: `https://tudominio.com`

### 2. Configurar URLs de redirección

En **Authentication > Settings > URL Configuration**:
- **Site URL**: `http://localhost:5173` (desarrollo) o tu dominio de producción
- **Redirect URLs**: Agrega las siguientes URLs:
  - `http://localhost:5173/` (desarrollo)
  - `http://localhost:5173/reset-password` (para recuperación de contraseña en desarrollo)
  - `https://tudominio.com/` (producción)
  - `https://tudominio.com/reset-password` (para recuperación de contraseña en producción)

### 3. Configurar políticas de correo electrónico

En **Authentication > Settings > Email Templates**:
- **Confirm signup**: Usar el template personalizado del archivo `email-templates/confirm-signup.html`
- **Reset password**: Usar el template personalizado del archivo `email-templates/reset-password.html`
- Asegúrate de que **Email confirmations** esté habilitado si quieres que los usuarios confirmen su email

### 4. Habilitar proveedores de autenticación

En **Authentication > Providers**:
- **Email** debe estar habilitado
- Puedes habilitar otros proveedores como Google, GitHub, etc. si los necesitas más adelante

### 5. Crear tablas y políticas de seguridad

#### Tabla de perfiles de usuario

Ejecuta el siguiente SQL en **Database > SQL Editor**:

```sql
-- Copiar y ejecutar el contenido del archivo database/profiles.sql
```

#### Políticas para newsletter_subscribers

Si quieres que los usuarios autenticados puedan ver sus propias suscripciones:

```sql
-- Ir a Database > Tables > newsletter_subscribers
-- Hacer clic en "Add RLS policy"

-- Política para permitir que los usuarios vean sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON newsletter_subscribers
FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que cualquiera se suscriba (mantener la funcionalidad actual)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
FOR INSERT WITH CHECK (true);
```

### 6. Variables de entorno

Asegúrate de que tu archivo `.env.local` (si no existe, créalo) contenga:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 7. Verificar la configuración

Una vez configurado todo:

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:5173`
3. Prueba a registrarte con un email válido
4. Revisa tu email para confirmar la cuenta (si tienes confirmación habilitada)
5. Prueba a iniciar sesión

## Funcionalidades implementadas:

✅ **Registro de usuarios** - Los usuarios pueden crear cuentas con email y contraseña
✅ **Inicio de sesión** - Los usuarios pueden iniciar sesión con sus credenciales
✅ **Cerrar sesión** - Los usuarios pueden cerrar sesión desde el header
✅ **Recuperación de contraseña** - Los usuarios pueden restablecer su contraseña mediante email
✅ **Perfiles de usuario** - Los usuarios pueden ver y editar su información personal
✅ **Estado de autenticación** - El header muestra diferentes opciones según si el usuario está logueado
✅ **Rutas protegidas** - Páginas que requieren autenticación (como el perfil)
✅ **Integración con newsletter** - Los usuarios autenticados se asocian automáticamente a sus suscripciones
✅ **Email templates personalizados** - Emails hermosos que coinciden con la estética de la marca

## Próximos pasos opcionales:

- ✅ ~~Agregar recuperación de contraseña~~ **COMPLETADO**
- ✅ ~~Implementar perfiles de usuario~~ **COMPLETADO**
- Agregar autenticación con proveedores sociales (Google, GitHub, etc.)
- Implementar roles de usuario (admin, customer, etc.)
- Agregar avatar de usuario con subida de imágenes
- Crear dashboard de administración

## Rutas implementadas:

- `/` - Página principal
- `/login` - Inicio de sesión
- `/registro` - Registro de nuevos usuarios
- `/forgot-password` - Solicitar recuperación de contraseña
- `/reset-password` - Establecer nueva contraseña (desde email)
- `/profile` - Perfil de usuario (protegida)
