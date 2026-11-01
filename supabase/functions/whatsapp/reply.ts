type WhatsAppReplyConfig = {
  accessToken: string;
  phoneNumberId: string;
};

type Fetcher = typeof fetch;

export async function sendWhatsAppReply(
  recipientId: string,
  message: string,
  config: WhatsAppReplyConfig,
  fetcher: Fetcher = fetch,
): Promise<void> {
  const response = await fetcher(
    `https://graph.facebook.com/v26.0/${
      encodeURIComponent(config.phoneNumberId)
    }/messages`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+${recipientId}`,
        type: "text",
        text: { body: message },
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Meta WhatsApp API returned HTTP ${response.status}`);
  }
}
