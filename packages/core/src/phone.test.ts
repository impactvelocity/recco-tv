import { describe, expect, it } from "vitest";
import { hashPhone, normalizePhone, phoneLast4 } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["(604) 555-0142", "+16045550142"],
    ["604.555.0142", "+16045550142"],
    ["1 604 555 0142", "+16045550142"],
    ["+1 604 555 0142", "+16045550142"],
    ["+44 20 7946 0958", "+442079460958"],
  ])("%s → %s", (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it.each(["", "12345", "hello", "+12"])("rejects %j", (raw) => {
    expect(normalizePhone(raw)).toBeNull();
  });
});

describe("phone privacy", () => {
  it("keeps only the last four digits in the clear", () => {
    expect(phoneLast4("+16045551234")).toBe("1234");
  });

  it("hashes with a salt, deterministically", () => {
    const a = hashPhone("+16045551234", "salt-a");
    expect(a).toBe(hashPhone("+16045551234", "salt-a"));
    expect(a).not.toBe(hashPhone("+16045551234", "salt-b"));
    expect(a).not.toContain("6045551234");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("refuses to hash without a salt", () => {
    expect(() => hashPhone("+16045551234", "")).toThrow();
  });
});
