import { parseWhatsAppTextMessages } from "../messages.ts";

Deno.test("extracts inbound text messages and ignores status/non-text events", () => {
  const messages = parseWhatsAppTextMessages({
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          metadata: { phone_number_id: "987654321" },
          messages: [
            {
              id: "wamid.1",
              from: "123456789",
              type: "text",
              text: { body: "List offers" },
            },
            {
              id: "wamid.2",
              from: "123456789",
              type: "image",
            },
          ],
          statuses: [{ id: "wamid.3", status: "delivered" }],
        },
      }],
    }],
  });

  if (
    messages.length !== 1 ||
    messages[0].id !== "wamid.1" ||
    messages[0].from !== "123456789" ||
    messages[0].text !== "List offers" ||
    messages[0].phoneNumberId !== "987654321"
  ) {
    throw new Error("Expected only the inbound text message to be extracted");
  }
});

Deno.test("ignores inbound messages without a business phone number ID", () => {
  const messages = parseWhatsAppTextMessages({
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          messages: [{
            id: "wamid.1",
            from: "123456789",
            type: "text",
            text: { body: "List offers" },
          }],
        },
      }],
    }],
  });

  if (messages.length !== 0) {
    throw new Error("Expected messages without a phone number ID to be ignored");
  }
});

Deno.test("ignores unknown and malformed webhook payloads", () => {
  if (parseWhatsAppTextMessages(null).length !== 0) {
    throw new Error("Expected a non-object payload to be ignored");
  }
  if (
    parseWhatsAppTextMessages({ object: "other", entry: [] }).length !== 0
  ) {
    throw new Error("Expected a non-WhatsApp payload to be ignored");
  }
});
