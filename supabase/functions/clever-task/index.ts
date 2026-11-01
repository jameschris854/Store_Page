import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const editableFields = ["created_at", "title", "description", "expiresAt"] as const;

export default {
  fetch: withSupabase({ auth: "secret" }, async (req, { supabaseAdmin }) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Use POST" }, { status: 405 });
    }

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await req.json();

      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return Response.json({ error: "Request body must be a JSON object" }, { status: 400 });
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const id = body.id;
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ error: "A positive integer id is required" }, { status: 400 });
    }

    const unknownFields = Object.keys(body).filter(
      (key) => key !== "id" && !editableFields.includes(key as typeof editableFields[number]),
    );
    if (unknownFields.length > 0) {
      return Response.json(
        { error: `Unsupported field(s): ${unknownFields.join(", ")}` },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    for (const field of editableFields) {
      if (Object.hasOwn(body, field)) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "Provide at least one field to update" }, { status: 400 });
    }

    if (typeof updates.title !== "undefined" && typeof updates.title !== "string") {
      return Response.json({ error: "title must be a string" }, { status: 400 });
    }

    for (const field of ["description", "expiresAt", "created_at"] as const) {
      const value = updates[field];
      if (value !== undefined && value !== null && typeof value !== "string") {
        return Response.json({ error: `${field} must be a string or null` }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("Offers")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: `Offer ${id} was not found` }, { status: 404 });
    }

    return Response.json({ data });
  }),
};