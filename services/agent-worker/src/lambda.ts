import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";
import type { AgentJob } from "@recco/core";
import { awsDeps, requireEnv, safeError } from "@recco/store";

const agentcore = new BedrockAgentCoreClient({});
const deps = awsDeps();
const runtimeArn = requireEnv("AGENT_RUNTIME_ARN");

/**
 * Invoked asynchronously by intake. Calls the Recco agent on AgentCore Runtime
 * and waits for it. The agent itself saves cards and marks failures; this
 * worker only covers the case where AgentCore cannot be reached (R3.8).
 */
export async function lambdaHandler(job: AgentJob) {
  const message = await deps.store.getMessage(job.householdId, job.messageId);
  if (!message || message.status !== "pending") {
    console.log(JSON.stringify({ messageId: job.messageId, skipped: message?.status ?? "gone" }));
    return;
  }
  try {
    const res = await agentcore.send(
      new InvokeAgentRuntimeCommand({
        agentRuntimeArn: runtimeArn,
        // At least 33 characters; one session per message.
        runtimeSessionId: `recco-message-${job.messageId}`.padEnd(40, "0"),
        contentType: "application/json",
        accept: "application/json",
        payload: new TextEncoder().encode(JSON.stringify(job)),
      }),
    );
    // The agent answers with ids, counts and timings; log the status only (R11.9).
    const body = (await res.response?.transformToString()) ?? "";
    console.log(JSON.stringify({ messageId: job.messageId, status: statusOf(body) }));
  } catch (err) {
    console.error(JSON.stringify({ messageId: job.messageId, error: safeError(err) }));
    // Forgotten in the meantime: the message is gone and there is no one to tell (R11.7).
    const household = await deps.store.getHousehold(job.householdId);
    if (!household) return;
    await deps.store.updateMessage(job.householdId, job.messageId, { status: "failed", error: String(err) });
    await deps.publisher.publish(household.channelId, { type: "card.failed", messageId: job.messageId });
  }
}

function statusOf(body: string): string {
  try {
    return String((JSON.parse(body) as { status?: unknown }).status ?? "unknown");
  } catch {
    return "unreadable";
  }
}
