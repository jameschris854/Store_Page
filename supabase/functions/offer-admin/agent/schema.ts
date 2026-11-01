import { z } from "zod";
import { maxBulkOffers } from "./constants.ts";

const offerInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(2_000).nullable(),
  expiresAt: z.string().datetime({ offset: true }).nullable(),
}).strict();

const offerUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().max(2_000).nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
}).strict().refine(
  (update) =>
    update.title !== undefined ||
    update.description !== undefined ||
    update.expiresAt !== undefined,
  "At least one offer field must be updated",
);

export const getAllOffersSchema = z.object({}).strict();

export const createBulkOffersSchema = z.object({offers: z.array(offerInputSchema).min(1).max(maxBulkOffers)}).strict()

export const updateBulkOffersSchema = z.object({updates: z.array(offerUpdateSchema).min(1).max(maxBulkOffers)}).strict()

export const deleteBulkOffersSchema = z.object({ids: z.array(z.number().int().positive()).min(1).max(maxBulkOffers)}).strict()