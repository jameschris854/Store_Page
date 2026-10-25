const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const fields = [
  "current_opening_hours",
  "reviews",
  "photos",
  "rating",
  "url",
  "name",
  "formatted_phone_number",
  "formatted_address",
].join(",");

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
    },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const placeId = Deno.env.get("GOOGLE_PLACE_ID");
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!placeId || !apiKey) {
    console.error("Google Places function secrets are not configured");
    return jsonResponse({ error: "Place details are not configured" }, 500);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.search = new URLSearchParams({
    place_id: placeId,
    fields,
    key: apiKey,
  }).toString();

  let upstream: Response;
  try {
    upstream = await fetch(url);
  } catch {
    console.error("Google Places request failed");
    return jsonResponse({ error: "Unable to load place details" }, 502);
  }

  if (!upstream.ok) {
    console.error("Google Places returned HTTP status", upstream.status);
    return jsonResponse({ error: "Place details provider failed" }, 502);
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    console.error("Google Places returned invalid JSON");
    return jsonResponse({ error: "Invalid response from place details provider" }, 502);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("status" in payload) ||
    payload.status !== "OK" ||
    !("result" in payload)
  ) {
    console.error("Google Places returned an unsuccessful result");
    return jsonResponse({ error: "Unable to load place details" }, 502);
  }

  return jsonResponse(payload);
});
