import type { Offer } from "./offer";

export type OfferRow = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  expiresAt: string | null;
}

export type Database = {
  public: {
    Tables: {
      Offers: {
        Row: OfferRow;
        Insert: Partial<OfferRow>;
        Update: Partial<OfferRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export function toOffer(
  row: Pick<OfferRow, "id" | "title" | "description" | "expiresAt">
): Offer {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? "",
    expiresAt: row.expiresAt,
  };
}
