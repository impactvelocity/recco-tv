export const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;
export const PAIRING_CODE_LENGTH = 5;

/** A five-digit code that never starts with 0, so it reads cleanly aloud. */
export function generatePairingCode(random: () => number = Math.random): string {
  return String(10000 + Math.floor(random() * 90000));
}

/**
 * The code in a pairing text, or null. The whole text must be the code,
 * allowing spaces or dashes between digits ("48213", "48 213", "48-213").
 */
export function extractPairingCode(body: string): string | null {
  const compact = body.trim().replace(/[\s-]/g, "");
  return /^\d{5}$/.test(compact) ? compact : null;
}

export function pairingExpiry(now: Date): string {
  return new Date(now.getTime() + PAIRING_CODE_TTL_MS).toISOString();
}

export function isPairingCodeLive(expiresAt: string, now: Date): boolean {
  return new Date(expiresAt).getTime() > now.getTime();
}
