#!/bin/bash

# Script para configurar el sistema de emails de confirmación con Mailgun
# Ejecutar desde la raíz del proyecto

echo "🚀 Configurando sistema de emails de confirmación con Mailgun..."

# 1. Ejecutar el script de configuración de la base de datos
echo "📊 Configurando base de datos..."
echo "📧 Añadiendo columnas de tracking de emails..."
echo "ℹ️  Ejecuta manualmente en Supabase SQL Editor: database/setup-email-tracking.sql"

# 2. Desplegar la Edge Function
echo "🌐 Desplegando Edge Function para envío de emails..."
supabase functions deploy send-order-email

# 3. Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
echo ""
echo "✅ CONFIGURACIÓN MAILGUN EXISTENTE:"
echo "Ya tienes configurado Mailgun para newsletters y registro."
echo "Las variables de entorno necesarias ya están configuradas:"
echo "  - MAILGUN_API_KEY"
echo "  - MAILGUN_DOMAIN"
echo "  - SENDER_EMAIL"
echo ""
echo "🔄 REUTILIZANDO CONFIGURACIÓN EXISTENTE:"
echo "El sistema de emails de confirmación usará la misma configuración"
echo "que ya tienes para newsletters y emails de bienvenida."
echo ""

# 4. Verificar configuración
echo "✅ Verificando configuración..."

# Comprobar si la función se desplegó correctamente
echo "🔍 Verificando Edge Function..."
supabase functions list

echo ""
echo "✨ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. ✅ Mailgun ya está configurado (reutilizando configuración existente)"
echo "2. 🔄 Aplicar script de BD: database/setup-email-tracking.sql"
echo "3. 🧪 Probar el flujo completo de checkout"
echo ""
echo "🧪 Para probar:"
echo "1. Hacer un pedido de prueba"
echo "2. Verificar que se envía el email de confirmación"
echo "3. Comprobar en Supabase que email_sent=true en la tabla orders"
echo ""
echo "📧 Emails se enviarán desde: ${SENDER_EMAIL:-'info@barrolimon.com'}"
echo "🌐 Usando dominio: ${MAILGUN_DOMAIN:-'barrolimon.com'}"
echo ""
