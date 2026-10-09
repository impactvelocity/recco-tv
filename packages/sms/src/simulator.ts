import { newId } from "@recco/core";
import type { InboundText, SmsProvider } from "./types";

export interface SimulatedText {
  from: string;
  body: string;
  /** Lets a test send the same message twice. */
  providerMessageId?: string;
}

/** Local stand-in for a real SMS provider. */
export class SimulatorProvider implements SmsProvider {
  readonly name = "simulator" as const;

  constructor(private readonly reccoNumber: string) {}

  /** Build the payload a phone would produce when texting the Recco number. */
  text({ from, body, providerMessageId }: SimulatedText, now = new Date()): InboundText {
    return {
      provider: "simulator",
      providerMessageId: providerMessageId ?? `sim_${newId(now)}`,
      from,
      to: this.reccoNumber,
      body,
      receivedAt: now.toISOString(),
    };
  }

  parseInbound(payload: unknown): InboundText | null {
    if (!payload || typeof payload !== "object") return null;
    const p = payload as Partial<InboundText>;
    if (p.provider !== "simulator" || typeof p.from !== "string" || typeof p.body !== "string") return null;
    if (typeof p.providerMessageId !== "string" || typeof p.receivedAt !== "string") return null;
    return {
      provider: "simulator",
      providerMessageId: p.providerMessageId,
      from: p.from,
      to: typeof p.to === "string" ? p.to : this.reccoNumber,
      body: p.body,
      receivedAt: p.receivedAt,
    };
  }
}
