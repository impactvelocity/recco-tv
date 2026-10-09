/**
 * `pnpm pair-tv [--from <phone>]`: pair the TV that is showing a code right now,
 * by texting the newest live code through the signed webhook. Local only.
 * Defaults to the demo phone, so the TV gets the seeded household.
 */
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { DEMO } from "@recco/store";
import { env } from "./env";

const { values } = parseArgs({ options: { from: { type: "string" } } });
const base = `http://localhost:${env.port}`;

const codes = (await fetch(`${base}/dev/codes`).then((r) => r.json()).catch(() => null)) as
  | { code: string; expiresAt: string }[]
  | null;
if (!codes) {
  console.error(`Could not reach ${base}. Is \`pnpm dev:local\` running?`);
  process.exit(1);
}
const live = codes.filter((c) => Date.parse(c.expiresAt) > Date.now()).sort((a, b) => b.expiresAt.localeCompare(a.expiresAt));
if (!live[0]) {
  console.error("No TV is showing a pairing code.");
  process.exit(1);
}
const from = values.from ?? DEMO.phone;
console.log(`Texting ${live[0].code} from ${from}…`);
execFileSync("pnpm", ["-s", "sms", "--from", from, live[0].code], { stdio: "inherit" });
