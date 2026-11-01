// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

// This endpoint uses 'user' access, credentials is required.
export default {
  fetch: withSupabase({ auth: "secret" }, async (_req, { supabase }) => {
    // TODO: Change the table_name to your table
    const { data, error } = await supabase.from("Offers").select("*");

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ data });
  }),
};