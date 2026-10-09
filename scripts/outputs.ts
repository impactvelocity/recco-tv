import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Stack outputs written by `pnpm infra:deploy` (.recco-outputs.json). */
export function stackOutputs(): Record<string, string> {
  const file = resolve(import.meta.dirname, "..", ".recco-outputs.json");
  if (!existsSync(file)) throw new Error("No .recco-outputs.json. Run `pnpm infra:deploy` first.");
  return (JSON.parse(readFileSync(file, "utf8")) as Record<string, Record<string, string>>).Recco ?? {};
}

/** The deployed API's base URL, without a trailing slash. */
export const deployedApiUrl = () => (stackOutputs().ApiUrl ?? "").replace(/\/$/, "");
