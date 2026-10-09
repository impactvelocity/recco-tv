import type { AgentJob } from "@recco/core";
import type { Publisher, Store } from "@recco/store";

export type Agent = (job: AgentJob) => Promise<unknown>;

/**
 * Run the agent for one message. On failure the raw message is kept, marked
 * failed, and the TVs are told so they can drop the placeholder.
 */
export async function runAgentJob(
  job: AgentJob,
  agent: Agent,
  deps: { store: Store; publisher: Publisher },
): Promise<"done" | "failed"> {
  try {
    await agent(job);
    return "done";
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await deps.store.updateMessage(job.householdId, job.messageId, { status: "failed", error });
    const household = await deps.store.getHousehold(job.householdId);
    if (household) {
      await deps.publisher.publish(household.channelId, { type: "card.failed", messageId: job.messageId });
    }
    return "failed";
  }
}
