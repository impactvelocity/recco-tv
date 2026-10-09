export type ProviderName = "aws" | "zernio" | "simulator";

/** One inbound text, the same shape whichever provider delivered it. */
export interface InboundText {
  provider: ProviderName;
  providerMessageId: string;
  /** Sender as the provider gave it. Intake normalises it. */
  from: string;
  /** The Recco number it was sent to. */
  to: string;
  body: string;
  receivedAt: string;
}

/**
 * A provider turns its own payload into an InboundText. Recco never sends
 * texts, so there is no outbound method.
 */
export interface SmsProvider {
  readonly name: ProviderName;
  parseInbound(payload: unknown): InboundText | null;
}
