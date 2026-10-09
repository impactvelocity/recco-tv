/**
 * `pnpm measure` (task 4.7): send texts to the deployed API through the signed
 * webhook and time each stage from the server's own timestamps:
 *   placeholder = message saved by intake (card.pending is published right then)
 *   card        = cards saved by the agent (card.ready is published right then)
 * Also times GET /inbox. Needs a device token paired to the --from phone (--token).
 */
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { deployedApiUrl } from "./outputs";
import "./env";

const { values } = parseArgs({ options: { token: { type: "string" }, from: { type: "string" }, inbox: { type: "string" } } });
if (!values.token || !values.from) {
  console.error("Usage: pnpm measure --token <deviceToken> --from <paired phone>");
  process.exit(1);
}
const api = deployedApiUrl();
const auth = { authorization: `Bearer ${values.token}` };

const TEXTS = [
  "Severance",
  "Slow Horses - Jordan swears by it",
  "the office",
  "Andor - steph says season 2 is the best Star Wars ever",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ Priya sent this",
  "zzzz",
];

async function inbox() {
  const started = performance.now();
  const res = await fetch(`${api}/inbox`, { headers: auth });
  const body = (await res.json()) as { cards: { messageId?: string; createdAt: string; title: string; kind: string }[]; pending: { messageId: string; receivedAt: string }[] };
  return { body, ms: performance.now() - started };
}

const inboxTimes: number[] = [];
const rows: string[] = [];
for (const text of TEXTS) {
  const before = new Set((await inbox()).body.cards.map((c) => c.createdAt + c.title));
  const sent = Date.now();
  execFileSync("pnpm", ["-s", "sms", "--deployed", "--from", values.from, text], { stdio: "ignore" });
  let placeholderMs: number | undefined;
  let cardMs: number | undefined;
  let what = "";
  for (let i = 0; i < 120 && cardMs === undefined; i++) {
    const { body, ms } = await inbox();
    inboxTimes.push(ms);
    const pending = body.pending.find((p) => Date.parse(p.receivedAt) >= sent - 2000);
    if (pending && placeholderMs === undefined) placeholderMs = Date.parse(pending.receivedAt) - sent;
    const fresh = body.cards.filter((c) => !before.has(c.createdAt + c.title) && Date.parse(c.createdAt) >= sent - 2000);
    if (fresh.length > 0 && body.pending.every((p) => Date.parse(p.receivedAt) < sent - 2000)) {
      cardMs = Math.max(...fresh.map((c) => Date.parse(c.createdAt))) - sent;
      what = fresh.map((c) => (c.kind === "unsorted" ? "unsorted note" : c.title)).join(", ");
    } else await new Promise((r) => setTimeout(r, 500));
  }
  rows.push(`| ${text.length > 48 ? text.slice(0, 45) + "…" : text} | ${placeholderMs ?? "(missed)"} | ${cardMs ?? "timeout"} | ${what} |`);
  console.log(rows.at(-1));
}

const sorted = inboxTimes.sort((a, b) => a - b);
const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)]!;
console.log(`\nGET /inbox: ${sorted.length} calls, p50 ${Math.round(sorted[Math.floor(sorted.length / 2)]!)} ms, p95 ${Math.round(p95)} ms (from this machine, includes internet round trip)`);
