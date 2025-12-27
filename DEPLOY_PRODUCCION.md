# 🚀 Guía Completa: Deploy a Producción (Gratis)

## 📋 Índice

1. [Preparación del Proyecto](#paso-1-preparación-del-proyecto)
2. [Configurar MongoDB Atlas](#paso-2-configurar-mongodb-atlas-base-de-datos)
3. [Deploy a Railway](#paso-3-deploy-a-railway)
4. [Configurar Variables de Entorno](#paso-4-configurar-variables-de-entorno)
5. [Configurar Webhooks de Telegram](#paso-5-configurar-webhooks-de-telegram)
6. [Verificación Final](#paso-6-verificación-final)
7. [Troubleshooting](#troubleshooting)

---

## Paso 1: Preparación del Proyecto

### 1.1 Verificar que todo funcione localmente

```bash
# Compilar el proyecto
npm run build

# Iniciar el servidor
npm start

# Verificar que responda
curl http://localhost:3000/api/status
```

Si todo funciona, continúa al siguiente paso.

### 1.2 Crear archivo `.gitignore` (si no existe)

```bash
# Crear .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
.DS_Store
EOF
```

### 1.3 Inicializar repositorio Git (si no está inicializado)

```bash
# Inicializar Git
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit - Finance Bot v1.1.0"
```

### 1.4 Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `finance-bot`
3. Descripción: "Personal finance bot for WhatsApp and Telegram"
4. Público o Privado (tu elección)
5. **NO** inicialices con README (ya tienes código)
6. Click en "Create repository"

### 1.5 Subir código a GitHub

```bash
# Agregar remote (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/finance-bot.git

# Subir código
git branch -M main
git push -u origin main
```

---

## Paso 2: Configurar MongoDB Atlas (Base de Datos)

MongoDB Atlas ofrece **512 MB gratis permanentemente**.

### 2.1 Crear cuenta en MongoDB Atlas

1. Ve a [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Regístrate con email o Google
3. Selecciona el plan **M0 (Free)**
4. Región: Selecciona la más cercana a tus usuarios (ej: `us-east-1` o `sa-east-1`)
5. Nombre del cluster: `finance-bot-cluster`

### 2.2 Configurar acceso a la base de datos

#### A) Crear usuario de base de datos

1. En el panel, ve a **Database Access** (menú izquierdo)
2. Click en **Add New Database User**
3. Authentication Method: **Password**
4. Username: `financebot`
5. Password: **Genera una contraseña segura** (guárdala, la necesitarás)
   ```
   Ejemplo: kJ8$mPz2!nQx9Wr
   ```
6. Database User Privileges: **Atlas Admin** (o Read and write to any database)
7. Click en **Add User**

#### B) Permitir acceso desde Railway

1. En el panel, ve a **Network Access** (menú izquierdo)
2. Click en **Add IP Address**
3. Selecciona **Allow Access from Anywhere** (0.0.0.0/0)
   - Esto es seguro porque requiere usuario y contraseña
4. Click en **Confirm**

### 2.3 Obtener la connection string

1. Ve a **Database** (menú izquierdo)
2. Click en **Connect** en tu cluster
3. Selecciona **Connect your application**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copia la connection string:

```
mongodb+srv://financebot:<password>@finance-bot-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **IMPORTANTE**: Reemplaza `<password>` con la contraseña que generaste
8. Agrega el nombre de la base de datos al final:

```
mongodb+srv://financebot:kJ8$mPz2!nQx9Wr@finance-bot-cluster.xxxxx.mongodb.net/financebot?retryWrites=true&w=majority
```

**Guarda esta connection string**, la necesitarás en el paso 4.

---

## Paso 3: Deploy a Railway

Railway ofrece **500 horas gratis al mes** (suficiente para el bot).

### 3.1 Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app/)
2. Click en **Start a New Project**
3. Inicia sesión con GitHub (recomendado)
4. Autoriza Railway para acceder a tus repos

### 3.2 Crear nuevo proyecto

1. Click en **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Busca y selecciona tu repositorio `finance-bot`
4. Railway detectará automáticamente que es un proyecto Node.js

### 3.3 Configurar el build

Railway debería detectar automáticamente:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

Si no lo hace, configúralos manualmente:

1. Ve a **Settings** del proyecto
2. En **Build Command**: `npm run build`
3. En **Start Command**: `npm start`
4. En **Watch Paths**: deja vacío (o agrega `src/**`)

---

## Paso 4: Configurar Variables de Entorno

### 4.1 En Railway, agregar variables

1. En tu proyecto de Railway, ve a la pestaña **Variables**
2. Click en **Raw Editor**
3. Pega lo siguiente (reemplaza los valores):

```env
# MongoDB (la connection string de Atlas)
MONGO_URI=mongodb+srv://financebot:TU_PASSWORD@finance-bot-cluster.xxxxx.mongodb.net/financebot?retryWrites=true&w=majority

# Puerto (Railway usa este puerto)
PORT=3000

# Telegram Bot Token
TELEGRAM_TOKEN=7848330881:AAFr81xxxxxxxxxxxxxxxxxxxxxxxxxx

# WhatsApp (opcional)
# WHATSAPP_TOKEN=tu_token_de_whatsapp
# WHATSAPP_PHONE_ID=tu_phone_number_id
# WHATSAPP_VERIFY_TOKEN=tu_verify_token

# Admin Token (para /api/stats)
ADMIN_TOKEN=tu-token-secreto-para-stats-api
```

4. Click en **Save** o presiona `Ctrl+S`

### 4.2 Railway desplegará automáticamente

Railway detectará los cambios y empezará a:
1. Instalar dependencias (`npm install`)
2. Compilar TypeScript (`npm run build`)
3. Iniciar el servidor (`npm start`)

### 4.3 Obtener la URL de tu aplicación

1. En la pestaña **Settings** de Railway
2. Busca la sección **Domains**
3. Click en **Generate Domain**
4. Railway generará una URL como:
   ```
   https://finance-bot-production.up.railway.app
   ```

**Guarda esta URL**, la necesitarás para configurar el webhook de Telegram.

---

## Paso 5: Configurar Webhooks de Telegram

Ahora que tu bot está en producción, necesitas decirle a Telegram dónde enviarte los mensajes.

### 5.1 Configurar el webhook

Ejecuta este comando desde tu terminal local (reemplaza los valores):

```bash
# Reemplaza:
# - TU_TELEGRAM_TOKEN con tu token de bot
# - TU_URL_DE_RAILWAY con la URL generada por Railway

curl -X POST "https://api.telegram.org/botTU_TELEGRAM_TOKEN/setWebhook?url=https://TU_URL_DE_RAILWAY.railway.app/webhook/telegram"
```

**Ejemplo**:
```bash
curl -X POST "https://api.telegram.org/bot7848330881:AAFr81xxxxxxxxx/setWebhook?url=https://finance-bot-production.up.railway.app/webhook/telegram"
```

### 5.2 Verificar que el webhook esté configurado

```bash
curl "https://api.telegram.org/botTU_TELEGRAM_TOKEN/getWebhookInfo"
```

Deberías ver una respuesta como:

```json
{
  "ok": true,
  "result": {
    "url": "https://finance-bot-production.up.railway.app/webhook/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

---

## Paso 6: Verificación Final

### 6.1 Verificar que el servidor esté corriendo

```bash
# Verificar el status
curl https://TU_URL_DE_RAILWAY.railway.app/api/status
```

Deberías recibir:
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-10-14T23:00:00.000Z",
  "version": "1.1.0",
  "platforms": {
    "telegram": true,
    "whatsapp": false
  }
}
```

### 6.2 Probar el bot en Telegram

1. Abre Telegram
2. Busca tu bot (el que creaste con @BotFather)
3. Envía un mensaje: `ayuda`
4. El bot debería responder con la lista de comandos

### 6.3 Verificar logs en Railway

1. En Railway, ve a la pestaña **Deployments**
2. Click en el deployment activo
3. Verás los logs en tiempo real
4. Busca líneas como:
   ```
   [Server] Listening on port 3000
   [Web] Web routes registered
   [User] New user created: telegram:123456789
   ```

---

## 🎉 ¡Listo! Tu Bot Está en Producción

### URLs de tu aplicación:

- **Homepage**: `https://TU_URL.railway.app/`
- **Documentación**: `https://TU_URL.railway.app/docs`
- **Comandos**: `https://TU_URL.railway.app/commands`
- **Changelog**: `https://TU_URL.railway.app/changelog`
- **API Status**: `https://TU_URL.railway.app/api/status`
- **API Stats**: `https://TU_URL.railway.app/api/stats` (protegido)

### Compartir la documentación

Puedes compartir la URL de documentación con tus usuarios:
```
https://TU_URL.railway.app/docs
```

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios en tu código
# 2. Compilar localmente para verificar
npm run build

# 3. Commit y push
git add .
git commit -m "Descripción de los cambios"
git push origin main

# 4. Railway detectará el push y desplegará automáticamente
```

Railway hace **auto-deploy** cada vez que pusheas a `main`.

---

## 📊 Monitoreo de Recursos

### En Railway:

1. Ve a tu proyecto
2. Pestaña **Metrics**
3. Verás gráficas de:
   - CPU usage
   - RAM usage
   - Network usage
   - Request count

### Límites del Free Tier:

- **RAM**: 512 MB
- **CPU**: Compartido
- **Horas**: 500/mes (suficiente para estar 24/7)
- **Ancho de banda**: 100 GB/mes
- **Ejecuciones**: Ilimitadas

### Tu bot debería usar:

- **RAM**: ~50-100 MB (muy por debajo del límite)
- **CPU**: <5% promedio
- **Horas**: ~720/mes si está 24/7 (necesitarías upgrade después de ~20 días)

**Nota**: Si llegas al límite de horas, puedes agregar una tarjeta de crédito para obtener $5/mes gratis (1000 horas adicionales).

---

## 🔒 Seguridad en Producción

### ✅ Checklist de Seguridad

- [x] **MongoDB URI** está en variables de entorno (no en código)
- [x] **Tokens** están en variables de entorno
- [x] **Rate limiting** activo (10 mensajes/minuto)
- [x] **User isolation** implementado
- [x] **Config validation** con Zod
- [x] **API stats** protegido con token
- [x] **HTTPS** automático (Railway lo provee)
- [x] **MongoDB** requiere usuario y contraseña

### 🛡️ Recomendaciones Adicionales

1. **Backup de MongoDB**:
   - MongoDB Atlas hace backups automáticos
   - Puedes exportar manualmente desde el panel

2. **Monitoring**:
   - Revisa los logs en Railway regularmente
   - Configura alertas en Railway (Settings → Notifications)

3. **Admin Token**:
   - Usa un token fuerte: `openssl rand -hex 32`
   - No lo compartas públicamente

4. **Rate Limiting**:
   - Ya implementado: 10 mensajes/minuto por usuario
   - Ajusta en `src/utils/rateLimit.ts` si es necesario

---

## Troubleshooting

### Problema: El bot no responde en Telegram

**Solución**:
```bash
# 1. Verificar webhook
curl "https://api.telegram.org/botTU_TOKEN/getWebhookInfo"

# 2. Verificar logs en Railway
# Ve a Railway → Deployments → Ver logs

# 3. Reconfigurar webhook
curl -X POST "https://api.telegram.org/botTU_TOKEN/setWebhook?url=https://TU_URL.railway.app/webhook/telegram"
```

### Problema: Error de conexión a MongoDB

**Solución**:
```bash
# 1. Verificar que MONGO_URI esté correcto en Railway Variables
# 2. Verificar que la IP esté permitida (0.0.0.0/0) en MongoDB Atlas
# 3. Verificar que el usuario de DB tenga permisos
```

### Problema: Build falla en Railway

**Solución**:
```bash
# 1. Verificar que package.json tenga los scripts correctos:
#    "build": "tsc && cp -r src/public dist/ && cp -r src/views dist/"
#    "start": "node dist/index.js"

# 2. Verificar que todas las dependencias estén en package.json
npm install

# 3. Probar build localmente
npm run build
```

### Problema: Railway se queda sin horas

**Solución**:
1. Opción 1: Agregar tarjeta de crédito (obtén $5/mes gratis = 1000 horas)
2. Opción 2: Migrar a Fly.io (también tiene tier gratuito)
3. Opción 3: Usar múltiples cuentas de Railway (no recomendado)

### Problema: La web no carga estilos

**Solución**:
```bash
# Verificar que los archivos estáticos se copien en el build
# En package.json, el script debe ser:
"build": "tsc && cp -r src/public dist/ && cp -r src/views dist/"

# Verificar que existan en dist después del build:
ls -R dist/public
ls -R dist/views
```

---

## 📞 Soporte y Recursos

### Documentación Oficial:

- **Railway**: [docs.railway.app](https://docs.railway.app/)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com/)
- **Telegram Bots**: [core.telegram.org/bots](https://core.telegram.org/bots)

### Comunidad:

- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **MongoDB Community**: [community.mongodb.com](https://www.mongodb.com/community/forums/)

---

## 🎯 Checklist Final

Antes de dar por terminado el deploy:

- [ ] MongoDB Atlas configurado y conectado
- [ ] Código subido a GitHub
- [ ] Proyecto desplegado en Railway
- [ ] Variables de entorno configuradas
- [ ] Webhook de Telegram configurado
- [ ] Bot responde en Telegram
- [ ] `/api/status` retorna "healthy"
- [ ] Web de documentación carga correctamente
- [ ] Logs no muestran errores
- [ ] Rate limiting funciona (probar con 11 mensajes rápidos)

---

**Versión del Finance Bot**: v1.1.0
**Última actualización**: Octubre 14, 2025
**Autor**: Finance Bot Team

¡Felicitaciones! Tu bot está ahora en producción 🚀
