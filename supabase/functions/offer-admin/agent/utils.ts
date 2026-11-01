import { Offer } from "../database/sync.ts";
import { maxMessageLength } from "./constants.ts";

export function isValidMessage(message: string): boolean {
  return message.trim().length > 0 && message.length <= maxMessageLength;
}

export function summarizeOffers(offers: Offer[]): string {
  if (offers.length === 0) return "There are no offers.";
  return JSON.stringify(offers);
}