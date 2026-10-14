import { describe, expect, it } from "vitest";
import { signZernio, verifyZernioSignature, ZernioProvider } from "./zernio";

/** A real `message.received` delivery, captured 2026-10-14. */
const zernioPayload = {
  id: "4c2c53a2-c34a-43b4-8319-4c2c464acf67",
  event: "message.received",
  message: {
    id: "6acec7ded1d3edef0172ab40",
    conversationId: "6acec7ded1d3edef0172ab3f",
    platform: "sms",
    platformMessageId: "756b7c9d-e038-4f57-b67c-f73b47699fe0",
    direction: "incoming",
    text: "King of queens - classic and funny ",
    attachments: [],
    sender: { id: "+17057189390", name: "+17057189390", phoneNumber: "+17057189390" },
    sentAt: "2026-10-14T00:07:58.787Z",
    isRead: false,
  },
  conversation: { id: "6acec7ded1d3edef0172ab3f", platformConversationId: "+17057189390", status: "active" },
  account: { id: "6acec4bb6e67e098070b190e", platform: "sms", username: "+13322201535", displayName: "+13322201535" },
  timestamp: "2026-10-14T00:07:58.793Z",
};

describe("ZernioProvider", () => {
  const zernio = new ZernioProvider();

  it("reads an incoming SMS", () => {
    expect(zernio.parseInbound(zernioPayload)).toEqual({
      provider: "zernio",
      providerMessageId: "6acec7ded1d3edef0172ab40",
      from: "+17057189390",
      to: "+13322201535",
      body: "King of queens - classic and funny ",
      receivedAt: "2026-10-14T00:07:58.787Z",
    });
  });

  it("ignores other events, outgoing messages and other platforms", () => {
    expect(zernio.parseInbound({ ...zernioPayload, event: "message.sent" })).toBeNull();
    expect(zernio.parseInbound({ ...zernioPayload, message: { ...zernioPayload.message, direction: "outgoing" } })).toBeNull();
    expect(zernio.parseInbound({ ...zernioPayload, message: { ...zernioPayload.message, platform: "whatsapp" } })).toBeNull();
    expect(zernio.parseInbound({ event: "webhook.test" })).toBeNull();
    expect(zernio.parseInbound(null)).toBeNull();
  });
});

describe("Zernio signatures", () => {
  const raw = JSON.stringify(zernioPayload);

  it("verify with the right secret and body", () => {
    expect(verifyZernioSignature(raw, signZernio(raw, "s3cret"), "s3cret")).toBe(true);
  });

  it("fail with the wrong secret, a changed body, or no header", () => {
    const sig = signZernio(raw, "s3cret");
    expect(verifyZernioSignature(raw, sig, "other")).toBe(false);
    expect(verifyZernioSignature(raw + " ", sig, "s3cret")).toBe(false);
    expect(verifyZernioSignature(raw, undefined, "s3cret")).toBe(false);
    expect(verifyZernioSignature(raw, "not-hex", "s3cret")).toBe(false);
  });
});
