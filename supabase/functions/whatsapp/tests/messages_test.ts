import { parseWhatsAppTextMessages } from "../messages.ts";

Deno.test("extracts inbound text messages and ignores status/non-text events", () => {
  const messages = parseWhatsAppTextMessages({
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
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
    messages[0].text !== "List offers"
  ) {
    throw new Error("Expected only the inbound text message to be extracted");
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
