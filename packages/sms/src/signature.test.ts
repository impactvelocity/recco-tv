import { describe, expect, it } from "vitest";
import { signWebhook, verifyWebhook } from "./signature";

describe("webhook signatures", () => {
  const now = new Date("2026-10-08T12:00:00Z");
  const body = '{"messageBody":"Severance"}';

  it("verify with the right secret and body", () => {
    expect(verifyWebhook(body, signWebhook(body, "s3cret", now), "s3cret", now)).toBe(true);
  });

  it("fail with the wrong secret, a changed body, or no header", () => {
    const sig = signWebhook(body, "s3cret", now);
    expect(verifyWebhook(body, sig, "other", now)).toBe(false);
    expect(verifyWebhook(body + " ", sig, "s3cret", now)).toBe(false);
    expect(verifyWebhook(body, undefined, "s3cret", now)).toBe(false);
    expect(verifyWebhook(body, "garbage", "s3cret", now)).toBe(false);
  });

  it("fail when older than five minutes", () => {
    const sig = signWebhook(body, "s3cret", now);
    expect(verifyWebhook(body, sig, "s3cret", new Date("2026-10-08T12:04:59Z"))).toBe(true);
    expect(verifyWebhook(body, sig, "s3cret", new Date("2026-10-08T12:05:01Z"))).toBe(false);
  });
});
