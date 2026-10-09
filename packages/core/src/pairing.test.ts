import { describe, expect, it } from "vitest";
import { extractPairingCode, generatePairingCode, isPairingCodeLive, pairingExpiry } from "./pairing";

describe("pairing codes", () => {
  it("are five digits", () => {
    for (const r of [0, 0.5, 0.99999]) {
      expect(generatePairingCode(() => r)).toMatch(/^[1-9]\d{4}$/);
    }
  });

  it.each([
    ["48213", "48213"],
    ["  48213\n", "48213"],
    ["48 213", "48213"],
    ["48-213", "48213"],
  ])("finds the code in %j", (body, code) => {
    expect(extractPairingCode(body)).toBe(code);
  });

  it.each(["4821", "482130", "code 48213", "Severance", "1917", ""])("ignores %j", (body) => {
    expect(extractPairingCode(body)).toBeNull();
  });

  it("last ten minutes", () => {
    const now = new Date("2026-10-08T12:00:00Z");
    const expiresAt = pairingExpiry(now);
    expect(expiresAt).toBe("2026-10-08T12:10:00.000Z");
    expect(isPairingCodeLive(expiresAt, new Date("2026-10-08T12:09:59Z"))).toBe(true);
    expect(isPairingCodeLive(expiresAt, new Date("2026-10-08T12:10:00Z"))).toBe(false);
  });
});
