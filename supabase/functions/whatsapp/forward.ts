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

export type OfferAdminFailureCode =
  | "rate_limited"
  | "timed_out"
  | "unavailable"
  | "failed";

export class OfferAdminRequestError extends Error {
  constructor(readonly code: OfferAdminFailureCode) {
    super(code);
    this.name = "OfferAdminRequestError";
  }
}

export function getOfferAdminFailureMessage(error: unknown): string {
  if (error instanceof OfferAdminRequestError) {
    switch (error.code) {
      case "rate_limited":
        return "The AI assistant has reached its rate limit. Please wait a bit, then try again.";
      case "timed_out":
        return "The AI assistant took too long to respond. Please try again shortly.";
      case "unavailable":
        return "The AI assistant is temporarily unavailable. Please try again shortly.";
      case "failed":
        return "The AI assistant couldn't process that request. Please try again.";
    }
  }

  if (
    error instanceof Error &&
    (error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      /signal timed out|timed out/i.test(error.message))
  ) {
    return "The AI assistant took too long to respond. Please try again shortly.";
  }

  return "The AI assistant couldn't process that request. Please try again.";
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
    const responseBody = await response.text();
    if (
      response.status === 429 ||
      responseBody.trim() === "AI_RATE_LIMITED"
    ) {
      throw new OfferAdminRequestError("rate_limited");
    }
    if (response.status >= 500) {
      throw new OfferAdminRequestError("unavailable");
    }
    throw new OfferAdminRequestError("failed");
  }

  const reply = await response.text();
  if (!reply.trim()) {
    throw new Error("Offer admin returned an empty reply");
  }
  return reply;
}
