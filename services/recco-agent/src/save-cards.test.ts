import { MemoryPublisher, MemoryStore } from "@recco/store";
import { beforeEach, describe, expect, it } from "vitest";
import { saveCards } from "./save-cards";

const now = () => new Date("2026-10-08T12:00:00Z");
let store: MemoryStore;
let publisher: MemoryPublisher;

beforeEach(async () => {
  store = new MemoryStore();
  publisher = new MemoryPublisher();
  await store.createHousehold({ id: "hh1", country: "ca", phoneLast4: "1234", channelId: "ch1", createdAt: "x" });
  await store.putFriend({ id: "fr1", householdId: "hh1", name: "Jordan", createdAt: "x" });
});

async function job(body: string) {
  const j = { householdId: "hh1", messageId: `m_${body.length}`, body };
  await store.putMessage({ id: j.messageId, householdId: "hh1", receivedAt: "x", body, status: "pending", provider: "simulator", providerMessageId: "p" });
  return j;
}

describe("saveCards", () => {
  it("saves a card under an existing friend, ignoring case", async () => {
    const j = await job("King of Queens - jordan said it was funny");
    const { saved } = await saveCards(j, [{ kind: "title", titleId: "tt0165581", title: "The King of Queens", friendName: "JORDAN", note: "jordan said it was funny" }], new Set(["tt0165581"]), { store, publisher, now });
    expect(saved[0]).toMatchObject({ origin: "friend", friendId: "fr1", state: "new", source: "text" });
    expect((await store.getMessage("hh1", j.messageId))?.status).toBe("done");
    expect(publisher.sent.at(-1)).toMatchObject({ channelId: "ch1", event: { type: "card.ready" } });
  });

  it("creates a friend it has not seen, first name only", async () => {
    const j = await job("Severance - Priya Kaur loved it");
    const { saved } = await saveCards(j, [{ kind: "title", titleId: "tt11280740", title: "Severance", friendName: "priya kaur" }], new Set(["tt11280740"]), { store, publisher, now });
    const friends = await store.listFriends("hh1");
    expect(friends.map((f) => f.name).sort()).toEqual(["Jordan", "Priya"]);
    expect(saved[0]?.friendId).toBe(friends.find((f) => f.name === "Priya")?.id);
  });

  it("files a text with no name under From me and a bare link under From the internet", async () => {
    const a = await saveCards(await job("Severance"), [{ kind: "title", titleId: "tt1", title: "Severance" }], new Set(["tt1"]), { store, publisher, now });
    expect(a.saved[0]?.origin).toBe("me");
    const b = await saveCards(await job("https://tiktok.com/x"), [{ kind: "title", titleId: "tt1", title: "Severance" }], new Set(["tt1"]), { store, publisher, now });
    expect(b.saved[0]).toMatchObject({ origin: "internet", source: "link", sourceUrl: "https://tiktok.com/x" });
  });

  it("never invents a title: unknown ids are rejected and her words are kept", async () => {
    const j = await job("some show nobody has heard of");
    const { saved, rejected } = await saveCards(j, [{ kind: "title", titleId: "tt9999", title: "Made Up" }], new Set(["tt1"]), { store, publisher, now });
    expect(rejected).toHaveLength(1);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ kind: "unsorted", note: "some show nobody has heard of", titleId: undefined });
  });

  it("groups several shows from one post", async () => {
    const j = await job("https://tiktok.com/x Steph sent this");
    const ids = new Set(["tt1", "tt2"]);
    const { saved } = await saveCards(j, [
      { kind: "title", titleId: "tt1", title: "A", friendName: "Steph" },
      { kind: "title", titleId: "tt2", title: "B", friendName: "Steph" },
    ], ids, { store, publisher, now });
    expect(saved).toHaveLength(2);
    expect(saved[0]?.groupId).toBeDefined();
    expect(saved[0]?.groupId).toBe(saved[1]?.groupId);
    expect(new Set(saved.map((c) => c.friendId)).size).toBe(1);
  });

  it("keeps at most three candidates and checks each was looked up", async () => {
    const c = (id: string) => ({ titleId: id, title: "Fargo", type: "series" as const });
    const ok = await saveCards(await job("Fargo"), [{ kind: "title", title: "Fargo", needsCheck: true, candidates: [c("a"), c("b"), c("c"), c("d")] }], new Set(["a", "b", "c", "d"]), { store, publisher, now });
    expect(ok.saved[0]?.candidates).toHaveLength(3);
    expect(ok.saved[0]?.needsCheck).toBe(true);
    const bad = await saveCards(await job("Fargo!"), [{ kind: "title", title: "Fargo", needsCheck: true, candidates: [c("zzz")] }], new Set(["a"]), { store, publisher, now });
    expect(bad.saved[0]?.kind).toBe("unsorted");
  });
});

describe("unsortedTitle", () => {
  it("names an unreadable link for what it is, and keeps her words otherwise", async () => {
    const { unsortedTitle } = await import("./save-cards");
    expect(unsortedTitle("https://www.tiktok.com/@x/video/1 Steph sent this")).toBe("TikTok link");
    expect(unsortedTitle("https://youtu.be/abc")).toBe("YouTube link");
    expect(unsortedTitle("https://example.com/x")).toBe("A link");
    expect(unsortedTitle("that show with the guy in the bunker")).toBe("that show with the guy in the bunker");
  });
});
