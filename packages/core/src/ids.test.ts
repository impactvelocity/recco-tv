import { describe, expect, it } from "vitest";
import { newId, newSecret } from "./ids";

describe("ids", () => {
  it("sort by time", () => {
    const a = newId(new Date("2026-01-01T00:00:00Z"));
    const b = newId(new Date("2026-01-01T00:00:00.001Z"));
    expect(a < b).toBe(true);
    expect(a).toHaveLength(21);
  });

  it("secrets are long and unique", () => {
    expect(newSecret()).toHaveLength(32);
    expect(newSecret()).not.toBe(newSecret());
  });
});
