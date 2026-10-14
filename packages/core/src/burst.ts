import type { RawMessage } from "./types";

/**
 * Texts sent back to back are one recommendation: a phone often splits a
 * shared link and its words into two texts a fraction of a second apart.
 * A burst is a run of pending texts from one household with gaps under
 * BURST_QUIET_MS. The oldest text in a burst reads all of them as one.
 */
export const BURST_QUIET_MS = 5_000;
/** The longest a text waits for its burst to go quiet, counted from when it arrived. */
export const BURST_MAX_WAIT_MS = 10_000;

type Msg = Pick<RawMessage, "id" | "receivedAt" | "body">;

/** The burst `messageId` belongs to, oldest first. Empty when it is not among `pending`. */
export function burstOf<T extends Msg>(pending: T[], messageId: string, quietMs = BURST_QUIET_MS): T[] {
  const sorted = [...pending].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt) || a.id.localeCompare(b.id));
  const at = sorted.findIndex((m) => m.id === messageId);
  if (at < 0) return [];
  const gap = (a: T, b: T) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt);
  let start = at;
  while (start > 0 && gap(sorted[start - 1]!, sorted[start]!) < quietMs) start--;
  let end = at;
  while (end < sorted.length - 1 && gap(sorted[end]!, sorted[end + 1]!) < quietMs) end++;
  return sorted.slice(start, end + 1);
}

/**
 * How long to wait before the burst can be read: until it has been quiet for
 * `quietMs` after its newest text, but never past `maxWaitMs` after the text
 * being handled arrived. 0 means read it now.
 */
export function burstWaitMs(burst: Msg[], messageId: string, now: Date, quietMs = BURST_QUIET_MS, maxWaitMs = BURST_MAX_WAIT_MS): number {
  const own = burst.find((m) => m.id === messageId);
  const newest = burst[burst.length - 1];
  if (!own || !newest) return 0;
  const quietAt = Date.parse(newest.receivedAt) + quietMs;
  const latest = Date.parse(own.receivedAt) + maxWaitMs;
  const wait = Math.min(quietAt, latest) - now.getTime();
  return Number.isFinite(wait) ? Math.max(0, wait) : 0;
}

/** How many texts the pending ones will read as: one per burst. The TV shows one placeholder for each. */
export function countBursts(pending: Pick<RawMessage, "receivedAt">[], quietMs = BURST_QUIET_MS): number {
  const times = pending.map((m) => Date.parse(m.receivedAt)).sort((a, b) => a - b);
  return times.filter((t, i) => i === 0 || !(t - times[i - 1]! < quietMs)).length;
}

/** The burst as one text, in the order it was sent. */
export function combineBurst(burst: Msg[]): string {
  return burst.map((m) => m.body.trim()).filter(Boolean).join("\n");
}
