# 💰 Finance Bot

Bot de Telegram y WhatsApp para gestión de finanzas personales. Registra tus ingresos, gastos y consulta el estado de tus presupuestos en segundos.

![Version](https://img.shields.io/badge/version-1.1.0-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Características

- 📊 **Múltiples presupuestos** - Organiza tus finanzas por categorías
- 💸 **Registro rápido** - Anota ingresos y gastos en segundos
- 📱 **Multi-plataforma** - Funciona en Telegram y WhatsApp
- 🔒 **Seguro** - Aislamiento de usuarios y rate limiting
- ⚡ **Rápido** - Respuestas instantáneas
- 🌐 **Documentación web** - Interface moderna para consultar comandos

## 🚀 Inicio Rápido

### Telegram

1. Busca el bot en Telegram: `@TuFinanceBot`
2. Envía `/start` o `ayuda`
3. Sigue las instrucciones

### Comandos Principales

```
ayuda                              - Ver todos los comandos
crear presupuesto casa 10000      - Crear presupuesto con saldo inicial
ingreso casa 5000 sueldo          - Registrar ingreso
gasto casa 500 comida             - Registrar gasto
saldo casa                         - Ver estado del presupuesto
listar presupuestos               - Ver todos tus presupuestos
```

## 📖 Documentación

- **Deploy a Producción**: [DEPLOY_PRODUCCION.md](DEPLOY_PRODUCCION.md)
- **Paquete Minimalista**: [PAQUETE_MINIMALISTA_COMPLETO.md](PAQUETE_MINIMALISTA_COMPLETO.md)
- **Guía Rápida**: [GUIA_RAPIDA_NUEVAS_FUNCIONES.md](GUIA_RAPIDA_NUEVAS_FUNCIONES.md)
- **Mejoras V2**: [MEJORAS_V2_IMPLEMENTADAS.md](MEJORAS_V2_IMPLEMENTADAS.md)

## 🛠️ Desarrollo

### Prerrequisitos

- Node.js 18+
- MongoDB 5+
- npm o yarn

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/finance-bot.git
cd finance-bot

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env con:
MONGO_URI=mongodb://localhost:27017/financebot
PORT=3000
TELEGRAM_TOKEN=tu_token_de_telegram

# Compilar
npm run build

# Iniciar
npm start
```

### Variables de Entorno

```env
# MongoDB (requerido)
MONGO_URI=mongodb://localhost:27017/financebot

# Puerto (opcional, default: 3000)
PORT=3000

# Telegram (requerido si usas Telegram)
TELEGRAM_TOKEN=tu_token_de_telegram

# WhatsApp (opcional)
WHATSAPP_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_ID=tu_phone_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token

# Admin API (opcional, para /api/stats)
ADMIN_TOKEN=tu_token_secreto
```

### Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Compilar TypeScript
npm start        # Iniciar en producción
```

## 🚀 Deploy a Producción

Este bot está optimizado para deploy gratuito en **Railway + MongoDB Atlas**.

Ver la [Guía completa de deployment](DEPLOY_PRODUCCION.md) para instrucciones paso a paso.

### Opciones de Hosting Gratuito

| Plataforma | RAM | Uptime | Recomendación |
|------------|-----|--------|---------------|
| Railway    | 512 MB | 24/7 | ⭐ Recomendado |
| Fly.io     | 256 MB | 24/7 | ✅ Alternativa |
| Render     | 512 MB | Duerme 15min | ⚠️ No ideal para bots |

## 🏗️ Arquitectura

```
finance-bot/
├── src/
│   ├── application/        # Lógica de negocio
│   │   ├── handlers.ts     # Handlers de comandos
│   │   ├── messageProcessor.ts
│   │   └── parser.ts       # Parseador de lenguaje natural
│   ├── domain/             # Modelos de dominio
│   │   └── types.ts
│   ├── infrastructure/     # Capa de datos
│   │   ├── mongo.ts        # Conexión MongoDB
│   │   ├── repositories.ts # Repos de budgets/movements
│   │   ├── userRepository.ts
│   │   └── format.ts       # Formateo de mensajes
│   ├── routes/             # API y webhooks
│   │   ├── webhook-telegram.ts
│   │   ├── webhook-wpp.ts
│   │   └── web.ts          # Rutas de documentación
│   ├── utils/              # Utilidades
│   │   └── rateLimit.ts
│   ├── public/             # Assets estáticos
│   │   ├── css/
│   │   └── js/
│   ├── views/              # Templates HTML
│   │   ├── index.html
│   │   ├── docs.html
│   │   ├── commands.html
│   │   └── changelog.html
│   ├── config.ts           # Configuración con Zod
│   └── index.ts            # Entry point
├── dist/                   # Build output (generado)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Seguridad

- ✅ Aislamiento de usuarios (cada usuario ve solo sus datos)
- ✅ Rate limiting (10 mensajes/minuto)
- ✅ Validación de configuración con Zod
- ✅ Variables de entorno para secretos
- ✅ API de estadísticas protegida con token
- ✅ HTTPS automático en producción

## 📊 Recursos

### Uso en Producción (Railway Free Tier)

- **RAM**: ~50-100 MB (de 512 MB disponibles)
- **CPU**: <5% promedio
- **Usuarios soportados**: Cientos (limitado por rate limiting)
- **Base de datos**: MongoDB Atlas M0 (512 MB gratis)

## 📝 Comandos Soportados

- `ayuda` → muestra el listado de comandos
- `presupuestos` → lista todos los presupuestos con su saldo actual
- `crear presupuesto <nombre> [monto inicial]` → crea un presupuesto nuevo
- `saldo <presupuesto>` o `estado <presupuesto>` → muestra el estado detallado
- `movimientos <presupuesto> [limite]` → últimos movimientos registrados (por defecto 5)
- `ingreso <presupuesto> <monto> <descripcion> [| categoria]` → registra un ingreso
- `gasto <presupuesto> <monto> <descripcion> [| categoria]` → registra un gasto

**Notas**:
- Puedes referenciar un presupuesto por nombre, slug o identificador
- Si el nombre tiene espacios, envuélvelo entre comillas
- Para asignar una categoría, añade `| categoria` o `#categoria`

## 🌐 URLs de la Web

Cuando el bot esté desplegado, tendrás acceso a:

- `/` - Homepage con información del bot
- `/docs` - Documentación completa
- `/commands` - Búsqueda interactiva de comandos
- `/changelog` - Historial de versiones
- `/api/status` - Estado del bot (público)
- `/api/stats` - Estadísticas (protegido con token)

## 📝 Changelog

### v1.1.0 - Mejoras Críticas de Producción (2025-10-14)

- ✅ Aislamiento de usuarios
- ✅ Rate limiting mejorado con ventana deslizante
- ✅ Validación de configuración con Zod
- ✅ Web de documentación (iOS 18 design)
- ✅ API de status y estadísticas
- ✅ Auto-registro de usuarios
- ✅ Fix de módulos ESM

### v1.0.0 - Lanzamiento Inicial (2025-09-16)

- ✅ Múltiples presupuestos
- ✅ Registro de ingresos y gastos
- ✅ Consulta de saldos
- ✅ Soporte Telegram y WhatsApp
- ✅ Backend con MongoDB

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Finance Bot Team**

---

**Versión actual**: v1.1.0 | [Documentación completa](DEPLOY_PRODUCCION.md) | [Deploy Guide](DEPLOY_PRODUCCION.md)
