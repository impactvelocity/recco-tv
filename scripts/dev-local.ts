/**
 * `pnpm dev:local`: the API and intake on this machine, with the in-memory
 * store, the SMS simulator and the mock agent. No AWS account needed.
 */
import { networkInterfaces } from "node:os";
import { serve } from "@hono/node-server";
import { createApp } from "@recco/api";
import { BRAND, type AgentJob, type Card } from "@recco/core";
import { handleInboundText, type IntakeResult } from "@recco/intake";
import { createMockAgent, createModel, createReccoAgent, hasModelCredentials, modelId, runAgentJob } from "@recco/recco-agent";
import { createSources } from "@recco/sources";
import { AwsEumProvider, SimulatorProvider, type InboundText } from "@recco/sms";
import { DEMO, MemoryPublisher, MemoryStore, seedDemo } from "@recco/store";
import { env } from "./env";


const store = new MemoryStore();
const publisher = new MemoryPublisher();
await seedDemo(store, env.phoneSalt);
const seedPosters = process.env.OMDB_API_KEY ? await addSeedPosters() : 0;

/** The seed has no poster URLs. With an OMDb key, look them up so the demo shows real art. */
async function addSeedPosters(): Promise<number> {
  const { titles } = createSources(process.env);
  const poster = (id: string) => titles.details(id).then((t) => t?.posterUrl).catch(() => undefined);
  const cards = await Promise.all(
    [...store.cards.values()].map(async (c) => ({
      ...c,
      posterUrl: c.titleId ? await poster(c.titleId) : undefined,
      candidates: await Promise.all(c.candidates.map(async (k) => ({ ...k, posterUrl: await poster(k.titleId) }))),
    })),
  );
  await store.putCards(cards);
  return cards.filter((c) => c.posterUrl).length;
}

publisher.onPublish((channelId, event) => {
  const detail =
    event.type === "card.ready"
      ? event.cards.map((c) => c.title).join(", ")
      : event.type === "card.updated"
        ? `${event.card.title} → ${event.card.state}${event.card.rating ? ` (${event.card.rating})` : ""}`
        : event.type === "paired"
          ? `phone ending ${event.phoneLast4}`
          : event.messageId;
  console.log(`  event  ${event.type.padEnd(13)} ${channelId}  ${detail}`);
});

const useModel = !env.mockAgent && hasModelCredentials(process.env);
if (!env.mockAgent && !useModel) {
  console.warn("MOCK_AGENT=0 but no AI Gateway credentials (AI_GATEWAY_API_KEY). Using the mock agent.");
}
// Outside APIs are live where a key is set, recorded fixtures where not.
const sources = createSources(useModel ? process.env : {});
const agent = useModel
  ? createReccoAgent({ store, publisher, sources, model: createModel(process.env), modelName: modelId(process.env) })
  : createMockAgent({ store, publisher });
const agentLabel = useModel
  ? `${modelId(process.env)} via AI Gateway · titles ${sources.live.titles ? "OMDb" : "fixtures"}, posts ${sources.live.posts ? "ScrapeCreators" : "fixtures"}, pages ${sources.live.web ? "Jina" : "fixtures"}`
  : "mock (rules + fixtures)";
const running = new Map<string, Promise<unknown>>();
const sim = new SimulatorProvider(env.reccoNumber);

async function startAgent(job: AgentJob) {
  // The stand-in is instant, so it waits a little to keep the placeholder visible. The real agent does not.
  const run = new Promise((r) => setTimeout(r, useModel ? 0 : env.mockAgentDelayMs)).then(() =>
    runAgentJob(job, agent, { store, publisher }),
  );
  running.set(job.messageId, run);
}

async function intake(text: InboundText): Promise<IntakeResult> {
  const result = await handleInboundText(text, {
    store,
    publisher,
    phoneSalt: env.phoneSalt,
    defaultCountry: "ca",
    startAgent,
  });
  console.log(`  text   ${JSON.stringify(text.body)} via ${text.provider} → ${result.kind}${"reason" in result ? ` (${result.reason})` : ""}`);
  return result;
}

const app = createApp({
  store,
  publisher,
  reccoNumber: env.reccoNumber,
  realtime: () => ({ mode: "polling", pollIntervalMs: 5000 }),
  webhook: { secret: env.webhookSecret, zernioSecret: env.zernioWebhookSecret, provider: new AwsEumProvider(), accept: intake },
  dev: {
    sendText: async ({ from = DEMO.phone, body, providerMessageId }) => sim.text({ from, body, providerMessageId }),
    handleText: async (text) => {
      const result = await intake(text);
      if (result.kind !== "queued") return result;
      // Local convenience: wait for the agent so `pnpm text` can print the card.
      await running.get(result.messageId);
      running.delete(result.messageId);
      const message = await store.getMessage(result.householdId, result.messageId);
      const cards: Card[] = [...store.cards.values()].filter((c) => c.messageId === result.messageId);
      const friends = await store.listFriends(result.householdId);
      return { ...result, status: message?.status, cards, friends };
    },
  },
});

// Local only: live pairing codes, so you can pair the virtual device without reading the screen.
app.get("/dev/codes", (c) => c.json([...store.pairingCodes.values()]));

// Debug builds of the TV app report focus moves and actions here (apps/tv/src/lib/debug.ts).
app.post("/dev/log", async (c) => {
  const { event, ...data } = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const detail = Object.entries(data).map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`).join(" ");
  console.log(`  tv     ${String(event).padEnd(13)} ${detail}`);
  return c.json({ ok: true });
});

const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a && a.family === "IPv4" && !a.internal)
  .map((a) => a!.address);

serve({ fetch: app.fetch, port: env.port, hostname: "0.0.0.0" }, () => {
  console.log(`\n${BRAND.name} local API`);
  console.log(`  http://localhost:${env.port}`);
  for (const ip of lanAddresses) console.log(`  http://${ip}:${env.port}`);
  console.log(`\nAgent: ${agentLabel}`);
  console.log(`\nDemo household: 3 friends, 13 cards (${seedPosters ? `${seedPosters} posters from OMDb` : "no posters"}), phone ending ${DEMO.phone.slice(-4)}`);
  console.log(`  Demo device token: ${DEMO.deviceToken}`);
  console.log(`  curl -H "Authorization: Bearer ${DEMO.deviceToken}" localhost:${env.port}/inbox`);
  console.log(`\nSend a text:`);
  console.log(`  pnpm text "King of Queens - Jordan said it was funny"   (prints the card it made)`);
  console.log(`  pnpm sms  "Severance"                                   (signed webhook, like a real provider)`);
  console.log(`  Webhook: POST /webhooks/sms, AWS End User Messaging payload, x-recco-signature header`);
  console.log(`           POST /webhooks/zernio, Zernio message.received, x-zernio-signature header\n`);
});
