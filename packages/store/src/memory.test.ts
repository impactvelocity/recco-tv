import { buildInbox, withTrackRecords } from "@recco/core";
import { describe, expect, it } from "vitest";
import { MemoryStore } from "./memory";
import { DEMO, seedDemo } from "./seed";

describe("MemoryStore", () => {
  it("seeds a demo household with three friends and thirteen cards", async () => {
    const store = new MemoryStore();
    await seedDemo(store, "salt");
    const inbox = await store.getInbox(DEMO.householdId);
    expect(inbox?.friends).toHaveLength(3);
    expect(inbox?.cards).toHaveLength(13);
    const jordan = withTrackRecords(inbox!.friends, inbox!.cards).find((f) => f.name === "Jordan");
    expect(jordan).toMatchObject({ ratedUp: 3, rated: 4 });
    const items = buildInbox(inbox!.cards);
    expect(items.filter((i) => i.kind === "stack")).toHaveLength(1);
    expect(items.find((i) => i.cards[0]!.title === "The Bear")?.cards).toHaveLength(2);
    expect(items.at(-1)?.watched).toBe(true);
  });

  it("only takes a pairing code once", async () => {
    const store = new MemoryStore();
    const code = { code: "48213", deviceId: "d1", expiresAt: "2026-10-08T12:10:00Z" };
    expect(await store.putPairingCode(code)).toBe(true);
    expect(await store.putPairingCode({ ...code, deviceId: "d2" })).toBe(false);
  });

  it("sees a provider message id once", async () => {
    const store = new MemoryStore();
    expect(await store.markSeen("p1")).toBe(true);
    expect(await store.markSeen("p1")).toBe(false);
  });

  it("keeps households apart", async () => {
    const store = new MemoryStore();
    await seedDemo(store, "salt");
    expect(await store.getCard("hh_other", "card_demo_01")).toBeNull();
    expect(await store.getCard(DEMO.householdId, "card_demo_01")).not.toBeNull();
  });

  it("returns copies, not live objects", async () => {
    const store = new MemoryStore();
    await seedDemo(store, "salt");
    const c = await store.getCard(DEMO.householdId, "card_demo_01");
    c!.title = "changed";
    expect((await store.getCard(DEMO.householdId, "card_demo_01"))?.title).toBe("Slow Horses");
  });
});
