import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export class Http {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async get<T>(functionName: string): Promise<T | null> {
    const { data, error } = await this.client.functions.invoke<T>(
      functionName,
      { method: "GET" },
    );

    if (error) throw error;
    return data;
  }
}
