# ✅ Checklist de Deployment a Producción

Usa este checklist para asegurarte de que todo esté listo para producción.

---

## 📋 Pre-Deployment

### Preparación del Código

- [ ] El proyecto compila sin errores (`npm run build`)
- [ ] El servidor arranca localmente (`npm start`)
- [ ] El bot responde correctamente en desarrollo
- [ ] Todos los tests pasan (si tienes tests)
- [ ] El archivo `.gitignore` existe y excluye `node_modules/`, `dist/`, `.env`
- [ ] El archivo `README.md` está actualizado
- [ ] Las variables de entorno están documentadas

### Git y GitHub

- [ ] Repositorio Git inicializado (`git init`)
- [ ] Primer commit realizado
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub (`git push origin main`)
- [ ] El `.env` NO está en el repositorio (debe estar en `.gitignore`)

---

## 🗄️ Base de Datos - MongoDB Atlas

### Crear Cuenta y Cluster

- [ ] Cuenta creada en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- [ ] Plan **M0 (Free)** seleccionado
- [ ] Región cercana seleccionada (ej: `us-east-1` o `sa-east-1`)
- [ ] Cluster creado (nombre: `finance-bot-cluster`)

### Configurar Acceso

- [ ] Usuario de base de datos creado (`financebot` o similar)
- [ ] Contraseña segura generada y guardada
- [ ] Privilegios: **Atlas Admin** o **Read and write to any database**
- [ ] IP whitelist configurada: **0.0.0.0/0** (Allow access from anywhere)

### Connection String

- [ ] Connection string obtenida del cluster
- [ ] Password reemplazada en el connection string
- [ ] Nombre de base de datos agregado al final: `/financebot`
- [ ] Connection string guardada de forma segura

**Formato esperado**:
```
mongodb+srv://financebot:TU_PASSWORD@cluster.xxxxx.mongodb.net/financebot?retryWrites=true&w=majority
```

---

## 🚂 Railway - Hosting

### Crear Cuenta y Proyecto

- [ ] Cuenta creada en [Railway.app](https://railway.app/)
- [ ] Inicio de sesión con GitHub
- [ ] Railway autorizado para acceder a repos
- [ ] Nuevo proyecto creado
- [ ] Repositorio `finance-bot` seleccionado

### Configurar Build

- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Railway detectó Node.js automáticamente

### Variables de Entorno

- [ ] Variables configuradas en Railway (pestaña **Variables**)

**Variables requeridas**:
```
MONGO_URI=mongodb+srv://financebot:PASSWORD@cluster.xxxxx.mongodb.net/financebot?retryWrites=true&w=majority
PORT=3000
TELEGRAM_TOKEN=7848330881:AAFr81xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Variables opcionales**:
```
WHATSAPP_TOKEN=tu_token_whatsapp
WHATSAPP_PHONE_ID=tu_phone_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token
ADMIN_TOKEN=tu_token_secreto_para_stats
```

### Deploy

- [ ] Primer deploy completado automáticamente
- [ ] No hay errores en los logs
- [ ] Deployment muestra estado "Success"
- [ ] Dominio generado (formato: `https://xxx.up.railway.app`)

---

## 🌐 Webhooks - Telegram

### Configurar Webhook

- [ ] URL del bot en Railway copiada
- [ ] Script `scripts/setup-webhooks.sh` ejecutado, O:
- [ ] Webhook configurado manualmente con curl:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<RAILWAY_URL>/webhook/telegram"
```

### Verificar Webhook

- [ ] Webhook verificado con:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

- [ ] La respuesta muestra `"url": "https://tu-railway-url.up.railway.app/webhook/telegram"`
- [ ] `pending_update_count` es 0

---

## 🧪 Testing en Producción

### Verificar API

- [ ] `/api/status` responde con `status: "healthy"`
```bash
curl https://TU_RAILWAY_URL/api/status
```

- [ ] Homepage carga correctamente (`/`)
- [ ] Documentación carga (`/docs`)
- [ ] Comandos carga (`/commands`)
- [ ] Changelog carga (`/changelog`)

### Probar el Bot

- [ ] Bot encontrado en Telegram
- [ ] Comando `ayuda` responde correctamente
- [ ] Crear un presupuesto funciona:
```
crear presupuesto test 1000
```

- [ ] Registrar un gasto funciona:
```
gasto test 100 prueba
```

- [ ] Consultar saldo funciona:
```
saldo test
```

- [ ] Listar presupuestos funciona:
```
listar presupuestos
```

### Rate Limiting

- [ ] Enviar 11 mensajes rápidos muestra mensaje de rate limit

---

## 🔒 Seguridad

### Variables de Entorno

- [ ] Ningún token está hardcodeado en el código
- [ ] El archivo `.env` está en `.gitignore`
- [ ] Las variables están configuradas solo en Railway

### MongoDB

- [ ] La connection string usa autenticación (usuario/password)
- [ ] El usuario de DB tiene permisos mínimos necesarios
- [ ] No hay queries peligrosas sin validación

### API

- [ ] `/api/stats` requiere token de admin
- [ ] Rate limiting está activo (10 msg/min)
- [ ] User isolation funciona (cada usuario ve solo sus datos)

---

## 📊 Monitoreo

### Logs

- [ ] Logs de Railway muestran:
  - `[Server] Listening on port 3000`
  - `[Web] Web routes registered`
  - Sin errores de conexión a MongoDB

### Métricas

- [ ] Uso de RAM < 150 MB
- [ ] Uso de CPU < 10% promedio
- [ ] No hay memory leaks visibles

---

## 📚 Documentación

### Actualizada

- [ ] `README.md` tiene la URL de producción
- [ ] `DEPLOY_PRODUCCION.md` está completo
- [ ] `CHECKLIST_DEPLOYMENT.md` está marcado
- [ ] Changelog actualizado con la versión

### Compartir

- [ ] URL de documentación compartida: `https://TU_URL/docs`
- [ ] URL de comandos compartida: `https://TU_URL/commands`

---

## 🎉 Post-Deployment

### Notificaciones

- [ ] Configurar notificaciones en Railway (Settings → Notifications)
- [ ] Agregar webhook de Slack/Discord para deploy events (opcional)

### Backup

- [ ] MongoDB Atlas tiene backups automáticos habilitados (gratis en M0)
- [ ] Exportar datos manualmente (opcional):
```bash
mongodump --uri="mongodb+srv://..."
```

### Monitoreo Continuo

- [ ] Revisar logs 1 vez al día durante la primera semana
- [ ] Verificar uso de recursos en Railway
- [ ] Confirmar que no hay errores en MongoDB Atlas

---

## 🚨 Troubleshooting

Si algo falla, consulta:

1. **[DEPLOY_PRODUCCION.md](DEPLOY_PRODUCCION.md#troubleshooting)** - Sección de troubleshooting
2. **Logs de Railway** - Ve a Deployments → Ver logs
3. **Logs de MongoDB** - Ve a Atlas → Metrics

### Comandos Útiles

```bash
# Verificar webhook de Telegram
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Verificar estado del bot
curl https://TU_RAILWAY_URL/api/status

# Ver logs de Railway (en el dashboard)
# Railway → Deployments → Click en deployment → View Logs

# Reconfigurar webhook
./scripts/setup-webhooks.sh
```

---

## ✅ Checklist Resumido

**Antes de dar por terminado el deployment, verifica**:

- [ ] 🗄️ MongoDB Atlas configurado y conectado
- [ ] 🚂 Railway desplegado sin errores
- [ ] 🔐 Variables de entorno configuradas
- [ ] 🌐 Webhook de Telegram funcionando
- [ ] 🤖 Bot responde en Telegram
- [ ] 📊 `/api/status` retorna "healthy"
- [ ] 🌐 Web de documentación carga
- [ ] 🔒 Rate limiting funciona
- [ ] 📝 Logs no muestran errores
- [ ] 📚 Documentación actualizada

---

**Fecha de deployment**: _______________

**URL de producción**: _______________

**Versión desplegada**: v1.1.0

**Desplegado por**: _______________

---

¡Felicitaciones! Tu Finance Bot está en producción 🚀
