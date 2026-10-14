/**
 * `pnpm infra:secrets`: copy keys from .env into the stack's Secrets Manager
 * secret. Prints key names only. Keeps the generated PHONE_HASH_SALT.
 */
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { GetSecretValueCommand, PutSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import "./env";
import { stackOutputs } from "./outputs";

const KEYS = [
  "AI_GATEWAY_API_KEY",
  "RECCO_MODEL",
  "OMDB_API_KEY",
  "SCRAPECREATORS_API_KEY",
  "JINA_API_KEY",
  "SMS_WEBHOOK_SECRET",
  "ZERNIO_WEBHOOK_SECRET",
] as const;

const secretArn = stackOutputs().SecretArn;
if (!secretArn) throw new Error("SecretArn missing from stack outputs");

// A deployed webhook must not use the local default secret. Make one and keep it in .env so `pnpm sms` signs with it.
let webhookSecret = process.env.SMS_WEBHOOK_SECRET;
if (!webhookSecret || webhookSecret === "local-webhook-secret") {
  webhookSecret = randomBytes(32).toString("hex");
  const envFile = resolve(import.meta.dirname, "..", ".env");
  const text = readFileSync(envFile, "utf8");
  writeFileSync(
    envFile,
    /^SMS_WEBHOOK_SECRET=.*$/m.test(text)
      ? text.replace(/^SMS_WEBHOOK_SECRET=.*$/m, `SMS_WEBHOOK_SECRET=${webhookSecret}`)
      : `${text.trimEnd()}\nSMS_WEBHOOK_SECRET=${webhookSecret}\n`,
  );
  process.env.SMS_WEBHOOK_SECRET = webhookSecret;
  console.log("Generated a new SMS_WEBHOOK_SECRET and saved it to .env");
}

const client = new SecretsManagerClient({ region: "us-east-2" });
const current = JSON.parse((await client.send(new GetSecretValueCommand({ SecretId: secretArn }))).SecretString ?? "{}");
const next = { ...current };
const set: string[] = [];
for (const key of KEYS) {
  const value = process.env[key];
  if (value) {
    next[key] = value;
    set.push(key);
  }
}
await client.send(new PutSecretValueCommand({ SecretId: secretArn, SecretString: JSON.stringify(next) }));
console.log(`Updated ${secretArn.split(":").pop()}: ${set.join(", ")}`);
const missing = KEYS.filter((k) => !process.env[k]);
if (missing.length) console.log(`Not set (fixtures or defaults will be used): ${missing.join(", ")}`);
