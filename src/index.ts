import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadConfig } from './config.js';
import { registerWhatsappRoutes } from './routes/webhook-wpp.js';
import { registerTelegramRoutes } from './routes/webhook-telegram.js';
import { registerWebRoutes } from './routes/web.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const config = loadConfig();

// Middleware
app.use(express.json());

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(join(__dirname, 'public')));

// Registrar rutas
registerWebRoutes(app); // Rutas web (homepage, docs, etc)
registerWhatsappRoutes(app, config); // Webhook WhatsApp
registerTelegramRoutes(app, config); // Webhook Telegram

const port = config.port || 3000;
app.listen(port, () => {
  console.log(`[Server] Listening on port ${port}`);
  console.log(`[Server] Web interface: http://localhost:${port}`);
  console.log(`[Server] Documentation: http://localhost:${port}/docs`);
});
