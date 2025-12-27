import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Schema de validación de configuración
 *
 * Valida:
 * - MONGO_URI es requerido y debe ser una URL válida
 * - PORT es opcional, debe ser un número positivo
 * - Al menos una plataforma (WhatsApp o Telegram) debe estar configurada
 * - Si se configura WhatsApp, requiere token Y phone number ID
 */
const ConfigSchema = z
  .object({
    // MongoDB (REQUERIDO)
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

    // Server
    PORT: z.coerce.number().positive().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // WhatsApp (opcional pero si hay token, requiere phone number ID)
    WHATSAPP_TOKEN: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_VERIFY_TOKEN: z.string().optional(),

    // Telegram (opcional)
    TELEGRAM_TOKEN: z.string().optional()
  })
  .refine(
    (data) => {
      // Si hay token de WhatsApp, requiere el phone number ID
      if (data.WHATSAPP_TOKEN && !data.WHATSAPP_PHONE_NUMBER_ID) {
        return false;
      }
      return true;
    },
    {
      message: 'WHATSAPP_PHONE_NUMBER_ID is required when WHATSAPP_TOKEN is set'
    }
  )
  .refine(
    (data) => {
      // Al menos una plataforma debe estar configurada
      return !!(data.WHATSAPP_TOKEN || data.TELEGRAM_TOKEN);
    },
    {
      message: 'At least one platform must be configured (WHATSAPP_TOKEN or TELEGRAM_TOKEN)'
    }
  );

export type AppConfig = {
  mongoUri: string;
  port: number;
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappVerifyToken?: string;
  telegramToken?: string;
};

/**
 * Carga y valida la configuración de la aplicación
 *
 * @throws Error si la configuración es inválida
 */
export const loadConfig = (): AppConfig => {
  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Configuration validation failed:');
    console.error(result.error.format());

    // Mostrar ejemplo de .env válido
    console.error('\nExample .env file:');
    console.error(`
MONGO_URI=mongodb://localhost:27017/finance-bot
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/finance-bot

PORT=3000
NODE_ENV=development

# For Telegram:
TELEGRAM_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# OR for WhatsApp (both required):
# WHATSAPP_TOKEN=your_access_token
# WHATSAPP_PHONE_NUMBER_ID=123456789
# WHATSAPP_VERIFY_TOKEN=your_verify_token
    `);

    process.exit(1);
  }

  const validated = result.data;

  // Log de configuración (sin exponer secretos)
  const maskedMongoUri = validated.MONGO_URI.replace(
    /\/\/([^:]+:[^@]+)@/,
    '//***:***@'
  );

  console.log('[Config] Configuration loaded successfully');
  console.log('[Config] MongoDB URI:', maskedMongoUri);
  console.log('[Config] Port:', validated.PORT);
  console.log('[Config] Platforms:', {
    telegram: !!validated.TELEGRAM_TOKEN,
    whatsapp: !!validated.WHATSAPP_TOKEN
  });

  return {
    mongoUri: validated.MONGO_URI,
    port: validated.PORT,
    whatsappToken: validated.WHATSAPP_TOKEN,
    whatsappPhoneNumberId: validated.WHATSAPP_PHONE_NUMBER_ID,
    whatsappVerifyToken: validated.WHATSAPP_VERIFY_TOKEN,
    telegramToken: validated.TELEGRAM_TOKEN
  };
};
