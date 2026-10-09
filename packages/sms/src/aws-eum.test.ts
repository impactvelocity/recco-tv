import { describe, expect, it } from "vitest";
import { AwsEumProvider } from "./aws-eum";

const payload = {
  originationNumber: "+16045551234",
  destinationNumber: "+16045550142",
  messageKeyword: "KEYWORD_1234",
  messageBody: "Severance",
  inboundMessageId: "cae173d2-66b9-564c-8309-21f858e9fb84",
  previousPublishedMessageId: "x",
};
const expected = {
  provider: "aws",
  providerMessageId: payload.inboundMessageId,
  from: payload.originationNumber,
  to: payload.destinationNumber,
  body: "Severance",
};

describe("AwsEumProvider", () => {
  const eum = new AwsEumProvider();

  it("reads the bare payload", () => {
    expect(eum.parseInbound(payload, "2026-10-08T12:00:00.000Z")).toEqual({ ...expected, receivedAt: "2026-10-08T12:00:00.000Z" });
  });

  it("reads it inside an SNS notification, using the SNS timestamp", () => {
    const sns = { Type: "Notification", Message: JSON.stringify(payload), Timestamp: "2026-10-08T12:00:01.000Z" };
    expect(eum.parseInbound(sns)).toEqual({ ...expected, receivedAt: "2026-10-08T12:00:01.000Z" });
  });

  it("reads it inside an SQS record holding the SNS notification", () => {
    const sns = { Type: "Notification", Message: JSON.stringify(payload), Timestamp: "2026-10-08T12:00:01.000Z" };
    expect(eum.parseInbound({ messageId: "q1", body: JSON.stringify(sns) })).toMatchObject(expected);
  });

  it.each([
    null,
    "not json",
    {},
    { ...payload, messageBody: 5 },
    { ...payload, inboundMessageId: "" },
  ])("rejects %j", (bad) => {
    expect(eum.parseInbound(bad)).toBeNull();
  });
});
