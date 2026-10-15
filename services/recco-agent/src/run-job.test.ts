import type { AgentJob } from "@recco/core";
import { DEMO, MemoryPublisher, MemoryStore, seedDemo } from "@recco/store";
import { beforeEach, describe, expect, it } from "vitest";
import { runAgentJob, type BurstOptions } from "./run-job";

let store: MemoryStore;
let publisher: MemoryPublisher;
let clock: number;
let burst: BurstOptions;
const T0 = Date.parse("2026-10-14T01:17:11.456Z");

beforeEach(async () => {
  store = new MemoryStore();
  publisher = new MemoryPublisher();
  await seedDemo(store, "salt");
  clock = T0;
  // A fake clock: sleeping moves time forward instead of waiting.
  burst = { now: () => new Date(clock), sleep: async (ms) => void (clock += ms) };
});

async function text(id: string, afterMs: number, body: string): Promise<AgentJob> {
  const job = { householdId: DEMO.householdId, messageId: id, body };
  await store.putMessage({ ...job, id, receivedAt: new Date(T0 + afterMs).toISOString(), status: "pending", provider: "simulator", providerMessageId: id });
  return job;
}

function recordingAgent() {
  const seen: AgentJob[] = [];
  return { seen, agent: async (job: AgentJob) => void seen.push(job) };
}

describe("texts sent back to back", () => {
  it("are read once, as one text, by the oldest; the newer one steps aside", async () => {
    const words = await text("m_words", 0, "Top 10 movies to watch for thanksgiving ");
    const link = await text("m_link", 354, "https://www.imdb.com/list/ls086453555/");
    const { seen, agent } = recordingAgent();

    // The newer text's run starts first and finds an older text in its burst.
    expect(await runAgentJob(link, agent, { store, publisher, burst })).toBe("merged");
    expect(await runAgentJob(words, agent, { store, publisher, burst })).toBe("done");

    expect(seen).toEqual([{ ...words, body: "Top 10 movies to watch for thanksgiving\nhttps://www.imdb.com/list/ls086453555/" }]);
    expect(clock).toBe(T0 + 354 + 5_000);
    expect(await store.getMessage(DEMO.householdId, "m_link")).toMatchObject({ status: "merged", mergedInto: "m_words" });
    expect(publisher.sent.map((s) => s.event)).toContainEqual({ type: "card.ready", messageId: "m_link", cards: [] });
  });

  it("does not join texts sent apart", async () => {
    const first = await text("m_1", 0, "Severance");
    await text("m_2", 20_000, "The Bear");
    const { seen, agent } = recordingAgent();
    expect(await runAgentJob(first, agent, { store, publisher, burst })).toBe("done");
    expect(seen.map((j) => j.body)).toEqual(["Severance"]);
    expect((await store.getMessage(DEMO.householdId, "m_2"))?.status).toBe("pending");
  });

  it("marks the whole burst failed and drops every placeholder when the agent fails", async () => {
    const words = await text("m_words", 0, "watch this");
    await text("m_link", 500, "https://example.com/a");
    const failing = async () => {
      throw new Error("model unavailable");
    };
    expect(await runAgentJob(words, failing, { store, publisher, burst })).toBe("failed");
    for (const id of ["m_words", "m_link"]) {
      expect(await store.getMessage(DEMO.householdId, id)).toMatchObject({ status: "failed", error: "model unavailable" });
      expect(publisher.sent.map((s) => s.event)).toContainEqual({ type: "card.failed", messageId: id });
    }
  });
});

describe("a forgotten household", () => {
  it("is not read at all: no model call", async () => {
    const job = await text("m_1", 0, "Severance");
    await store.deleteHousehold(DEMO.householdId);
    const { seen, agent } = recordingAgent();
    expect(await runAgentJob(job, agent, { store, publisher, burst })).toBe("gone");
    expect(seen).toEqual([]);
    expect(publisher.sent).toEqual([]);
  });

  it("deleted while the agent runs: nothing is marked and no one is told", async () => {
    const job = await text("m_1", 0, "Severance");
    const agent = async () => {
      await store.deleteHousehold(DEMO.householdId);
      throw new Error("No message m_1");
    };
    expect(await runAgentJob(job, agent, { store, publisher, burst })).toBe("gone");
    expect(store.messages.size).toBe(0);
    expect(publisher.sent).toEqual([]);
  });
});
