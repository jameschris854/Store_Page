import type { SupabaseClient } from "@supabase/supabase-js";

export type Offer = {
  id: number;
  title: string;
  description: string | null;
  expiresAt: string | null;
};

export type NewOffer = Omit<Offer, "id">;

export type OfferUpdate = {
  id: number;
  title?: string;
  description?: string | null;
  expiresAt?: string | null;
};

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationTurn = {
  user_message: string;
  assistant_message: string;
};

const pageSize = 500;
const maxBulkOffers = 100;
const maxConversationTurns = 20;

export function conversationTurnsToMessages(
  turns: ConversationTurn[],
): ConversationMessage[] {
  return [...turns].reverse().flatMap((turn) => [
    { role: "user" as const, content: turn.user_message },
    { role: "assistant" as const, content: turn.assistant_message },
  ]);
}

export async function getAllOffers(client: SupabaseClient): Promise<Offer[]> {
  const offers: Offer[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from("Offers")
      .select("id,title,description,expiresAt")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    if (!data) throw new Error("Offers query returned no data");

    offers.push(...data as Offer[]);
    if (data.length < pageSize) return offers;
    offset += data.length;
  }
}

export async function createBulkOffers(
  client: SupabaseClient,
  offers: NewOffer[],
): Promise<Offer[]> {
  if (offers.length === 0 || offers.length > maxBulkOffers) {
    throw new Error(`Create between 1 and ${maxBulkOffers} offers at a time`);
  }

  const { data, error } = await client
    .from("Offers")
    .insert(offers)
    .select("id,title,description,expiresAt");
  if (error) throw error;
  if (!data) throw new Error("Offer creation returned no data");
  return data as Offer[];
}

export async function updateBulkOffers(
  client: SupabaseClient,
  updates: OfferUpdate[],
): Promise<Offer[]> {
  if (updates.length === 0 || updates.length > maxBulkOffers) {
    throw new Error(`Update between 1 and ${maxBulkOffers} offers at a time`);
  }
  if (
    updates.some((update) =>
      !Number.isSafeInteger(update.id) ||
      !("title" in update || "description" in update || "expiresAt" in update)
    )
  ) {
    throw new Error("Each offer update needs an ID and at least one field");
  }

  return await Promise.all(
    updates.map(async ({ id, ...fields }) => {
      const { data, error } = await client
        .from("Offers")
        .update(fields)
        .eq("id", id)
        .select("id,title,description,expiresAt")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(`Offer ${id} was not found`);
      return data as Offer;
    }),
  );
}

export async function deleteBulkOffers(
  client: SupabaseClient,
  ids: number[],
): Promise<Offer[]> {
  const uniqueIds = [...new Set(ids)];
  if (
    uniqueIds.length === 0 ||
    uniqueIds.length > maxBulkOffers ||
    uniqueIds.some((id) => !Number.isSafeInteger(id) || id <= 0)
  ) {
    throw new Error(`Delete between 1 and ${maxBulkOffers} valid offer IDs`);
  }

  const { data: existingOffers, error: lookupError } = await client
    .from("Offers")
    .select("id")
    .in("id", uniqueIds);
  if (lookupError) throw lookupError;
  if (!existingOffers || existingOffers.length !== uniqueIds.length) {
    throw new Error("One or more offers were not found; nothing was deleted");
  }

  const { data, error } = await client
    .from("Offers")
    .delete()
    .in("id", uniqueIds)
    .select("id,title,description,expiresAt");
  if (error) throw error;
  if (!data) throw new Error("Offer deletion returned no data");
  return data as Offer[];
}

export async function getConversationHistory(
  client: SupabaseClient,
  sessionId: string,
): Promise<ConversationMessage[]> {
  const { data, error } = await client
    .from("offer_admin_turns")
    .select("user_message,assistant_message")
    .eq("session_id", sessionId)
    .order("id", { ascending: false })
    .limit(maxConversationTurns);
  if (error) throw error;
  if (!data) throw new Error("Conversation history returned no data");

  return conversationTurnsToMessages(data);
}

export async function saveConversationTurn(
  client: SupabaseClient,
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  const { error } = await client.rpc("offer_admin_save_turn", {
    p_session_id: sessionId,
    p_user_message: userMessage,
    p_assistant_message: assistantMessage,
  });
  if (error) throw error;
}
