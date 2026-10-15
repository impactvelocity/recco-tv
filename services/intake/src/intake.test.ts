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

describe("forget me by text (R11.4)", () => {
  it.each(["FORGET ME", "forget me", "  Forget me! "])("%j deletes the household, saves nothing and starts nothing", async (body) => {
    const result = await send(DEMO.phone, body);
    expect(result).toEqual({ kind: "forgotten", householdId: DEMO.householdId });
    expect(await store.getHousehold(DEMO.householdId)).toBeNull();
    expect(await store.getPhoneLink(hashPhone(DEMO.phone, SALT))).toBeNull();
    expect(await store.getDevice(DEMO.deviceId)).toBeNull();
    expect([...store.cards.values(), ...store.friends.values(), ...store.messages.values()]).toEqual([]);
    expect(jobs).toEqual([]);
    expect(publisher.sent).toEqual([{ channelId: "ch_demo_household", event: { type: "household.deleted" } }]);
  });

  it("afterwards, texts from the phone are from an unknown number (R11.8)", async () => {
    await send(DEMO.phone, "FORGET ME");
    expect(await send(DEMO.phone, "Severance")).toEqual({ kind: "dropped", reason: "unknown-phone" });
    expect(store.messages.size).toBe(0);
  });

  it("the phone can pair again and starts empty", async () => {
    await send(DEMO.phone, "FORGET ME");
    const result = await send(DEMO.phone, "48213");
    expect(result).toMatchObject({ kind: "paired", newHousehold: true });
    if (result.kind !== "paired") throw new Error();
    expect(result.householdId).not.toBe(DEMO.householdId);
    expect((await store.getInbox(result.householdId))?.cards).toEqual([]);
  });

  it("a title that starts the same way is a normal text", async () => {
    expect(await send(DEMO.phone, "Forget Me Not")).toMatchObject({ kind: "queued" });
    expect(await store.getHousehold(DEMO.householdId)).not.toBeNull();
  });

  it("from an unknown phone is dropped", async () => {
    expect(await send("+16045550000", "FORGET ME")).toEqual({ kind: "dropped", reason: "unknown-phone" });
    expect(await store.getHousehold(DEMO.householdId)).not.toBeNull();
  });
});

describe("moving a TV (R1.7 to R1.9)", () => {
  const code = async (value: string, deviceId = "dev_new") => {
    await store.putPairingCode({ code: value, deviceId, expiresAt: "2026-10-08T12:10:00.000Z" });
  };

  it("pairing the same phone again stays put", async () => {
    await send(DEMO.phone, "48213");
    await code("22222");
    expect(await send(DEMO.phone, "22222")).toMatchObject({ kind: "paired", householdId: DEMO.householdId, plan: { kind: "stay" } });
    expect((await store.listHouseholdDevices(DEMO.householdId)).sort()).toEqual([DEMO.deviceId, "dev_new"].sort());
  });

  it("the only TV moving to another phone deletes the old household", async () => {
    await code("22222", DEMO.deviceId);
    const result = await send("+17785552222", "22222");
    expect(result).toMatchObject({ kind: "paired", newHousehold: true, plan: { kind: "move", from: DEMO.householdId, leaving: "forget" } });
    if (result.kind !== "paired") throw new Error();

    expect(await store.getHousehold(DEMO.householdId)).toBeNull();
    expect(await store.getPhoneLink(hashPhone(DEMO.phone, SALT))).toBeNull();
    expect([...store.cards.values()].filter((c) => c.householdId === DEMO.householdId)).toEqual([]);
    expect(await store.getDevice(DEMO.deviceId)).toMatchObject({ householdId: result.householdId });
    expect(await store.listHouseholdDevices(result.householdId)).toEqual([DEMO.deviceId]);
    expect(publisher.sent).toEqual([
      { channelId: "ch_demo_device", event: { type: "paired", phoneLast4: "2222", householdId: result.householdId } },
      { channelId: "ch_demo_household", event: { type: "household.deleted" } },
    ]);
  });

  it("a TV leaving a household that other TVs still use keeps it for them, on a new channel", async () => {
    await send(DEMO.phone, "48213"); // dev_new joins the demo household
    publisher.sent.length = 0;
    await code("22222");
    const result = await send("+17785552222", "22222");
    expect(result).toMatchObject({ kind: "paired", plan: { kind: "move", from: DEMO.householdId, leaving: "rotate" } });
    if (result.kind !== "paired") throw new Error();

    const demo = await store.getInbox(DEMO.householdId);
    expect(demo?.cards).toHaveLength(13);
    expect(demo?.deviceIds).toEqual([DEMO.deviceId]);
    expect(demo?.household.channelId).not.toBe("ch_demo_household");
    expect(await store.getDevice("dev_new")).toMatchObject({ householdId: result.householdId });
    expect(publisher.sent).toEqual([
      { channelId: "ch_dev_new", event: { type: "paired", phoneLast4: "2222", householdId: result.householdId } },
      { channelId: "ch_demo_household", event: { type: "channel.changed" } },
    ]);
    // Nothing that names the new channel goes out on the old one.
    expect(JSON.stringify(publisher.sent)).not.toContain(demo!.household.channelId);
  });

  it("a TV can move to a phone that already has a household", async () => {
    await send(DEMO.phone, "48213"); // dev_new joins the demo household
    await store.createDevice({ id: "dev_other", tokenHash: "x", channelId: "ch_dev_other", createdAt: clock.toISOString() });
    await code("33333", "dev_other");
    const other = await send("+17785553333", "33333");
    if (other.kind !== "paired") throw new Error();
    await code("22222");
    expect(await send("+17785553333", "22222")).toMatchObject({ kind: "paired", householdId: other.householdId, newHousehold: false });
    expect((await store.listHouseholdDevices(other.householdId)).sort()).toEqual(["dev_new", "dev_other"]);
  });
});

describe("a delete that stopped partway", () => {
  it("is finished by the next text from the phone, which counts as unknown", async () => {
    store.households.delete(DEMO.householdId); // META went first; the rest is still there
    expect(await send(DEMO.phone, "Severance")).toEqual({ kind: "dropped", reason: "unknown-phone" });
    expect(await store.getPhoneLink(hashPhone(DEMO.phone, SALT))).toBeNull();
    expect(await store.getDevice(DEMO.deviceId)).toBeNull();
    expect(store.cards.size).toBe(0);
    expect(jobs).toEqual([]);
  });

  it("is finished when the phone pairs again, which starts a new household", async () => {
    store.households.delete(DEMO.householdId);
    expect(await send(DEMO.phone, "48213")).toMatchObject({ kind: "paired", newHousehold: true });
    expect(store.cards.size).toBe(0);
  });

  it("a text that lands while the household is being deleted is swept up", async () => {
    const put = store.putMessage.bind(store);
    store.putMessage = async (m) => {
      await put(m);
      await store.deleteHousehold(DEMO.householdId);
    };
    expect(await send(DEMO.phone, "Severance")).toEqual({ kind: "dropped", reason: "unknown-phone" });
    expect(store.messages.size).toBe(0);
    expect(jobs).toEqual([]);
  });
});
