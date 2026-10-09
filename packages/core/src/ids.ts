const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % 36];
  return out;
}

/** Time-sortable id: 9 base-36 chars of milliseconds, then 12 random chars. */
export function newId(now: Date = new Date()): string {
  return now.getTime().toString(36).padStart(9, "0") + randomChars(12);
}

/** Long random secret for tokens and channel ids. */
export function newSecret(length = 32): string {
  return randomChars(length);
}
