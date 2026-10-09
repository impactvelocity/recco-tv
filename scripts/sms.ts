/**
 * `pnpm sms "<message>" [--from <phone>]`: what a real SMS provider does. Posts
 * an AWS End User Messaging inbound payload to POST /webhooks/sms, signed with
 * SMS_WEBHOOK_SECRET. Works against `pnpm dev:local` or a deployed API (--url).
 */
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { signWebhook, SIGNATURE_HEADER, type EumInboundPayload } from "@recco/sms";
import { DEMO } from "@recco/store";
import { env } from "./env";
import { deployedApiUrl } from "./outputs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { from: { type: "string" }, url: { type: "string" }, id: { type: "string" }, deployed: { type: "boolean" } },
});

const body = positionals.join(" ").trim();
if (!body) {
  console.error('Usage: pnpm sms "<message>" [--from +16045551234] [--deployed | --url http://localhost:8787] [--id <inboundMessageId>]');
  process.exit(1);
}

const payload: EumInboundPayload = {
  originationNumber: values.from ?? DEMO.phone,
  destinationNumber: env.reccoNumber,
  messageKeyword: "RECCO",
  messageBody: body,
  inboundMessageId: values.id ?? randomUUID(),
};
const raw = JSON.stringify(payload);
const base = values.url ?? (values.deployed ? deployedApiUrl() : `http://localhost:${env.port}`);

try {
  const res = await fetch(`${base}/webhooks/sms`, {
    method: "POST",
    headers: { "content-type": "application/json", [SIGNATURE_HEADER]: signWebhook(raw, env.webhookSecret) },
    body: raw,
  });
  console.log(`${res.status} ${await res.text()}`);
  if (!res.ok) process.exit(1);
} catch {
  console.error(`Could not reach ${base}. Is \`pnpm dev:local\` running?`);
  process.exit(1);
}
