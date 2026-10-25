import { groq } from "@ai-sdk/groq";
import { generateText, stepCountIs, tool } from "ai";
import {
  type ConversationMessage,
  createBulkOffers,
  deleteBulkOffers,
  getAllOffers,
  updateBulkOffers,
} from "../database/sync.ts";
import { maxMessageLength, systemPrompt } from "./constants.ts";
import {
  createBulkOffersSchema,
  deleteBulkOffersSchema,
  getAllOffersSchema,
  updateBulkOffersSchema,
} from "./schema.ts";
import { requiredEnv } from "../utils/helper.ts";
import { summarizeOffers } from "./utils.ts";

export async function runAgent(
  message: string,
  database: Parameters<typeof getAllOffers>[0],
  history: ConversationMessage[],
): Promise<string> {
  const result = await generateText({
    model: groq(requiredEnv("GROQ_MODEL")),
    system: systemPrompt,
    messages: [
      ...history,
      { role: "user", content: message.slice(0, maxMessageLength) },
    ],
    tools: {
      get_offers: tool({
        description: "Get all current offers from the database.",
        inputSchema: getAllOffersSchema,
        execute: async () => summarizeOffers(await getAllOffers(database)),
      }),
      create_bulk_offers: tool({
        description: "Create one or more offers in the database.",
        inputSchema: createBulkOffersSchema,
        execute: async ({ offers }) =>
          summarizeOffers(await createBulkOffers(database, offers)),
      }),
      update_bulk_offers: tool({
        description:
          "Update existing offers by database ID. Use IDs returned by get_offers.",
        inputSchema: updateBulkOffersSchema,
        execute: async ({ updates }) =>
          summarizeOffers(await updateBulkOffers(database, updates)),
      }),
      delete_bulk_offers: tool({
        description:
          "Permanently delete existing offers by database ID. Use IDs returned by get_offers.",
        inputSchema: deleteBulkOffersSchema,
        execute: async ({ ids }) =>
          summarizeOffers(await deleteBulkOffers(database, ids)),
      }),
    },
    stopWhen: stepCountIs(6),
  });

  const response = result.text.trim();
  if (!response) throw new Error("Groq returned no response text");
  return response;
}
