#!/bin/bash

# Script para configurar webhooks de Telegram en producción
# Uso: ./scripts/setup-webhooks.sh

set -e

echo "🤖 Finance Bot - Configuración de Webhooks"
echo "=========================================="
echo ""

# Verificar que exista el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "   Crea un archivo .env con tus variables de entorno"
    exit 1
fi

# Cargar variables de entorno
export $(cat .env | grep -v '^#' | xargs)

# Verificar que TELEGRAM_TOKEN esté definido
if [ -z "$TELEGRAM_TOKEN" ]; then
    echo "❌ Error: TELEGRAM_TOKEN no está definido en .env"
    exit 1
fi

# Solicitar la URL de producción
echo "📝 Ingresa la URL de tu aplicación en Railway:"
echo "   Ejemplo: https://finance-bot-production.up.railway.app"
read -p "URL: " PRODUCTION_URL

# Eliminar trailing slash si existe
PRODUCTION_URL=${PRODUCTION_URL%/}

# Validar que la URL no esté vacía
if [ -z "$PRODUCTION_URL" ]; then
    echo "❌ Error: La URL no puede estar vacía"
    exit 1
fi

echo ""
echo "🔄 Configurando webhook de Telegram..."
echo "   URL del webhook: ${PRODUCTION_URL}/webhook/telegram"
echo ""

# Configurar webhook de Telegram
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${PRODUCTION_URL}/webhook/telegram")

# Verificar si la respuesta contiene "ok":true
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook de Telegram configurado correctamente"
else
    echo "❌ Error al configurar webhook de Telegram"
    echo "   Respuesta: $RESPONSE"
    exit 1
fi

echo ""
echo "🔍 Verificando configuración..."
echo ""

# Verificar webhook
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo")

# Mostrar información del webhook
echo "📊 Información del webhook:"
echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4
echo ""

# Verificar que la URL del bot esté activa
echo "🌐 Verificando que el bot esté en línea..."
STATUS_RESPONSE=$(curl -s "${PRODUCTION_URL}/api/status" || echo "FAILED")

if echo "$STATUS_RESPONSE" | grep -q '"status":"healthy"'; then
    echo "✅ El bot está en línea y respondiendo"

    # Mostrar versión
    VERSION=$(echo "$STATUS_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    UPTIME=$(echo "$STATUS_RESPONSE" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)

    echo "   Versión: $VERSION"
    echo "   Uptime: ${UPTIME}s"
else
    echo "⚠️  Advertencia: No se pudo verificar el estado del bot"
    echo "   Verifica que la URL sea correcta y que el bot esté desplegado"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📱 Próximos pasos:"
echo "   1. Abre Telegram"
echo "   2. Busca tu bot"
echo "   3. Envía el comando: ayuda"
echo "   4. El bot debería responder inmediatamente"
echo ""
echo "🔗 URLs útiles:"
echo "   - Homepage: ${PRODUCTION_URL}/"
echo "   - Documentación: ${PRODUCTION_URL}/docs"
echo "   - Comandos: ${PRODUCTION_URL}/commands"
echo "   - API Status: ${PRODUCTION_URL}/api/status"
echo ""
