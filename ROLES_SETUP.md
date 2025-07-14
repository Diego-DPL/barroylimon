# Sistema de Roles de Usuario - Barro y Limón

## Configuración del Sistema de Roles

### 1. Ejec### 2. **Asignar rol de administrador** a tu usuario:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE id = (
     SELECT id FROM auth.users 
     WHERE email = 'tu-email@ejemplo.com'
   );
   ```cript SQL en Supabase

Para activar el sistema de roles, necesitas ejecutar el script SQL que se encuentra en `/database/user-roles.sql` en tu proyecto de Supabase:

1. Ve a tu proyecto de Supabase Dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `/database/user-roles.sql`
4. Ejecuta el script haciendo clic en **Run**

Este script:
- Crea un enum `user_role` con los valores: 'customer', 'admin', 'moderator'
- Añade la columna `role` a la tabla `profiles` (por defecto: 'customer')
- Crea una tabla `user_permissions` para permisos granulares
- Implementa funciones SQL para verificación de roles y permisos
- Configura políticas RLS (Row Level Security) para todas las tablas
- **Función `get_users_with_emails()`**: Obtiene usuarios con sus emails desde auth.users (solo para admins)

### 2. Componentes Implementados

#### React Hooks
- **`useRole.ts`**: Hook personalizado para gestión de roles
  - `isAdmin()`: Verifica si el usuario es administrador
  - `isCustomer()`: Verifica si el usuario es cliente
  - `isModerator()`: Verifica si el usuario es moderador
  - `hasPermission(permission)`: Verifica permisos específicos

#### Componentes de Protección
- **`RoleProtectedRoute.tsx`**: Envuelve rutas que requieren roles específicos
- **`ProtectedRoute.tsx`**: Envuelve rutas que requieren autenticación

#### Páginas de Administración
- **`AdminDashboard.tsx`**: Panel de control principal para administradores
- **`UserManagement.tsx`**: Gestión de usuarios y asignación de roles

### 3. Rutas Protegidas Configuradas

```typescript
// Ruta solo para administradores
/admin -> AdminDashboard
/admin/users -> UserManagement

// Rutas que requieren autenticación
/profile -> Profile
```

### 4. Funcionalidades del Sistema

#### Header Dinámico
- Muestra botón "Admin" solo a usuarios con rol de administrador
- Acceso directo al panel de administración

#### Panel de Administración
- Estadísticas generales del sistema
- Gestión de usuarios, productos, pedidos
- Reportes y configuración

#### Gestión de Usuarios
- Lista todos los usuarios registrados
- Permite cambiar roles (customer ↔ admin ↔ moderator)
- Muestra estado de suscripción al newsletter
- Interfaz intuitiva para administración

### 5. Estructura de Base de Datos

#### Tabla `profiles`
```sql
- id (uuid, FK a auth.users)
- email (text)
- full_name (text)
- role (user_role enum) -- Nuevo campo
- newsletter_subscribed (boolean)
- created_at (timestamp)
```

#### Tabla `user_permissions`
```sql
- id (uuid)
- user_id (uuid, FK a profiles)
- permission (text)
- granted_at (timestamp)
- granted_by (uuid, FK a profiles)
```

### 6. Seguridad (RLS Policies)

Todas las tablas tienen políticas que respetan los roles:

- **Administradores**: Acceso completo a todas las operaciones
- **Moderadores**: Acceso a gestión de contenido (productos, categorías)
- **Clientes**: Solo pueden ver/editar sus propios datos

### 7. Próximos Pasos

1. **Ejecutar el script SQL** en Supabase
2. **Asignar rol de administrador** a tu usuario:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'tu-email@ejemplo.com';
   ```
3. **Probar el sistema**:
   - Inicia sesión con tu usuario
   - Verifica que aparece el botón "Admin" en el header
   - Accede a `/admin` y `/admin/users`
   - Prueba cambiar roles de otros usuarios

### 8. Extensiones Futuras

- Gestión de productos desde el admin
- Sistema de permisos granulares
- Logs de actividad administrativa
- Dashboard con métricas en tiempo real
- Gestión de pedidos y facturación

## Uso Básico

### Verificar rol del usuario actual
```typescript
import { useRole } from '../hooks/useRole'

function MyComponent() {
  const { role, isAdmin, loading } = useRole()
  
  if (loading) return <div>Cargando...</div>
  
  return (
    <div>
      <p>Tu rol: {role}</p>
      {isAdmin && <AdminPanel />}
    </div>
  )
}
```

### Proteger rutas por rol
```typescript
<RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
  <AdminComponent />
</RoleProtectedRoute>
```

### Verificar permisos específicos
```typescript
const { hasPermission } = useRole()

const canManageProducts = await hasPermission('manage_products')
if (canManageProducts) {
  // Mostrar opciones de gestión
}
```
