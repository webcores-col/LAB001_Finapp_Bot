type TelegramMessageParams = {
  token: string;
  chatId: string | number;
  message: string;
};

export const sendTelegramMessage = async ({
  token,
  chatId,
  message
}: TelegramMessageParams) => {
  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${detail}`);
  }
};
