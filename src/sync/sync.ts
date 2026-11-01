import { getSupabaseClient } from "./supabase";
import type { googlePlaceDetailsRes } from "../types/googlePlaceDetailsRes";
import { toOffer } from "../types/database";
import type { Offer } from "../types/offer";
import { Http } from "./http";

const offerFields = "id,title,description,expiresAt";

let placeDataCache: googlePlaceDetailsRes | null = null;

export async function getPlaceData(): Promise<googlePlaceDetailsRes> {
  if (placeDataCache) return placeDataCache;

  const data = await new Http(getSupabaseClient()).get<googlePlaceDetailsRes>(
    "place-details",
  );
  if (!data) throw new Error("The place-details function returned no data");

  placeDataCache = data;
  return data;
}

export async function getOffers(): Promise<Offer[]> {
  const { data, error } = await getSupabaseClient()
    .from("Offers")
    .select(offerFields)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = Date.now();
  return data
    .filter((row) => row.expiresAt === null || Date.parse(row.expiresAt) > now)
    .map(toOffer);
}
