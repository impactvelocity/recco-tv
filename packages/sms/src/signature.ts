import { createHmac, timingSafeEqual } from "node:crypto";

/** Header carrying `t=<unix seconds>,v1=<hex hmac>` on webhook calls. */
export const SIGNATURE_HEADER = "x-recco-signature";
/** Signatures older than this are refused, so a captured request cannot be replayed later. */
export const SIGNATURE_TOLERANCE_S = 300;

/** HMAC-SHA256 over `<timestamp>.<raw body>`, the scheme Stripe-style webhooks use. */
export function signWebhook(rawBody: string, secret: string, now = new Date()): string {
  const t = Math.floor(now.getTime() / 1000);
  return `t=${t},v1=${hmac(secret, `${t}.${rawBody}`)}`;
}

export function verifyWebhook(rawBody: string, header: string | undefined, secret: string, now = new Date()): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.trim().split("=") as [string, string]));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || !parts.v1) return false;
  if (Math.abs(now.getTime() / 1000 - t) > SIGNATURE_TOLERANCE_S) return false;
  const expected = Buffer.from(hmac(secret, `${t}.${rawBody}`), "hex");
  const given = Buffer.from(parts.v1, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function hmac(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}
