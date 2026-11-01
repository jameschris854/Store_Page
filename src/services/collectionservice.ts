import { buildCollectionTree } from "../utils/categoryParser";
import type { Collection } from "../types/type";
import { getSupabaseClient } from "../sync/supabase";

let cache: Collection[] | null = null;

export async function getCollectionsTree(): Promise<Collection[]> {
  if (cache) return cache;

  const { data, error } = await getSupabaseClient().functions.invoke<{
    collectionRows: Record<string, string>[];
    masterRows: Record<string, string>[];
  }>("collections", { method: "GET" });
  if (error) throw error;
  if (!data) throw new Error("The collections function returned no data");

  cache = buildCollectionTree(data.collectionRows, data.masterRows);
  return cache;
}
