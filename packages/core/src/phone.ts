import { createHash } from "node:crypto";

/**
 * Normalise a phone number to E.164. Bare 10-digit numbers are treated as
 * North American (+1). Returns null when the input cannot be a phone number.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function phoneLast4(e164: string): string {
  return e164.replace(/\D/g, "").slice(-4);
}

/** Salted SHA-256 of the E.164 number. The full number is never stored. */
export function hashPhone(e164: string, salt: string): string {
  if (!salt) throw new Error("hashPhone needs a salt");
  return createHash("sha256").update(`${salt}:${e164}`).digest("hex");
}
