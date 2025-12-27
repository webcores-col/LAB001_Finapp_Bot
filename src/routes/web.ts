import { Express, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDb } from '../infrastructure/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Registra las rutas web para la documentación y landing page
 */
export const registerWebRoutes = (app: Express) => {
  // Helper para leer archivos HTML
  const readView = (filename: string): string => {
    const viewPath = join(__dirname, '../views', filename);
    return readFileSync(viewPath, 'utf-8');
  };

  // Página principal
  app.get('/', (req: Request, res: Response) => {
    try {
      const html = readView('index.html');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(500).send('Error loading page');
    }
  });

  // Documentación
  app.get('/docs', (req: Request, res: Response) => {
    try {
      const html = readView('docs.html');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(500).send('Error loading documentation');
    }
  });

  // Lista de comandos con búsqueda
  app.get('/commands', (req: Request, res: Response) => {
    try {
      const html = readView('commands.html');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(500).send('Error loading commands page');
    }
  });

  // Changelog
  app.get('/changelog', (req: Request, res: Response) => {
    try {
      const html = readView('changelog.html');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(500).send('Error loading changelog');
    }
  });

  // API: Estado del bot
  app.get('/api/status', async (req: Request, res: Response) => {
    try {
      // Aquí podrías verificar la conexión a MongoDB, etc.
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.1.0',
        platforms: {
          telegram: !!process.env.TELEGRAM_TOKEN,
          whatsapp: !!process.env.WHATSAPP_TOKEN
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: 'Internal server error'
      });
    }
  });

  // API: Estadísticas básicas (protegido con token)
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      // Verificar token de admin
      const adminToken = process.env.ADMIN_TOKEN;
      const providedToken = req.headers['authorization']?.replace('Bearer ', '');

      if (!adminToken || providedToken !== adminToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing admin token'
        });
      }

      // Obtener estadísticas básicas
      const db = await getDb();

      const [userCount, budgetCount, movementCount] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('budgets').countDocuments(),
        db.collection('movements').countDocuments()
      ]);

      res.json({
        timestamp: new Date().toISOString(),
        stats: {
          users: userCount,
          budgets: budgetCount,
          movements: movementCount
        }
      });
    } catch (error) {
      console.error('[API] Error fetching stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve statistics'
      });
    }
  });

  console.log('[Web] Web routes registered');
};
