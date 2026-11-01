import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { fetchSheetRows } from "./data.ts";

const jsonHeaders = { "Cache-Control": "public, max-age=300" };

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      ...jsonHeaders,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }
  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const spreadsheetId = Deno.env.get("GOOGLE_SHEET_ID")?.trim();
  if (!spreadsheetId) {
    console.error("Collections function is missing GOOGLE_SHEET_ID");
    return jsonResponse({ error: "Collections are not configured" }, 503);
  }

  try {
    const [collectionRows, masterRows] = await Promise.all([
      fetchSheetRows(spreadsheetId, "COLLECTIONS"),
      fetchSheetRows(spreadsheetId, "COLLECTION MASTER"),
    ]);
    return jsonResponse({ collectionRows, masterRows });
  } catch (error) {
    console.error(
      "Unable to load Google Sheets collections",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonResponse({ error: "Unable to load collections" }, 502);
  }
});
