function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function offerAdminApiKey(): string {
  let keys: unknown;
  try {
    keys = JSON.parse(requiredEnv("SB_SECRET_KEYS"));
  } catch (error) {
    throw new Error("SB_SECRET_KEYS must be a valid JSON object", {
      cause: error,
    });
  }
  if (!isRecord(keys)) {
    throw new Error("SB_SECRET_KEYS must be a JSON object");
  }

  const namedKey = keys.whatsapp_forward;
  if (typeof namedKey !== "string" || !namedKey) {
    throw new Error(
      'SB_SECRET_KEYS must contain a non-empty "whatsapp_forward" key',
    );
  }
  return namedKey;
}

export async function forwardToOfferAdmin(
  message: string,
  senderId: string,
): Promise<string> {
  const supabaseUrl = requiredEnv("SUPABASE_URL").replace(/\/+$/, "");
  const apiKey = offerAdminApiKey();
  const response = await fetch(
    `${supabaseUrl}/functions/v1/offer-admin`,
    {
      method: "POST",
      headers: {
        apikey: apiKey,
        "content-type": "text/plain",
        "x-whatsapp-sender-id": senderId,
      },
      body: message,
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!response.ok) {
    throw new Error(`Offer admin returned HTTP ${response.status}`);
  }

  const reply = await response.text();
  if (!reply.trim()) {
    throw new Error("Offer admin returned an empty reply");
  }
  return reply;
}
