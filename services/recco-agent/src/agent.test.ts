import type { AgentJob } from "@recco/core";
import { createFixtureSources, type Sources } from "@recco/sources";
import { DEMO, MemoryPublisher, MemoryStore, seedDemo } from "@recco/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createReccoAgent } from "./agent";
import { runAgentJob } from "./run-job";
import { scriptedModel } from "./test-model";
import { friendNamedInText, herWords } from "./tools/save-cards";

let store: MemoryStore;
let publisher: MemoryPublisher;
let sources: Sources;

beforeEach(async () => {
  store = new MemoryStore();
  publisher = new MemoryPublisher();
  sources = createFixtureSources();
  await seedDemo(store, "salt");
});

async function job(body: string): Promise<AgentJob> {
  const j = { householdId: DEMO.householdId, messageId: `m_${Math.random()}`, body };
  await store.putMessage({ id: j.messageId, householdId: j.householdId, receivedAt: "x", body, status: "pending", provider: "simulator", providerMessageId: "p" });
  return j;
}

const run = (script: Parameters<typeof scriptedModel>[0], j: AgentJob) =>
  createReccoAgent({ store, publisher, sources, model: scriptedModel(script), modelName: "scripted" })(j);

const cardsFor = (j: AgentJob) => [...store.cards.values()].filter((c) => c.messageId === j.messageId);

describe("Recco agent", () => {
  it("looks a title up and saves it under an existing friend, with services filled in", async () => {
    const j = await job("King of Queens - jordan said it was funny and worth watching");
    const report = await run(
      [
        [{ tool: "find_titles", input: { title: "King of Queens" } }, { tool: "list_friends", input: {} }],
        [{ tool: "save_cards", input: { cards: [{ imdbId: "tt0165581", friendName: "Jordan", note: "said it was funny and worth watching", needsCheck: false, candidateImdbIds: [] }] } }],
      ],
      j,
    );
    expect(cardsFor(j)).toEqual([
      expect.objectContaining({ titleId: "tt0165581", friendId: DEMO.friendIds.jordan, services: ["Prime Video"], note: "said it was funny and worth watching", state: "new" }),
    ]);
    expect(report).toMatchObject({ steps: 2, fellBack: false });
    expect((await store.getMessage(j.householdId, j.messageId))?.status).toBe("done");
  });

  it("never invents a title: an id find_titles did not return becomes an unsorted note", async () => {
    const j = await job("that new show everyone is talking about");
    await run([[{ tool: "save_cards", input: { cards: [{ imdbId: "tt9999999", friendName: null, note: null, needsCheck: false, candidateImdbIds: [] }] } }]], j);
    expect(cardsFor(j)).toEqual([expect.objectContaining({ kind: "unsorted", note: "that new show everyone is talking about" })]);
  });

  it("only reads links that are in her text", async () => {
    const spy = vi.spyOn(sources.posts, "read");
    const j = await job("Severance");
    await run(
      [
        [{ tool: "read_post", input: { url: "https://evil.example/exfiltrate" } }],
        [{ tool: "save_cards", input: { cards: [] } }],
      ],
      j,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("drops a friend name that is not in her text (e.g. the post's author)", async () => {
    const url = "https://www.tiktok.com/@reccodemo/video/7420000000000000002";
    const j = await job(url);
    await run(
      [
        [{ tool: "read_post", input: { url } }],
        [{ tool: "find_titles", input: { title: "The Last of Us" } }],
        [{ tool: "save_cards", input: { cards: [{ imdbId: "tt3581920", friendName: "reccodemo", note: null, needsCheck: false, candidateImdbIds: [] }] } }],
      ],
      j,
    );
    expect(cardsFor(j)).toEqual([expect.objectContaining({ origin: "internet", friendId: undefined, source: "link", sourceUrl: url })]);
  });

  it("builds a Check these card with candidates and their services", async () => {
    const j = await job("the office");
    await run(
      [
        [{ tool: "find_titles", input: { title: "The Office" } }],
        [{ tool: "save_cards", input: { cards: [{ imdbId: null, friendName: null, note: null, needsCheck: true, candidateImdbIds: ["tt0386676", "tt0290978"] }] } }],
      ],
      j,
    );
    const [card] = cardsFor(j);
    expect(card).toMatchObject({ needsCheck: true, titleId: undefined });
    expect(card?.candidates.map((c) => [c.titleId, c.services])).toEqual([
      ["tt0386676", ["Prime Video"]],
      ["tt0290978", ["BritBox"]],
    ]);
  });

  it("keeps her words when nothing is saved (the model never called save_cards)", async () => {
    const j = await job("hmm something with dragons");
    const report = await run(["stop"], j);
    expect(report.fellBack).toBe(true);
    expect(cardsFor(j)).toEqual([expect.objectContaining({ kind: "unsorted", note: "hmm something with dragons" })]);
  });

  it("saves still happen with no services when availability fails (R5.3)", async () => {
    vi.spyOn(sources.availability, "services").mockRejectedValue(new Error("down"));
    const j = await job("Severance");
    await run(
      [
        [{ tool: "find_titles", input: { title: "Severance" } }],
        [{ tool: "save_cards", input: { cards: [{ imdbId: "tt11280740", friendName: null, note: null, needsCheck: false, candidateImdbIds: [] }] } }],
      ],
      j,
    );
    expect(cardsFor(j)).toEqual([expect.objectContaining({ titleId: "tt11280740", services: [] })]);
  });

  it("marks the message failed and tells the TVs when the model errors (R3.8)", async () => {
    const j = await job("Severance");
    const broken = scriptedModel([]);
    broken.doGenerate = async () => {
      throw new Error("model unavailable");
    };
    const agent = createReccoAgent({ store, publisher, sources, model: broken, modelName: "broken" });
    expect(await runAgentJob(j, agent, { store, publisher })).toBe("failed");
    expect(await store.getMessage(j.householdId, j.messageId)).toMatchObject({ status: "failed", body: "Severance" });
    expect(publisher.sent.at(-1)?.event).toEqual({ type: "card.failed", messageId: j.messageId });
  });
});

describe("guards", () => {
  it("friend names must appear in her text", () => {
    expect(friendNamedInText("jordan", "King of Queens - Jordan said it was funny")).toBe("Jordan");
    expect(friendNamedInText("reccodemo", "https://tiktok.com/@reccodemo/video/1")).toBeNull();
    expect(friendNamedInText("Priya", "Severance")).toBeNull();
    expect(friendNamedInText(null, "x")).toBeNull();
  });

  it("notes must be her words, or her whole text", () => {
    expect(herWords("said it was funny", "King of Queens - Jordan said it was   funny")).toBe("said it was funny");
    expect(herWords("Jordan thinks it's hilarious", "King of Queens - Jordan said it was funny")).toBe("King of Queens - Jordan said it was funny");
    expect(herWords(null, "x")).toBeUndefined();
  });
});
