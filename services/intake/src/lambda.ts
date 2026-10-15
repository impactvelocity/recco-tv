import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import type { AgentJob } from "@recco/core";
import { AwsEumProvider } from "@recco/sms";
import { awsDeps, loadSecrets, requireEnv, safeError } from "@recco/store";
import { handleInboundText } from "./intake";

const lambda = new LambdaClient({});
const provider = new AwsEumProvider();
const deps = awsDeps();
const workerFn = requireEnv("AGENT_WORKER_FUNCTION");

interface SqsEvent {
  Records: { messageId: string; body: string }[];
}

/** Starts the agent without waiting for it (async Lambda invoke). */
async function startAgent(job: AgentJob) {
  await lambda.send(new InvokeCommand({ FunctionName: workerFn, InvocationType: "Event", Payload: JSON.stringify(job) }));
}

/** Reads the text queue: pairs a TV or saves the message and starts the agent. */
export async function lambdaHandler(event: SqsEvent) {
  const { PHONE_HASH_SALT } = await loadSecrets();
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const record of event.Records) {
    try {
      const text = provider.parseInbound(record);
      if (!text) {
        console.warn("Not an inbound text; dropping", record.messageId);
        continue;
      }
      const result = await handleInboundText(text, {
        ...deps,
        phoneSalt: PHONE_HASH_SALT,
        defaultCountry: process.env.DEFAULT_COUNTRY ?? "ca",
        startAgent,
      });
      console.log(JSON.stringify({ messageId: record.messageId, result: result.kind }));
    } catch (err) {
      console.error(JSON.stringify({ messageId: record.messageId, error: safeError(err) }));
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
}
