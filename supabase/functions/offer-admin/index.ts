import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { runAgent } from "./agent/index.ts";
import { isValidMessage } from "./agent/utils.ts";
import {
  getConversationHistory,
  saveConversationTurn,
} from "./database/sync.ts";
import { textResponse } from "./utils/helper.ts";

Deno.serve(
  withSupabase(
    { auth: "secret:whatsapp_forward" },
    async (request, { supabaseAdmin }) => {
      if (request.method !== "POST") {
        return textResponse("Only POST requests are supported.", 405);
      }

      const contentType = request.headers.get("content-type")?.toLowerCase() ??
        "";
      if (!contentType.startsWith("text/plain")) {
        return textResponse("Send the message as plain text.", 415);
      }

      let message: string;
      try {
        message = await request.text();
      } catch {
        return textResponse("Could not read the message body.", 400);
      }
      if (!isValidMessage(message)) {
        return textResponse("Send a message of at most 2000 characters.", 400);
      }

      try {
        const userMessage = message.trim();
        const senderId = request.headers.get("x-whatsapp-sender-id");
        if (senderId && !/^\d{5,20}$/.test(senderId)) {
          return textResponse("Invalid WhatsApp sender ID.", 400);
        }
        const sessionId = senderId ?? "admin";
        const history = await getConversationHistory(
          supabaseAdmin,
          sessionId,
        );
        const response = await runAgent(userMessage, supabaseAdmin, history);
        try {
          await saveConversationTurn(
            supabaseAdmin,
            sessionId,
            userMessage,
            response,
          );
        } catch (error) {
          console.error(
            "Offer admin response could not be saved to conversation history",
            error instanceof Error ? error.message : "Unknown error",
          );
          return textResponse(
            `${response}\n\n(Session history could not be saved.)`,
            202,
          );
        }
        return textResponse(response);
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : "Unknown error";
        const isRateLimit = /rate limit|tokens per minute|\bTPM\b/i.test(
          message,
        );
        console.error(
          "Offer admin request failed",
          message,
        );
        return textResponse(
          isRateLimit ? "AI_RATE_LIMITED" : "AI_PROCESSING_FAILED",
          isRateLimit ? 429 : 502,
        );
      }
    },
  ),
);
