import { describe, expect, it } from "vitest";
import { SimulatorProvider } from "./simulator";

describe("SimulatorProvider", () => {
  const sim = new SimulatorProvider("+16045550142");

  it("builds an inbound text that round-trips through parseInbound", () => {
    const text = sim.text({ from: "+16045551234", body: "Severance" }, new Date("2026-10-08T12:00:00Z"));
    expect(text).toMatchObject({ provider: "simulator", to: "+16045550142", body: "Severance" });
    expect(sim.parseInbound(JSON.parse(JSON.stringify(text)))).toEqual(text);
  });

  it("gives each text its own id unless told otherwise", () => {
    const a = sim.text({ from: "1", body: "a" });
    const b = sim.text({ from: "1", body: "a" });
    expect(a.providerMessageId).not.toBe(b.providerMessageId);
    expect(sim.text({ from: "1", body: "a", providerMessageId: "x" }).providerMessageId).toBe("x");
  });

  it("rejects payloads from other providers", () => {
    expect(sim.parseInbound({ provider: "aws", from: "1", body: "x" })).toBeNull();
    expect(sim.parseInbound("nope")).toBeNull();
  });
});
