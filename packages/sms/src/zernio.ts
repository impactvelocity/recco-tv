import { createHmac, timingSafeEqual } from "node:crypto";
import type { InboundText, SmsProvider } from "./types";

/** Hex HMAC-SHA256 of the raw body, keyed with the secret set on the Zernio webhook. */
export const ZERNIO_SIGNATURE_HEADER = "x-zernio-signature";

/**
 * The parts of Zernio's `message.received` webhook that Recco reads.
 * https://docs.zernio.com/webhooks
 */
export interface ZernioMessageReceived {
  id: string;
  event: "message.received";
  message: {
    id: string;
    platform: string;
    direction: string;
    text: string | null;
    sender: { phoneNumber?: string; id: string };
    sentAt: string;
  };
  account: { platform: string; username: string };
  timestamp: string;
}

/**
 * Reads an incoming SMS from Zernio's inbox webhook. Anything else Zernio sends
 * (outgoing messages, other platforms, `webhook.test`, post events) is null.
 */
export class ZernioProvider implements SmsProvider {
  readonly name = "zernio" as const;

  parseInbound(payload: unknown): InboundText | null {
    if (!payload || typeof payload !== "object") return null;
    const p = payload as Partial<ZernioMessageReceived>;
    const m = p.message;
    if (p.event !== "message.received" || !m || m.platform !== "sms" || m.direction !== "incoming") return null;
    const from = m.sender?.phoneNumber ?? m.sender?.id;
    if (typeof m.id !== "string" || !m.id || typeof from !== "string" || typeof m.text !== "string") return null;
    return {
      provider: "zernio",
      providerMessageId: m.id,
      from,
      to: p.account?.username ?? "",
      body: m.text,
      receivedAt: m.sentAt ?? p.timestamp ?? new Date().toISOString(),
    };
  }
}

/** Zernio signs the raw body only, with no timestamp; resends are caught by intake's duplicate guard. */
export function verifyZernioSignature(rawBody: string, header: string | undefined, secret: string): boolean {
  if (!header || !/^[0-9a-f]+$/i.test(header)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const given = Buffer.from(header, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function signZernio(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}
