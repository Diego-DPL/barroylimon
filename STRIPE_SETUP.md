# Configuración de Stripe para Barro y Limón

## Configuración Inicial

### ⚠️ ORDEN IMPORTANTE DE CONFIGURACIÓN

1. **Crear cuenta de Stripe** y obtener claves API
2. **Configurar variables de entorno del frontend** (.env)
3. **Las Edge Functions ya están desplegadas** ✅
4. **Crear webhook en Stripe** (para obtener el webhook secret)
5. **Configurar variables de entorno en Supabase** (con el webhook secret)
6. **Probar la integración**

### 1. Crear cuenta de Stripe
1. Ve a [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crea una cuenta de Stripe
3. Verifica tu email y completa la configuración básica

### 2. Obtener las claves de API

#### Para Producción (Cuenta Activada) 🔴 IMPORTANTE
1. En el dashboard de Stripe, **asegúrate de que el toggle esté en "Live" (no "Test")**
2. Ve a **Developers > API keys**
3. Copia la **Publishable key** (empieza con `pk_live_`)
4. Copia la **Secret key** (empieza con `sk_live_`)

#### Para Pruebas (Opcional - Mantener entorno de testing)
1. En el dashboard de Stripe, cambia el toggle a **"Test"**
2. Ve a **Developers > API keys**
3. Copia la **Publishable key** (empieza con `pk_test_`)
4. Copia la **Secret key** (empieza con `sk_test_`)

### 3. Configurar variables de entorno

#### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
```

#### Supabase Edge Functions
En Supabase Dashboard > Project Settings > Edge Functions > Environment Variables, añade:
```
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
```
(El webhook secret lo obtienes DESPUÉS de crear el webhook en el paso 4)

### 4. Configurar webhook de Stripe
1. En Stripe Dashboard, ve a **Developers > Webhooks**
2. Haz clic en **Add endpoint**
3. URL del endpoint: `https://fryhuomvlpzhrmkttahv.supabase.co/functions/v1/stripe-webhook`
4. Selecciona estos eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Haz clic en **Add endpoint**
6. **IMPORTANTE**: Una vez creado, haz clic en el webhook que acabas de crear
7. Ve a la sección **Signing secret** y haz clic en **Reveal**
8. Copia el valor que empieza con `whsec_` 
9. Este es tu `STRIPE_WEBHOOK_SECRET`

### 5. Configurar variables de entorno en Supabase

Ahora ve a Supabase Dashboard:
1. Ve a **Project Settings > Edge Functions**
2. En la sección **Environment Variables**, añade:
   ```
   STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
   STRIPE_WEBHOOK_SECRET=whsec_el_secret_que_copiaste_del_webhook
   ```

### 6. ✅ Edge Functions Desplegadas

Las Edge Functions ya están desplegadas y funcionando:
- ✅ **create-payment-intent**: `https://fryhuomvlpzhrmkttahv.supabase.co/functions/v1/create-payment-intent`
- ✅ **stripe-webhook**: `https://fryhuomvlpzhrmkttahv.supabase.co/functions/v1/stripe-webhook`

### 7. Configurar políticas RLS para orders
```sql
-- Política para permitir que los usuarios lean sus propios pedidos
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que los usuarios creen pedidos
CREATE POLICY "Users can create orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que el webhook pueda actualizar pedidos
CREATE POLICY "Service role can update orders" ON orders
FOR UPDATE USING (true);
```

## Flujo de Pago

1. **Usuario completa formulario de envío** → Crea orden en estado "pending"
2. **Sistema crea Payment Intent** → Stripe genera el client_secret
3. **Usuario completa pago** → Stripe procesa la transacción
4. **Webhook confirma pago** → Actualiza orden a "confirmed"
5. **Sistema actualiza stock** → Resta cantidad de productos
6. **Usuario ve confirmación** → Modal de agradecimiento

## Métodos de Pago Disponibles

- 💳 Tarjetas de crédito/débito (Visa, Mastercard, American Express)
- 🏦 SEPA Direct Debit (para España)
- 📱 Google Pay / Apple Pay
- 🔒 Autenticación 3D Secure automática

## Seguridad

- ✅ Cifrado SSL/TLS end-to-end
- ✅ Cumplimiento PCI DSS Nivel 1
- ✅ Autenticación 3D Secure
- ✅ Protección contra fraude
- ✅ Webhooks firmados criptográficamente

## ⚠️ IMPORTANTE: Transición de Test a Producción

### Diferencias entre Test y Live
- **Test Mode**: Usa tarjetas ficticias, no se cobran pagos reales
- **Live Mode**: Cobra pagos reales a tarjetas reales

### Configuración Dual (Recomendado para desarrollo)
Puedes mantener ambos entornos configurando variables separadas:

```env
# Producción
VITE_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_tu_clave_real
VITE_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_tu_clave_prueba

# Usar una u otra según el entorno
VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY_LIVE}
```

### Webhooks separados
- **Test webhook**: Para modo desarrollo
- **Live webhook**: Para producción (diferente signing secret)

## Testing

### Con Claves de Producción (Live)
⚠️ **NO uses las tarjetas de prueba siguientes con claves de producción** - Serán rechazadas

### Con Claves de Test
Para probar en modo desarrollo, usa estas tarjetas de prueba:

### Pagos exitosos
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

### Pagos fallidos
- **Tarjeta rechazada**: 4000 0000 0000 0002
- **Fondos insuficientes**: 4000 0000 0000 9995
- **Tarjeta expirada**: 4000 0000 0000 0069

### Datos de prueba
- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos (4 para Amex)
- **Código postal**: Cualquier código válido

## Monitorización

- 📊 Dashboard de Stripe para ver transacciones
- 📧 Notificaciones automáticas por email
- 🔍 Logs detallados en Supabase Edge Functions
- 📈 Métricas de conversión y abandono

## Solución de Problemas Comunes

### Error de telemetría de Stripe (No crítico)
```
FetchError: Error fetching https://r.stripe.com/b: Failed to fetch
```
**Causa**: Error interno de telemetría/analytics de Stripe
**Solución**: Este error NO afecta el funcionamiento del pago. Es seguro ignorarlo.
**Estado**: El pago se procesa correctamente a pesar de este error.

### Error 400 en discount_code_uses
```
POST .../discount_code_uses 400 (Bad Request)
```
**Causa**: Función de registro de uso de códigos de descuento no actualizada
**Solución**: Ejecutar el script `/database/fix-discount-usage-function.sql`
**Estado**: Los pagos funcionan, pero el uso del código no se registra correctamente.

## Soporte

Para problemas con la integración:
1. Revisa los logs en Supabase Dashboard
2. Verifica los eventos en Stripe Dashboard
3. Consulta la documentación oficial de Stripe
4. Contacta con soporte técnico si es necesario
