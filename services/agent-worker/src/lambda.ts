import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";
import type { AgentJob } from "@recco/core";
import { awsDeps, requireEnv } from "@recco/store";

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
    console.log("Already handled", job.messageId, message?.status);
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
    const body = (await res.response?.transformToString()) ?? "";
    console.log("Agent finished", job.messageId, body.slice(0, 500));
  } catch (err) {
    console.error("AgentCore invocation failed", job.messageId, err);
    await deps.store.updateMessage(job.householdId, job.messageId, { status: "failed", error: String(err) });
    const household = await deps.store.getHousehold(job.householdId);
    if (household) await deps.publisher.publish(household.channelId, { type: "card.failed", messageId: job.messageId });
  }
}
