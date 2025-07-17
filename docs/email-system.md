# Sistema de Emails de Confirmación con Mailgun

## Descripción
Sistema automatizado de envío de emails de confirmación para pedidos en Barro y Limón, integrado con Supabase Edge Functions y Mailgun API (reutilizando la configuración existente para newsletters).

## Arquitectura

### Componentes
1. **Edge Function** (`/supabase/functions/send-order-email/index.ts`)
   - Función serverless que maneja el envío de emails
   - Integrada con Mailgun API para delivery (reutilizando configuración existente)
   - Incluye plantilla HTML completa del email

2. **Base de Datos** 
   - Columnas añadidas a `orders`: `email_sent`, `email_sent_at`
   - Función `mark_email_as_sent(order_id)` para tracking

3. **Frontend Integration**
   - Servicio `emailService.ts` para llamadas a la Edge Function
   - Integración en `CheckoutForm.tsx` después del pago exitoso

## Configuración

### 1. Variables de Entorno
✅ **YA CONFIGURADAS** - Reutilizando configuración existente de Mailgun:
```
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=barrolimon.com
SENDER_EMAIL=info@barrolimon.com
```

### 2. Configuración de Mailgun
✅ **YA CONFIGURADA** - Usando la misma configuración que newsletters:
- Cuenta de Mailgun activa
- Dominio verificado y configurado
- DNS records (SPF, DKIM, DMARC) ya configurados

### 3. Despliegue
```bash
# Ejecutar script de configuración
./scripts/setup-email-system.sh

# O manualmente:
supabase functions deploy send-order-email
```

## Uso

### Flujo Automático
1. Cliente completa checkout y pago
2. `handlePaymentSuccess` se ejecuta
3. Se actualiza stock y registra descuentos
4. Se llama `sendOrderConfirmationEmail`
5. Edge Function procesa el email
6. Se marca como enviado en la base de datos

### Llamada Manual
```typescript
import { sendOrderConfirmationEmail } from '../utils/emailService'

const result = await sendOrderConfirmationEmail({
  orderId: 'uuid-del-pedido',
  customerEmail: 'cliente@email.com'
})

if (result.success) {
  console.log('Email enviado')
} else {
  console.error('Error:', result.error)
}
```

## Plantilla de Email

### Contenido Incluido
- **Header**: Logo y branding de Barro y Limón
- **Información del Pedido**: Número, fecha, total
- **Datos del Cliente**: Nombre, email
- **Dirección de Envío**: Completa con todos los campos
- **Productos**: Lista detallada con imágenes, nombres, precios
- **Resumen de Precios**: Subtotal, descuentos, total
- **Footer**: Información de contacto y enlaces

### Responsive Design
- Mobile-first approach
- Tabla compatible con clientes de email
- Colores consistentes con la marca
- Tipografía legible en todos los dispositivos

## Base de Datos

### Nuevas Columnas en `orders`
```sql
email_sent BOOLEAN DEFAULT FALSE
email_sent_at TIMESTAMPTZ
```

### Función Helper
```sql
mark_email_as_sent(order_id UUID) RETURNS BOOLEAN
```

### Indices
```sql
CREATE INDEX idx_orders_email_sent ON orders(email_sent, email_sent_at);
```

## Testing

### 1. Prueba Completa
1. Realizar pedido completo en el frontend
2. Verificar que se procesa el pago
3. Comprobar recepción del email
4. Verificar en DB que `email_sent = true`

### 2. Prueba Directa de Edge Function
```bash
curl -X POST \
  'https://tu-proyecto.supabase.co/functions/v1/send-order-email' \
  -H 'Authorization: Bearer tu-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "orderId": "uuid-del-pedido",
    "customerEmail": "test@email.com"
  }'
```

### 3. Logs y Debugging
- Ver logs en Supabase Dashboard > Edge Functions > Logs
- Comprobar errores en la consola del navegador
- Verificar estado en tabla `orders`
- Verificar delivery en Mailgun Dashboard > Logs

## Troubleshooting

### Email No Se Envía
1. **Verificar configuración Mailgun**: Comprobar que las variables de entorno están configuradas
2. **Logs de Edge Function**: Revisar errores en Supabase Dashboard
3. **Datos del Pedido**: Verificar que el order_id existe y tiene datos completos
4. **Límites de Mailgun**: Comprobar quotas en Mailgun Dashboard

### Email Llega a Spam
✅ **Problema resuelto** - Usando dominio configurado con SPF/DKIM de Mailgun existente

### Performance
- Edge Function: ~200-500ms típico
- Mailgun API: ~100-300ms típico
- Total: <1 segundo en condiciones normales

## Monitoreo

### Métricas Importantes
- Tasa de entrega de emails (success rate)
- Tiempo de respuesta de Edge Function
- Errores en logs de Supabase
- Estadísticas en Mailgun Dashboard

### Dashboards
- **Supabase**: Edge Functions > Logs
- **Mailgun**: Dashboard > Analytics & Logs

### Queries Útiles
```sql
-- Emails enviados hoy
SELECT COUNT(*) FROM orders 
WHERE email_sent = true 
AND email_sent_at >= CURRENT_DATE;

-- Emails pendientes
SELECT COUNT(*) FROM orders 
WHERE email_sent = false 
AND status = 'confirmed';

-- Tasa de éxito últimos 7 días
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent,
  ROUND(COUNT(CASE WHEN email_sent THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM orders 
WHERE created_at >= NOW() - INTERVAL '7 days';
```

## Próximas Mejoras

### Funcionalidades Pendientes
1. **Templates Adicionales**: Confirmación de envío, cancelación
2. **Reintento Automático**: Para emails fallidos
3. **Personalización**: Templates dinámicos por tipo de producto
4. **Analytics**: Tracking de opens y clicks
5. **Notificaciones Admin**: Alertas para pedidos importantes

### Optimizaciones
1. **Cache**: Cache de datos de productos en Edge Function
2. **Batch Processing**: Envío en lotes para alto volumen
3. **Queue System**: Cola de emails con retry logic
4. **A/B Testing**: Diferentes templates para optimizar conversión
