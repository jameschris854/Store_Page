import { useEffect, useState } from "react";
import { getPlaceData } from "../services/placeservice";
import type { googlePlaceDetailsRes } from "../types/googlePlaceDetailsRes";

export default () => {
  const [loading, setLoading] = useState(true);
  const [placeData, setPlaceData] = useState<googlePlaceDetailsRes | null>(
    null
  );
  useEffect(() => {
    getPlaceData().then((json) => {
      setPlaceData(json);
      setLoading(false);
    });
  }, []);

  return {loading,placeData};
};
