/**
 * `pnpm text "<message>" [--from <phone>]`: send a fake text through the local
 * simulator and print what it became. Needs `pnpm dev:local` running.
 */
import { parseArgs } from "node:util";
import { env } from "./env";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { from: { type: "string" }, url: { type: "string" } },
});

const body = positionals.join(" ").trim();
if (!body) {
  console.error('Usage: pnpm text "<message>" [--from +16045551234]');
  process.exit(1);
}

const base = values.url ?? `http://localhost:${env.port}`;
let res: Response;
try {
  res = await fetch(`${base}/dev/text`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body, from: values.from }),
  });
} catch {
  console.error(`Could not reach ${base}. Is \`pnpm dev:local\` running?`);
  process.exit(1);
}

const { result, error } = (await res.json()) as { result?: any; error?: string };
if (!res.ok || !result) {
  console.error(error ?? `HTTP ${res.status}`);
  process.exit(1);
}

switch (result.kind) {
  case "paired":
    console.log(`Paired a TV to household ${result.householdId}${result.newHousehold ? " (new)" : ""}.`);
    break;
  case "dropped":
    console.log(`Dropped (${result.reason}). Nothing was stored.`);
    break;
  case "duplicate":
    console.log("Already processed that message.");
    break;
  case "queued":
    if (result.status === "failed") {
      console.log("The agent failed. The message is kept for a retry.");
      break;
    }
    for (const card of result.cards ?? []) {
      const where = card.needsCheck || card.kind === "unsorted" ? "Check these" : card.origin === "friend" ? (result.friends?.find((f: any) => f.id === card.friendId)?.name ?? card.friendId) : card.origin === "me" ? "From me" : "From the internet";
      console.log(`${card.kind === "unsorted" ? "Unsorted note" : "Card"}: ${card.title}${card.year ? ` (${card.year})` : ""} → ${where}`);
      if (card.note) console.log(`  note: ${card.note}`);
      if (card.services?.length) console.log(`  on: ${card.services.join(", ")}`);
      if (card.candidates?.length) console.log(`  candidates: ${card.candidates.map((c: any) => `${c.title} (${c.year})`).join(" | ")}`);
    }
    break;
  default:
    console.log(JSON.stringify(result, null, 2));
}
