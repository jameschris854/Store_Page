import {
  parseAdminIds,
  verifyMetaSignature,
  verifyWebhookToken,
} from "../meta.ts";

Deno.test("validates Meta webhook signatures against the raw request body", async () => {
  const body = new TextEncoder().encode(
    '{"object":"whatsapp_business_account"}',
  );
  const secret = "test-meta-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", key, body),
    ),
  ].map((byte) => byte.toString(16).padStart(2, "0")).join("");

  if (!await verifyMetaSignature(body, `sha256=${signature}`, secret)) {
    throw new Error("Expected the correct signature to be accepted");
  }
  if (
    await verifyMetaSignature(
      new TextEncoder().encode("modified"),
      `sha256=${signature}`,
      secret,
    )
  ) {
    throw new Error("Expected a modified body to be rejected");
  }
  if (await verifyMetaSignature(body, "invalid", secret)) {
    throw new Error("Expected a malformed signature to be rejected");
  }
});

Deno.test("compares webhook verification tokens and parses admin IDs", () => {
  if (!verifyWebhookToken("check-token", "check-token")) {
    throw new Error("Expected matching verification tokens to pass");
  }
  if (verifyWebhookToken("wrong-token", "check-token")) {
    throw new Error("Expected a mismatched verification token to fail");
  }

  const ids = parseAdminIds(" 111111,222222,, ");
  if (ids.size !== 2 || !ids.has("111111") || !ids.has("222222")) {
    throw new Error("Expected whitespace-separated admin IDs to be normalized");
  }
  for (const value of ["", "not-a-phone", "111111,invalid"]) {
    let rejected = false;
    try {
      parseAdminIds(value);
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error("Expected invalid admin IDs to be rejected");
  }
});
