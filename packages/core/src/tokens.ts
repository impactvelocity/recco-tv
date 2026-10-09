import { createHash, timingSafeEqual } from "node:crypto";
import { newSecret } from "./ids";

/** Device tokens are "<deviceId>.<secret>". Only a hash is stored. */
export function newDeviceToken(deviceId: string): string {
  return `${deviceId}.${newSecret(40)}`;
}

export function deviceIdFromToken(token: string): string | null {
  const dot = token.indexOf(".");
  return dot > 0 ? token.slice(0, dot) : null;
}

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function deviceTokenMatches(token: string, tokenHash: string): boolean {
  const a = Buffer.from(hashDeviceToken(token), "hex");
  const b = Buffer.from(tokenHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
