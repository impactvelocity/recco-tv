import type { InboundText, SmsProvider } from "./types";

/**
 * The JSON AWS End User Messaging publishes to SNS for each inbound text.
 * https://docs.aws.amazon.com/sms-voice/latest/userguide/two-way-sms-payload.html
 */
export interface EumInboundPayload {
  originationNumber: string;
  destinationNumber: string;
  messageKeyword?: string;
  messageBody: string;
  inboundMessageId: string;
  previousPublishedMessageId?: string;
}

/**
 * Reads an inbound text in the AWS End User Messaging shape. Accepts the bare
 * payload (the local webhook), an SNS notification wrapping it, or an SQS
 * message body holding that notification, so the same code runs locally and
 * on AWS.
 */
export class AwsEumProvider implements SmsProvider {
  readonly name = "aws" as const;

  parseInbound(payload: unknown, receivedAt = new Date().toISOString()): InboundText | null {
    const p = unwrap(payload);
    if (!p) return null;
    return {
      provider: "aws",
      providerMessageId: p.inboundMessageId,
      from: p.originationNumber,
      to: p.destinationNumber,
      body: p.messageBody,
      receivedAt: p.timestamp ?? receivedAt,
    };
  }
}

function unwrap(payload: unknown, depth = 0): (EumInboundPayload & { timestamp?: string }) | null {
  if (depth > 6) return null;
  if (typeof payload === "string") {
    try {
      return unwrap(JSON.parse(payload), depth + 1);
    } catch {
      return null;
    }
  }
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;

  // SNS notification: { Type: "Notification", Message: "<json>", Timestamp }
  if (o.Type === "Notification" && typeof o.Message === "string") {
    const inner = unwrap(o.Message, depth + 1);
    return inner && typeof o.Timestamp === "string" ? { ...inner, timestamp: o.Timestamp } : inner;
  }
  // SQS record: { body: "<sns json>" }
  if (typeof o.body === "string" && !("messageBody" in o)) return unwrap(o.body, depth + 1);

  const { originationNumber, destinationNumber, messageBody, inboundMessageId } = o;
  if (
    typeof originationNumber !== "string" ||
    typeof destinationNumber !== "string" ||
    typeof messageBody !== "string" ||
    typeof inboundMessageId !== "string" ||
    !inboundMessageId
  ) {
    return null;
  }
  return o as unknown as EumInboundPayload;
}
