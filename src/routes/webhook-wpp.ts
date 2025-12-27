import { Express, Request, Response } from 'express';
import { AppConfig } from '../config.js';
import { processTextMessage } from '../application/messageProcessor.js';
import { sendWhatsappMessage } from '../adapters/wppSender.js';
import { getOrCreateUser } from '../infrastructure/userRepository.js';
import { MessageContext } from '../domain/types.js';
import { rateLimit } from '../utils/rateLimit.js';

const extractWhatsappMessages = (body: any) => {
  const entries = Array.isArray(body?.entry) ? body.entry : [];
  const messages: Array<{
    from: string;
    text?: { body?: string };
    type?: string;
  }> = [];
  let phoneNumberId: string | undefined;

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      const currentMessages = Array.isArray(value?.messages) ? value.messages : [];
      phoneNumberId = value?.metadata?.phone_number_id ?? phoneNumberId;
      currentMessages.forEach((message: unknown) => {
        if (message && typeof message === 'object') {
          messages.push(message as any);
        }
      });
    }
  }

  return { messages, phoneNumberId };
};

export const registerWhatsappRoutes = (app: Express, config: AppConfig) => {
  app.post('/webhook/whatsapp', async (req: Request, res: Response) => {
    const { messages, phoneNumberId } = extractWhatsappMessages(req.body);

    const tasks = messages
      .filter((message) => message.type === 'text' && message.text?.body)
      .map(async (message) => {
        const sender = message.from;
        const text = message.text?.body ?? '';

        // Aplicar rate limiting (10 mensajes por minuto)
        const rateLimitKey = `whatsapp:${sender}`;
        if (!rateLimit(rateLimitKey, 10)) {
          try {
            const phoneId = phoneNumberId ?? config.whatsappPhoneNumberId;
            if (config.whatsappToken && phoneId) {
              await sendWhatsappMessage({
                phoneNumberId: phoneId,
                accessToken: config.whatsappToken,
                recipient: sender,
                message: '⚠️ Has enviado demasiados mensajes. Por favor espera un minuto antes de continuar.'
              });
            }
          } catch (error) {
            console.error('Failed to send rate limit message', error);
          }
          return;
        }

        try {
          // Obtener o crear usuario
          const user = await getOrCreateUser(sender, 'whatsapp');

          // Crear contexto del mensaje
          const context: MessageContext = {
            userId: user.id,
            platform: 'whatsapp',
            platformId: sender
          };

          // Procesar mensaje con contexto
          const reply = await processTextMessage(text, context);

          const phoneId = phoneNumberId ?? config.whatsappPhoneNumberId;
          if (!config.whatsappToken || !phoneId) {
            console.warn('WhatsApp configuration missing. Cannot send reply.');
            return;
          }
          await sendWhatsappMessage({
            phoneNumberId: phoneId,
            accessToken: config.whatsappToken,
            recipient: sender,
            message: reply
          });
        } catch (error) {
          console.error('Failed to reply to WhatsApp message', error);
        }
      });

    await Promise.allSettled(tasks);
    res.sendStatus(200);
  });

  app.get('/webhook/whatsapp', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsappVerifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });
};
