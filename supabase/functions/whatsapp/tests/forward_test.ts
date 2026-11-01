import {
  getOfferAdminFailureMessage,
  OfferAdminRequestError,
} from "../forward.ts";

Deno.test("explains offer admin rate limits", () => {
  const message = getOfferAdminFailureMessage(
    new OfferAdminRequestError("rate_limited"),
  );
  if (!message.includes("rate limit") || !message.includes("wait a bit")) {
    throw new Error("Expected a helpful rate-limit diagnostic");
  }
});

Deno.test("explains offer admin timeouts and availability failures", () => {
  const timeoutMessage = getOfferAdminFailureMessage(
    new DOMException("Signal timed out", "TimeoutError"),
  );
  const unavailableMessage = getOfferAdminFailureMessage(
    new OfferAdminRequestError("unavailable"),
  );
  if (
    !timeoutMessage.includes("too long") ||
    !unavailableMessage.includes("temporarily unavailable")
  ) {
    throw new Error("Expected actionable AI failure diagnostics");
  }
});

Deno.test("does not expose raw internal errors to WhatsApp", () => {
  const message = getOfferAdminFailureMessage(
    new Error("provider token secret was rejected"),
  );
  if (message.includes("provider token secret")) {
    throw new Error("Expected internal error details to remain private");
  }
});
