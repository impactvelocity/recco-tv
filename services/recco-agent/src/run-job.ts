import { BURST_MAX_WAIT_MS, BURST_QUIET_MS, burstOf, burstWaitMs, combineBurst, type AgentJob } from "@recco/core";
import type { Publisher, Store } from "@recco/store";

export type Agent = (job: AgentJob) => Promise<unknown>;

export interface BurstOptions {
  quietMs?: number;
  maxWaitMs?: number;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Run the agent for one message. Texts sent back to back (a link and its
 * words, split by the phone) are read as one: the oldest waits for the burst
 * to go quiet and reads them all; the others step aside. On failure the raw
 * message is kept, marked failed, and the TVs are told so they can drop the
 * placeholder.
 */
export async function runAgentJob(
  job: AgentJob,
  agent: Agent,
  deps: { store: Store; publisher: Publisher; burst?: BurstOptions },
): Promise<"done" | "failed" | "merged" | "gone"> {
  // Forgotten before the agent started: no model call for a deleted household.
  if (!(await deps.store.getHousehold(job.householdId))) return "gone";
  let followers: string[] = [];
  try {
    const settled = await settleBurst(job, deps.store, deps.burst);
    if (!settled) return "merged";
    followers = settled.followers;
    await agent(settled.job);
    // The cards went out with the oldest text; the others only drop their placeholders.
    await tellTvs(deps, job.householdId, followers.map((messageId) => ({ type: "card.ready", messageId, cards: [] })));
    return "done";
  } catch (err) {
    // Forgotten while the agent ran: its messages are gone, so there is nothing to mark.
    if (!(await deps.store.getHousehold(job.householdId))) return "gone";
    const error = err instanceof Error ? err.message : String(err);
    for (const id of [job.messageId, ...followers]) {
      await deps.store.updateMessage(job.householdId, id, { status: "failed", error });
    }
    await tellTvs(deps, job.householdId, [job.messageId, ...followers].map((messageId) => ({ type: "card.failed", messageId })));
    return "failed";
  }
}

/**
 * Waits for this text's burst to go quiet, then claims the newer texts in it.
 * Returns the job to run (with every text in the burst), or null when an
 * older text's run reads this one.
 */
export async function settleBurst(
  job: AgentJob,
  store: Store,
  { quietMs = BURST_QUIET_MS, maxWaitMs = BURST_MAX_WAIT_MS, now = () => new Date(), sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }: BurstOptions = {},
): Promise<{ job: AgentJob; followers: string[] } | null> {
  for (;;) {
    const pending = (await store.getInbox(job.householdId))?.pendingMessages ?? [];
    const burst = burstOf(pending, job.messageId, quietMs);
    if (burst.length === 0) {
      // Not pending: read with an older text already, or never saved as pending (a retry). Run it alone unless merged.
      const message = await store.getMessage(job.householdId, job.messageId);
      return message?.status === "merged" ? null : { job, followers: [] };
    }
    if (burst[0]!.id !== job.messageId) return null;
    const wait = burstWaitMs(burst, job.messageId, now(), quietMs, maxWaitMs);
    if (wait > 0) {
      await sleep(wait);
      continue;
    }
    const followers = burst.slice(1).map((m) => m.id);
    for (const id of followers) await store.updateMessage(job.householdId, id, { status: "merged", mergedInto: job.messageId });
    return { job: burst.length > 1 ? { ...job, body: combineBurst(burst) } : job, followers };
  }
}

async function tellTvs(deps: { store: Store; publisher: Publisher }, householdId: string, events: Parameters<Publisher["publish"]>[1][]) {
  if (events.length === 0) return;
  const household = await deps.store.getHousehold(householdId);
  if (!household) return;
  for (const event of events) await deps.publisher.publish(household.channelId, event);
}
