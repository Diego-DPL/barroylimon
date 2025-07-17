# Guía de Instalación - Sistema de Códigos de Descuento

## 📋 Script de Corrección Completo

⚠️ **IMPORTANTE**: Tu base de datos ya tiene las tablas de códigos de descuento implementadas. Solo necesitas ejecutar el script de corrección:

### **Script Único a Ejecutar**
```sql
-- Archivo: /database/fix-discount-system-complete.sql
-- Corrige las funciones existentes y adapta el sistema al esquema actual
```

## 🔧 Diferencias Identificadas en tu Esquema

Tu base de datos ya tiene implementado:
- ✅ Tabla `discount_codes` con todas las columnas necesarias
- ✅ Tabla `discount_code_uses` con columna `discount_amount`
- ✅ Tabla `orders` con columnas de descuento (`discount_code_id`, `discount_amount`, `subtotal_amount`)
- ✅ Foreign keys y constrains correctos

## � Lo que Corrige el Script

1. **Elimina y recrea** la función `register_discount_code_usage` con tipo de retorno correcto
2. **Adapta las funciones** al esquema existente de tu base de datos
3. **Añade trigger automático** para mantener actualizado el `usage_count`
4. **Incluye función de estadísticas** que funciona con tu esquema
5. **Añade códigos de ejemplo** si no existen

## ✅ Verificar Instalación

Después de ejecutar el script:

```sql
-- Verificar que las funciones funcionan correctamente
SELECT validate_discount_code('BIENVENIDO10', 100.00);

-- Probar registro de uso (solo si tienes un código válido)
SELECT register_discount_code_usage(
    (SELECT id FROM discount_codes WHERE code = 'BIENVENIDO10' LIMIT 1),
    NULL,
    10.00
);
```

## 🎁 Códigos Disponibles

El script añadirá estos códigos si no existen:
- **BIENVENIDO10** - 10% de descuento, uso ilimitado
- **PRIMERA20** - 20% para primeros usuarios, un solo uso  
- **VERANO5** - 5€ de descuento fijo
- **VERANO2025** - 15% descuento de verano (hasta septiembre 2025)

## 🔍 Solución de Problemas

### Error: "cannot change return type of existing function"
- ✅ **Solucionado**: El script incluye `DROP FUNCTION` antes de recrear

### Error 400 en discount_code_uses
- ✅ **Solucionado**: Nueva función adaptada al esquema existente

### Contador usage_count no se actualiza
- ✅ **Solucionado**: Trigger automático para mantener sincronizados los contadores
