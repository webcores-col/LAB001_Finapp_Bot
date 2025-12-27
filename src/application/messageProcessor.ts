import { parseMessageToIntent } from './parser.js';
import { handleIntent } from './handlers.js';
import { MessageContext } from '../domain/types.js';

export const processTextMessage = async (message: string, context: MessageContext): Promise<string> => {
  const intent = parseMessageToIntent(message);
  return handleIntent(intent, context);
};
