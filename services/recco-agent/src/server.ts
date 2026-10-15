/**
 * The Recco agent on AgentCore Runtime: an HTTP server on port 8080 with
 * GET /ping and POST /invocations (the AgentCore Runtime contract). Each
 * invocation reads one text and saves its cards.
 */
import { createServer } from "node:http";
import type { AgentJob } from "@recco/core";
import { createSources } from "@recco/sources";
import { awsDeps, loadSecrets, safeError } from "@recco/store";
import { createReccoAgent, type AgentRunReport } from "./agent";
import { createModel, modelId } from "./model";
import { runAgentJob } from "./run-job";

const PORT = 8080;
const deps = awsDeps();

let agent: Promise<ReturnType<typeof createReccoAgent>> | undefined;

async function buildAgent() {
  const secrets = await loadSecrets();
  if (!secrets.AI_GATEWAY_API_KEY) throw new Error("AI_GATEWAY_API_KEY is not set in the secret");
  const sources = createSources(secrets, { cache: deps.store.cache() });
  console.log(JSON.stringify({ model: modelId(secrets), live: sources.live }));
  return createReccoAgent({ ...deps, sources, model: createModel(secrets), modelName: modelId(secrets) });
}

function isJob(value: unknown): value is AgentJob {
  const v = value as AgentJob;
  return !!v && typeof v.householdId === "string" && typeof v.messageId === "string" && typeof v.body === "string";
}

function reportSummary(report: AgentRunReport | undefined) {
  if (!report) return {};
  const { model, steps, inputTokens, outputTokens, fellBack } = report;
  return { model, steps, tools: report.toolCalls.map((c) => c.tool), inputTokens, outputTokens, fellBack };
}

const server = createServer((req, res) => {
  const reply = (status: number, body: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };

  if (req.method === "GET" && req.url === "/ping") return reply(200, { status: "Healthy" });
  if (req.method !== "POST" || req.url !== "/invocations") return reply(404, { error: "Not found" });

  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", async () => {
    let job: unknown;
    try {
      job = JSON.parse(raw);
    } catch {
      return reply(400, { error: "Body is not JSON" });
    }
    if (!isJob(job)) return reply(400, { error: "Expected { householdId, messageId, body }" });
    const started = Date.now();
    try {
      agent ??= buildAgent().catch((err) => {
        agent = undefined;
        throw err;
      });
      let report: AgentRunReport | undefined;
      const status = await runAgentJob(job, async (j) => (report = await (await agent!)(j)), deps);
      // Ids, counts and timings only: tool inputs carry her notes and friends' names (R11.9).
      const summary = { messageId: job.messageId, status, ms: Date.now() - started, ...reportSummary(report) };
      console.log(JSON.stringify(summary));
      reply(200, summary);
    } catch (err) {
      console.error(JSON.stringify({ messageId: job.messageId, error: safeError(err) }));
      reply(500, { error: safeError(err).name });
    }
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Recco agent listening on ${PORT}`));
