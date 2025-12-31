import type { googlePlaceDetailsRes } from "../types/googlePlaceDetailsRes";

let cache: googlePlaceDetailsRes | null = null;

export async function getPlaceData() {
      if (cache) return cache;

      return fetch("/api/place-details")
      .then((r) => r.json())
      .then((json) => {
        cache = json;
        return cache;
      })
}