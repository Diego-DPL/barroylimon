# 🚀 Rama de Desarrollo - Barro y Limón

Esta es la rama **develop** donde se realizan todas las nuevas funcionalidades y mejoras antes de ser integradas a la rama **main**.

## 📋 Flujo de Trabajo

### 🌿 Estructura de Ramas
- **`main`** - Código de producción estable
- **`develop`** - Rama de desarrollo (actual)
- **`feature/*`** - Ramas para nuevas funcionalidades
- **`hotfix/*`** - Correcciones urgentes para producción

### 🔄 Proceso de Desarrollo
1. **Crear feature branch** desde `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar y hacer commits**
   ```bash
   git add .
   git commit -m "feat: descripción de la nueva funcionalidad"
   ```

3. **Crear Pull Request** hacia `develop`
4. **Merge a develop** después de revisión
5. **Deploy a main** cuando develop esté estable

## 🎯 Próximas Funcionalidades Planificadas

### 📱 Funcionalidades Pendientes
- [ ] **Sistema de navegación** entre páginas
- [ ] **Catálogo de productos** completo
- [ ] **Carrito de compras** funcional
- [ ] **Sistema de autenticación** de usuarios
- [ ] **Panel de administración** para productos
- [ ] **Integración de pagos** (Stripe/PayPal)
- [ ] **Blog/Noticias** sobre el proceso artesanal
- [ ] **Galería de imágenes** del proceso de creación
- [ ] **Formulario de contacto** funcional
- [ ] **Optimización SEO** y meta tags

### 🎨 Mejoras de Diseño
- [ ] **Animaciones** y transiciones suaves
- [ ] **Modo oscuro** opcional
- [ ] **Responsive design** mejorado para tablet
- [ ] **Lazy loading** de imágenes
- [ ] **Optimización de performance**

### 🔧 Mejoras Técnicas
- [ ] **Testing** con Vitest y React Testing Library
- [ ] **Storybook** para documentar componentes
- [ ] **PWA** (Progressive Web App)
- [ ] **Internacionalización** (i18n)
- [ ] **Analytics** y métricas de usuario

## 🛠️ Scripts de Desarrollo

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Deployment a Vercel
vercel --prod
```

## 📝 Convenciones de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `refactor:` Refactoring de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## 🌟 Estado Actual

✅ **Completado:**
- Configuración inicial React + Vite + TypeScript
- Tailwind CSS 4.1 integrado
- Página Home con diseño responsive
- Componentes UI básicos (Button, Input)
- Estructura de proyecto organizada
- Repositorio Git configurado

🔄 **En desarrollo:**
- Correcciones de deploy en Vercel
- Optimización de imágenes y assets
