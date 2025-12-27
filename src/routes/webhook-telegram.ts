import { Express, Request, Response } from 'express';
import { AppConfig } from '../config.js';
import { processTextMessage } from '../application/messageProcessor.js';
import { sendTelegramMessage } from '../adapters/telegramSender.js';
import { getOrCreateUser } from '../infrastructure/userRepository.js';
import { MessageContext } from '../domain/types.js';
import { rateLimit } from '../utils/rateLimit.js';

export const registerTelegramRoutes = (app: Express, config: AppConfig) => {
  app.post('/webhook/telegram', async (req: Request, res: Response) => {
    const update = req.body ?? {};
    const message = update.message ?? update.edited_message;

    const chatId = message?.chat?.id;
    const text: string | undefined = message?.text;

    if (!chatId || typeof text !== 'string' || text.trim().length === 0) {
      res.sendStatus(200);
      return;
    }

    // Aplicar rate limiting (10 mensajes por minuto)
    const rateLimitKey = `telegram:${chatId}`;
    if (!rateLimit(rateLimitKey, 10)) {
      try {
        if (config.telegramToken) {
          await sendTelegramMessage({
            token: config.telegramToken,
            chatId,
            message: '⚠️ Has enviado demasiados mensajes. Por favor espera un minuto antes de continuar.'
          });
        }
      } catch (error) {
        console.error('Failed to send rate limit message', error);
      }
      res.sendStatus(429); // Too Many Requests
      return;
    }

    try {
      // Obtener o crear usuario
      const user = await getOrCreateUser(chatId.toString(), 'telegram');

      // Crear contexto del mensaje
      const context: MessageContext = {
        userId: user.id,
        platform: 'telegram',
        platformId: chatId.toString()
      };

      // Procesar mensaje con contexto
      const reply = await processTextMessage(text, context);

      if (!config.telegramToken) {
        console.warn('Telegram token missing. Cannot send reply.');
        res.sendStatus(200);
        return;
      }

      await sendTelegramMessage({
        token: config.telegramToken,
        chatId,
        message: reply
      });
    } catch (error) {
      console.error('Failed to reply to Telegram message', error);
    }

    res.sendStatus(200);
  });
};
