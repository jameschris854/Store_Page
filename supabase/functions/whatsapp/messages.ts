export type WhatsAppTextMessage = {
  id: string;
  from: string;
  text: string;
  phoneNumberId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseWhatsAppTextMessages(
  payload: unknown,
): WhatsAppTextMessage[] {
  if (!isRecord(payload) || payload.object !== "whatsapp_business_account") {
    return [];
  }

  const messages: WhatsAppTextMessage[] = [];
  if (!Array.isArray(payload.entry)) return messages;

  for (const entry of payload.entry) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) continue;
    for (const change of entry.changes) {
      if (!isRecord(change) || !isRecord(change.value)) continue;
      const metadata = change.value.metadata;
      if (
        !isRecord(metadata) ||
        typeof metadata.phone_number_id !== "string" ||
        metadata.phone_number_id.length === 0
      ) {
        continue;
      }
      const inboundMessages = change.value.messages;
      if (!Array.isArray(inboundMessages)) continue;
      for (const message of inboundMessages) {
        if (!isRecord(message) || message.type !== "text") continue;
        if (
          typeof message.id !== "string" ||
          typeof message.from !== "string" ||
          !isRecord(message.text) ||
          typeof message.text.body !== "string"
        ) {
          continue;
        }
        messages.push({
          id: message.id,
          from: message.from,
          text: message.text.body,
          phoneNumberId: metadata.phone_number_id,
        });
      }
    }
  }

  return messages;
}
