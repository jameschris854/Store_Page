import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { forwardToOfferAdmin } from "./forward.ts";
import {
  parseAdminIds,
  verifyMetaSignature,
  verifyWebhookToken,
} from "./meta.ts";
import { parseWhatsAppTextMessages } from "./messages.ts";

const maxWebhookBodyBytes = 1_000_000;

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function textResponse(message: string, status = 200): Response {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function createDeduplicationClient() {
  return createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

Deno.serve(async (request: Request) => {
  if (request.method === "GET") {
    try {
      const url = new URL(request.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (
        mode !== "subscribe" ||
        !challenge ||
        !verifyWebhookToken(token, requiredEnv("META_VERIFY_TOKEN"))
      ) {
        return textResponse("Webhook verification failed.", 403);
      }
      return textResponse(challenge);
    } catch (error) {
      console.error(
        "WhatsApp webhook verification is not configured",
        error instanceof Error ? error.message : "Unknown error",
      );
      return textResponse("Webhook verification is unavailable.", 500);
    }
  }

  if (request.method !== "POST") {
    return textResponse("Only GET and POST requests are supported.", 405);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxWebhookBodyBytes) {
    return textResponse("Webhook payload is too large.", 413);
  }

  let body: Uint8Array<ArrayBuffer>;
  try {
    body = new Uint8Array(await request.arrayBuffer());
  } catch {
    return textResponse("Could not read webhook payload.", 400);
  }
  if (body.length > maxWebhookBodyBytes) {
    return textResponse("Webhook payload is too large.", 413);
  }

  let signatureIsValid: boolean;
  try {
    signatureIsValid = await verifyMetaSignature(
      body,
      request.headers.get("x-hub-signature-256"),
      requiredEnv("META_APP_SECRET"),
    );
  } catch (error) {
    console.error(
      "WhatsApp webhook signature verification failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return textResponse("Webhook signature verification is unavailable.", 500);
  }
  if (!signatureIsValid) {
    return textResponse("Invalid webhook signature.", 401);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return textResponse("Invalid JSON payload.", 400);
  }

  let adminIds: Set<string>;
  try {
    adminIds = parseAdminIds(requiredEnv("WHATSAPP_ADMIN_IDS"));
    if (adminIds.size === 0) {
      throw new Error("WHATSAPP_ADMIN_IDS must contain at least one sender ID");
    }
  } catch (error) {
    console.error(
      "WhatsApp admin allowlist is not configured",
      error instanceof Error ? error.message : "Unknown error",
    );
    return textResponse("Webhook is not configured.", 500);
  }

  const messages = parseWhatsAppTextMessages(payload).filter((message) =>
    adminIds.has(message.from)
  );
  if (messages.length === 0) return textResponse("EVENT_RECEIVED");

  try {
    const database = createDeduplicationClient();
    for (const message of messages) {
      const { data: claimed, error: claimError } = await database.rpc(
        "whatsapp_claim_inbound_message",
        { p_message_id: message.id, p_sender_id: message.from },
      );
      if (claimError) throw claimError;
      if (claimed !== true) continue;

      try {
        await forwardToOfferAdmin(message.text, message.from);
      } catch (error) {
        const { error: releaseError } = await database.rpc(
          "whatsapp_release_inbound_message",
          { p_message_id: message.id },
        );
        if (releaseError) {
          console.error(
            "Could not release failed WhatsApp message claim",
            releaseError.message,
          );
        }
        throw error;
      }
    }
  } catch (error) {
    console.error(
      "WhatsApp message forwarding failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return textResponse("Message forwarding failed.", 502);
  }

  return textResponse("EVENT_RECEIVED");
});
