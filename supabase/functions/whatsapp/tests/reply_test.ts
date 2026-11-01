import { sendWhatsAppReply } from "../reply.ts";

Deno.test("sends a WhatsApp text reply through the Messages API", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;

  await sendWhatsAppReply(
    "918637627151",
    "Agent response",
    { accessToken: "test-token", phoneNumberId: "123456789" },
    async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response("{}", { status: 200 });
    },
  );

  const headers = new Headers(requestInit?.headers);
  const body = JSON.parse(String(requestInit?.body));
  if (
    requestUrl !==
      "https://graph.facebook.com/v26.0/123456789/messages" ||
    requestInit?.method !== "POST" ||
    headers.get("authorization") !== "Bearer test-token" ||
    body.messaging_product !== "whatsapp" ||
    body.recipient_type !== "individual" ||
    body.to !== "+918637627151" ||
    body.type !== "text" ||
    body.text.body !== "Agent response"
  ) {
    throw new Error("Expected an authenticated WhatsApp text message request");
  }
});

Deno.test("reports WhatsApp API failures", async () => {
  let errorMessage = "";
  try {
    await sendWhatsAppReply(
      "918637627151",
      "Agent response",
      { accessToken: "test-token", phoneNumberId: "123456789" },
      async () => new Response(null, { status: 401 }),
    );
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "";
  }

  if (errorMessage !== "Meta WhatsApp API returned HTTP 401") {
    throw new Error("Expected the WhatsApp API failure to be reported");
  }
});
