import { hashPhone, type AgentJob } from "@recco/core";
import { SimulatorProvider } from "@recco/sms";
import { DEMO, MemoryPublisher, MemoryStore, seedDemo } from "@recco/store";
import { beforeEach, describe, expect, it } from "vitest";
import { handleInboundText, type IntakeDeps } from "./intake";

const SALT = "test-salt";
const sim = new SimulatorProvider("+16045550142");
let clock = new Date("2026-10-08T12:00:00Z");
let store: MemoryStore;
let publisher: MemoryPublisher;
let jobs: AgentJob[];
let deps: IntakeDeps;

beforeEach(async () => {
  clock = new Date("2026-10-08T12:00:00Z");
  store = new MemoryStore();
  publisher = new MemoryPublisher();
  jobs = [];
  deps = {
    store,
    publisher,
    phoneSalt: SALT,
    defaultCountry: "ca",
    startAgent: async (job) => void jobs.push(job),
    now: () => clock,
  };
  await seedDemo(store, SALT, clock);
  await store.createDevice({ id: "dev_new", tokenHash: "x", channelId: "ch_dev_new", createdAt: clock.toISOString() });
  await store.putPairingCode({ code: "48213", deviceId: "dev_new", expiresAt: "2026-10-08T12:10:00.000Z" });
});

const send = (from: string, body: string, providerMessageId?: string) =>
  handleInboundText(sim.text({ from, body, providerMessageId }, clock), deps);

describe("pairing", () => {
  it("a new phone creates a household and links the TV", async () => {
    const result = await send("(604) 555-9876", "48213");
    expect(result).toMatchObject({ kind: "paired", deviceId: "dev_new", newHousehold: true });
    if (result.kind !== "paired") throw new Error();
    const household = await store.getHousehold(result.householdId);
    expect(household?.phoneLast4).toBe("9876");
    expect(await store.getPhoneLink(hashPhone("+16045559876", SALT))).toBe(result.householdId);
    expect((await store.getDevice("dev_new"))?.householdId).toBe(result.householdId);
    expect(await store.getPairingCode("48213")).toBeNull();
    expect(publisher.sent).toEqual([
      { channelId: "ch_dev_new", event: { type: "paired", phoneLast4: "9876", householdId: result.householdId } },
    ]);
  });

  it("a phone that already has a household attaches a second TV to it", async () => {
    const result = await send(DEMO.phone, "48 213");
    expect(result).toMatchObject({ kind: "paired", householdId: DEMO.householdId, newHousehold: false });
  });

  it("an expired code is dropped and nothing is stored", async () => {
    clock = new Date("2026-10-08T12:10:00Z");
    expect(await send("(604) 555-9876", "48213")).toEqual({ kind: "dropped", reason: "dead-code" });
    expect(store.dropped).toBe(1);
    expect(store.households.size).toBe(1);
  });

  it("an unknown code is dropped", async () => {
    expect(await send("(604) 555-9876", "11111")).toEqual({ kind: "dropped", reason: "dead-code" });
  });

  it("never stores the full number", async () => {
    await send("(604) 555-9876", "48213");
    const dump = JSON.stringify([...store.households.values(), ...store.phoneLinks.entries(), ...store.devices.values()]);
    expect(dump).not.toContain("6045559876");
  });
});

describe("texts", () => {
  it("from a linked phone: saves the message, sends pending, starts the agent", async () => {
    const result = await send(DEMO.phone, "Severance");
    expect(result).toMatchObject({ kind: "queued", householdId: DEMO.householdId });
    if (result.kind !== "queued") throw new Error();
    expect(await store.getMessage(DEMO.householdId, result.messageId)).toMatchObject({ body: "Severance", status: "pending" });
    expect(publisher.sent.at(-1)).toMatchObject({ channelId: "ch_demo_household", event: { type: "card.pending" } });
    expect(jobs).toEqual([{ householdId: DEMO.householdId, messageId: result.messageId, body: "Severance" }]);
  });

  it("from an unknown phone: dropped, only counted", async () => {
    expect(await send("+16045550000", "Severance")).toEqual({ kind: "dropped", reason: "unknown-phone" });
    expect(store.dropped).toBe(1);
    expect(store.messages.size).toBe(0);
    expect(publisher.sent).toHaveLength(0);
  });

  it("the same provider message id is processed once", async () => {
    await send(DEMO.phone, "Severance", "dup-1");
    expect(await send(DEMO.phone, "Severance", "dup-1")).toEqual({ kind: "duplicate" });
    expect(jobs).toHaveLength(1);
  });

  it("a malformed sender is dropped", async () => {
    expect(await send("SHORTCODE", "hi")).toEqual({ kind: "dropped", reason: "bad-number" });
  });
});
