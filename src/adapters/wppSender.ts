type WhatsappMessageParams = {
  phoneNumberId: string;
  accessToken: string;
  recipient: string;
  message: string;
};

export const sendWhatsappMessage = async ({
  phoneNumberId,
  accessToken,
  recipient,
  message
}: WhatsappMessageParams) => {
  const endpoint = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${detail}`);
  }
};
