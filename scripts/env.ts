import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(import.meta.dirname, "..", ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

export const env = {
  port: Number(process.env.PORT ?? 8787),
  reccoNumber: process.env.RECCO_PHONE_NUMBER || "+16045550142",
  phoneSalt: process.env.PHONE_HASH_SALT || "local-dev-salt",
  webhookSecret: process.env.SMS_WEBHOOK_SECRET || "local-webhook-secret",
  /** MOCK_AGENT=1 (or no gateway credentials) uses the rule-based stand-in and fixtures. */
  mockAgent: (process.env.MOCK_AGENT ?? "1") === "1",
  mockAgentDelayMs: Number(process.env.MOCK_AGENT_DELAY_MS ?? 1500),
};
