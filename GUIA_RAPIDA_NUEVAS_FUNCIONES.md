# 🚀 Guía Rápida - Nuevas Funciones del Finance Bot

## 📋 Índice Rápido

1. [Página de Comandos con Búsqueda](#1-página-de-comandos-con-búsqueda)
2. [Changelog de Versiones](#2-changelog-de-versiones)
3. [API de Estadísticas](#3-api-de-estadísticas)
4. [Configurar Analytics (Opcional)](#4-configurar-analytics-opcional)

---

## 1. Página de Comandos con Búsqueda

### 🔗 URL: `/commands`

Visita `http://localhost:3000/commands` para ver todos los comandos disponibles.

### Características:

✅ **Búsqueda en tiempo real** - Escribe para filtrar comandos instantáneamente
✅ **Click to copy** - Haz click en cualquier ejemplo para copiarlo
✅ **7 comandos documentados** - Todos los comandos del bot con ejemplos
✅ **Tags inteligentes** - Busca por acción, concepto o nombre

### Ejemplos de búsqueda:

- Escribe `ingreso` → Muestra el comando para registrar ingresos
- Escribe `crear` → Muestra comandos de creación
- Escribe `saldo` → Muestra cómo consultar el saldo
- Escribe `listar` → Muestra comandos de listado

---

## 2. Changelog de Versiones

### 🔗 URL: `/changelog`

Visita `http://localhost:3000/changelog` para ver el historial de cambios.

### Qué Encontrarás:

📌 **v1.1.0** - Mejoras Críticas de Producción (Oct 14, 2025)
- Aislamiento de usuarios
- Rate limiting mejorado
- Validación de configuración
- Web de documentación
- Auto-registro de usuarios

📌 **v1.0.0** - Lanzamiento Inicial (Sep 16, 2025)
- Funcionalidades core del bot
- Multi-plataforma (Telegram/WhatsApp)
- Gestión de presupuestos

📌 **Roadmap** - Funcionalidades futuras
- Reportes mensuales
- Metas de ahorro
- Alertas de presupuesto
- Exportación a CSV
- Gráficas de gastos

---

## 3. API de Estadísticas

### 🔗 URL: `/api/stats` (Protegido)

Este endpoint retorna estadísticas básicas del bot, pero está protegido con un token de administrador.

### Configuración:

1. Agrega el token a tu archivo `.env`:

```env
ADMIN_TOKEN=tu-token-secreto-aqui
```

2. Reinicia el servidor:

```bash
npm run build
npm start
```

### Uso:

```bash
# ❌ Sin token - Rechazado
curl http://localhost:3000/api/stats

# Respuesta:
# {"error":"Unauthorized","message":"Invalid or missing admin token"}

# ✅ Con token válido
curl -H "Authorization: Bearer tu-token-secreto-aqui" http://localhost:3000/api/stats

# Respuesta:
# {
#   "timestamp": "2025-10-14T22:45:59.093Z",
#   "stats": {
#     "users": 5,
#     "budgets": 12,
#     "movements": 147
#   }
# }
```

### Estadísticas Disponibles:

- `users` - Total de usuarios registrados
- `budgets` - Total de presupuestos creados
- `movements` - Total de movimientos (ingresos + gastos)

**Nota**: Este endpoint solo ejecuta queries cuando lo llamas. No consume recursos continuamente.

---

## 4. Configurar Analytics (Opcional)

Si quieres rastrear visitas a tu web de documentación:

### Opción 1: Google Analytics 4 (Gratis)

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una cuenta y propiedad
3. Obtén tu Measurement ID (formato: `G-XXXXXXXXXX`)
4. Abre `src/views/analytics.html`
5. Reemplaza `G-XXXXXXXXXX` con tu ID real
6. Incluye el script en tus páginas HTML:

```html
<!-- Antes de cerrar </head> -->
<script src="/views/analytics.html"></script>
```

### Opción 2: Plausible Analytics (Más Privacidad)

1. Ve a [Plausible.io](https://plausible.io/)
2. Crea una cuenta (desde $9/mes)
3. Agrega tu dominio
4. Usa el script que te dan:

```html
<script defer data-domain="tudominio.com" src="https://plausible.io/js/script.js"></script>
```

**Impacto**: ~0.01% CPU, 0 MB RAM (corre en el navegador del usuario)

---

## 📊 Todas las URLs del Bot

| URL | Descripción | Público |
|-----|-------------|---------|
| `/` | Homepage con información del bot | ✅ Sí |
| `/docs` | Documentación completa | ✅ Sí |
| `/commands` | Búsqueda de comandos | ✅ Sí |
| `/changelog` | Historial de versiones | ✅ Sí |
| `/api/status` | Estado del bot | ✅ Sí |
| `/api/stats` | Estadísticas del bot | 🔒 Requiere token |

---

## 🎯 Características de las Nuevas Páginas

### Diseño iOS 18

Todas las páginas usan un diseño minimalista inspirado en iOS 18:

- **Color primario**: Emerald green (#10b981) - representa crecimiento financiero
- **Tipografía**: San Francisco (Inter como fallback)
- **Espaciado**: Sistema de espaciado consistente
- **Sombras**: Suaves y sutiles
- **Responsive**: Se adapta a móviles y tablets
- **Dark mode ready**: Soporte para modo oscuro

### Rendimiento

- **HTML estático**: Sin frameworks pesados
- **JavaScript vanilla**: Sin jQuery ni librerías externas
- **CSS modular**: Design system con custom properties
- **Tamaño pequeño**: Todas las páginas < 20 KB
- **Carga rápida**: Sin dependencias externas

---

## 🔧 Comandos Útiles

```bash
# Compilar cambios
npm run build

# Iniciar servidor
npm start

# Ver logs del servidor
# (el servidor muestra logs en consola)

# Verificar que el bot esté funcionando
curl http://localhost:3000/api/status

# Verificar que las páginas carguen
curl http://localhost:3000/commands | grep "command-card"

# Matar procesos en puerto 3000
lsof -ti:3000 | xargs kill -9
```

---

## ✅ Checklist de Verificación

Después de compilar y arrancar el servidor:

- [ ] `/` carga correctamente
- [ ] `/docs` muestra la documentación
- [ ] `/commands` muestra la búsqueda de comandos
- [ ] `/changelog` muestra las versiones
- [ ] `/api/status` retorna JSON con estado "healthy"
- [ ] `/api/stats` sin token retorna error 401
- [ ] La navegación funciona entre todas las páginas
- [ ] El bot responde en Telegram/WhatsApp
- [ ] El rate limiting funciona (máx 10 mensajes/minuto)

---

## 🚨 Troubleshooting

### El servidor no arranca

```bash
# 1. Verifica que MongoDB esté corriendo
mongosh --eval "db.adminCommand('ping')"

# 2. Verifica las variables de entorno
cat .env

# 3. Mata procesos anteriores
lsof -ti:3000 | xargs kill -9

# 4. Recompila
npm run build

# 5. Inicia de nuevo
npm start
```

### Las páginas no cargan

```bash
# Verifica que los archivos estén compilados
ls -lh dist/views/

# Deberías ver:
# - index.html
# - docs.html
# - commands.html
# - changelog.html
# - analytics.html

# Si faltan, ejecuta:
npm run build
```

### El bot no responde en Telegram

```bash
# 1. Verifica que el webhook esté configurado
curl "https://api.telegram.org/bot<TU_TOKEN>/getWebhookInfo"

# 2. Si estás en local, usa localtunnel
lt --port 3000

# 3. Configura el webhook con la URL del tunnel
curl -X POST "https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://tu-tunnel.loca.lt/webhook/telegram"
```

---

## 📚 Recursos Adicionales

- **Documentación completa**: `/docs`
- **Lista de comandos**: `/commands`
- **Historial de cambios**: `/changelog`
- **Estado del bot**: `/api/status`

---

**Versión**: v1.1.0
**Última actualización**: Octubre 14, 2025
**Paquete**: Minimalista Completo ✅
