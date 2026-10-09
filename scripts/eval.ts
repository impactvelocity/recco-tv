/**
 * `pnpm eval [--mock] [--model <gateway id>] [--only <case id>]`
 * Runs the 25-text test set (services/recco-agent/eval/cases.ts) against the
 * agent with recorded fixtures and the demo household, scores it, and writes
 * docs/eval-results.md. --mock scores the rule-based stand-in instead (no key).
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import type { AgentJob } from "@recco/core";
import { createMockAgent, createModel, createReccoAgent, hasModelCredentials, modelId, type AgentRunReport } from "@recco/recco-agent";
import { createFixtureSources } from "@recco/sources";
import { DEMO, MemoryPublisher, MemoryStore, seedDemo } from "@recco/store";
import { CASES } from "../services/recco-agent/eval/cases";
import { scoreCase, type CaseScore } from "../services/recco-agent/eval/score";
import "./env";

const { values } = parseArgs({
  options: { mock: { type: "boolean" }, model: { type: "string" }, only: { type: "string" }, out: { type: "string" } },
});

const env = { ...process.env, RECCO_MODEL: values.model ?? process.env.RECCO_MODEL };
if (!values.mock && !hasModelCredentials(env)) {
  console.error("No AI Gateway credentials. Set AI_GATEWAY_API_KEY in .env (or run `vercel env pull`), or use --mock.");
  process.exit(1);
}
const label = values.mock ? "mock agent (rules + fixtures)" : modelId(env);
const cases = CASES.filter((c) => !values.only || c.id === values.only);

interface Row extends CaseScore {
  id: string;
  body: string;
  ms: number;
  report?: AgentRunReport;
  error?: string;
}

async function runCase(c: (typeof CASES)[number]): Promise<Row> {
  const store = new MemoryStore();
  const publisher = new MemoryPublisher();
  await seedDemo(store, "eval-salt");
  const job: AgentJob = { householdId: DEMO.householdId, messageId: `eval_${c.id}`, body: c.body };
  await store.putMessage({ id: job.messageId, householdId: job.householdId, receivedAt: new Date().toISOString(), body: c.body, status: "pending", provider: "simulator", providerMessageId: c.id });

  const deps = { store, publisher, sources: createFixtureSources() };
  const agent = values.mock
    ? createMockAgent(deps)
    : createReccoAgent({ ...deps, model: createModel(env), modelName: label });

  const started = Date.now();
  let report: AgentRunReport | undefined;
  let error: string | undefined;
  try {
    report = (await agent(job)) as AgentRunReport | undefined;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  const ms = Date.now() - started;
  const cards = [...store.cards.values()].filter((x) => x.messageId === job.messageId);
  const score = scoreCase(c, cards, await store.listFriends(DEMO.householdId));
  if (error) score.problems.unshift(`error: ${error}`), (score.pass = false);
  return { id: c.id, body: c.body, ms, report, error, ...score };
}

// A few at a time: quick, and gentle on rate limits.
const rows: Row[] = [];
for (let i = 0; i < cases.length; i += 4) {
  rows.push(...(await Promise.all(cases.slice(i, i + 4).map(runCase))));
  process.stdout.write(`\r${rows.length}/${cases.length}`);
}
process.stdout.write("\n");

const passed = rows.filter((r) => r.pass).length;
const ms = rows.map((r) => r.ms).sort((a, b) => a - b);
const p50 = ms[Math.floor(ms.length / 2)] ?? 0;
const p95 = ms[Math.min(ms.length - 1, Math.ceil(ms.length * 0.95) - 1)] ?? 0;
const tokensIn = rows.reduce((n, r) => n + (r.report?.inputTokens ?? 0), 0);
const tokensOut = rows.reduce((n, r) => n + (r.report?.outputTokens ?? 0), 0);

for (const r of rows) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id.padEnd(18)} ${String(r.ms).padStart(6)} ms  ${r.got}`);
  for (const p of r.problems) console.log(`        ${p}`);
}
console.log(`\n${label}: ${passed}/${rows.length} passed · p50 ${p50} ms · p95 ${p95} ms${tokensIn ? ` · ${tokensIn} in / ${tokensOut} out tokens` : ""}`);

if (!values.only) {
  const file = resolve(import.meta.dirname, "..", values.out ?? `docs/eval-results${values.mock ? "-mock" : ""}.md`);
  const md = [
    `# Agent test set results`,
    ``,
    `- Agent: **${label}**`,
    `- Run: ${new Date().toISOString()}`,
    `- Score: **${passed}/${rows.length}**`,
    `- Latency per text: p50 ${p50} ms, p95 ${p95} ms (fixtures, so outside APIs add nothing)`,
    tokensIn ? `- Tokens: ${tokensIn} input, ${tokensOut} output` : ``,
    ``,
    `Cases are in \`services/recco-agent/eval/cases.ts\`. Run with \`pnpm eval\` (or \`--mock\`, \`--model <id>\`).`,
    ``,
    `| | Case | Text | Got | Problems |`,
    `|---|---|---|---|---|`,
    ...rows.map((r) => `| ${r.pass ? "✅" : "❌"} | ${r.id} | ${r.body.replace(/\|/g, "\\|")} | ${r.got} | ${r.problems.join("; ").replace(/\|/g, "\\|")} |`),
    ``,
  ].join("\n");
  writeFileSync(file, md);
  console.log(`Wrote ${file}`);
}
