import { useEffect, useState } from "react";
import { getOffers } from "../sync/sync";
import type { Offer } from "../types/offer";

export default function useOffers(enabled = true) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let isActive = true;

    getOffers()
      .then((loadedOffers) => {
        if (isActive) setOffers(loadedOffers);
      })
      .catch((loadError: unknown) => {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "An unexpected error occurred while loading offers"
          );
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [enabled]);

  return { offers, loading, error };
}
