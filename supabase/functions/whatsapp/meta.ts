const signaturePrefix = "sha256=";

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index++) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export function verifyWebhookToken(
  received: string | null,
  expected: string,
): boolean {
  if (received === null) return false;
  return constantTimeEqual(
    new TextEncoder().encode(received),
    new TextEncoder().encode(expected),
  );
}

export async function verifyMetaSignature(
  body: Uint8Array<ArrayBuffer>,
  signature: string | null,
  appSecret: string,
): Promise<boolean> {
  if (!signature?.startsWith(signaturePrefix)) return false;
  const suppliedHex = signature.slice(signaturePrefix.length);
  if (!/^[0-9a-f]{64}$/i.test(suppliedHex)) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, body),
  );
  const supplied = new Uint8Array(
    suppliedHex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)),
  );
  return constantTimeEqual(expected, supplied);
}

export function parseAdminIds(value: string): Set<string> {
  const ids = value.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0 || ids.some((id) => !/^\d{5,20}$/.test(id))) {
    throw new Error(
      "WHATSAPP_ADMIN_IDS must contain valid WhatsApp sender IDs",
    );
  }
  return new Set(ids);
}
