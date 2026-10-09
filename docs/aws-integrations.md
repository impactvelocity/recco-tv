# AWS integrations

One row per AWS service: what it does in Recco and the code that uses it. Evidence for the AWS Builder mini challenge. Region: `us-east-2` (see decisions.md). All of it is defined in [`infra/lib/recco-stack.ts`](../infra/lib/recco-stack.ts).

| Service | What it does here | Code |
|---|---|---|
| Amazon Bedrock AgentCore Runtime | Hosts the Recco agent (Vercel AI SDK, five tools) as a Node.js 22 direct-code deployment. The agent worker calls `InvokeAgentRuntime` once per text. | `services/recco-agent/src/server.ts`, `services/agent-worker/src/lambda.ts`, `infra/lib/agent-bundle.ts` |
| AWS Lambda | Inbox API (function URL), intake (SQS consumer), agent worker (async, starts the agent without blocking intake) | `services/api/src/lambda.ts`, `services/intake/src/lambda.ts`, `services/agent-worker/src/lambda.ts` |
| Lambda function URLs | The TV app's only endpoint: pairing, inbox, card updates, realtime config, and the signed SMS webhook | `services/api/src/app.ts` |
| Amazon DynamoDB | The one table: households, devices, pairing codes (TTL), phone links, friends, cards, raw messages, the 7-day title and availability cache (TTL), the duplicate-message guard (TTL) | `packages/store/src/dynamo.ts` |
| Amazon SNS | Inbound-text topic. The webhook publishes AWS End User Messaging payloads here; a real two-way number will publish here directly. | `services/api/src/lambda.ts` |
| Amazon SQS (+ DLQ) | Buffers inbound texts for intake; failed texts retry 3 times, then go to the dead-letter queue | `services/intake/src/lambda.ts` |
| AWS AppSync Events | Live updates to the TV over a plain WebSocket: `paired`, `card.pending`, `card.ready`, `card.updated`, `card.failed` | `packages/store/src/appsync.ts`, `apps/tv/src/lib/realtime.ts` |
| AWS Secrets Manager | Outside API keys (AI Gateway, OMDb, Streaming Availability, ScrapeCreators), the webhook signing secret, the phone-hash salt | `packages/store/src/runtime.ts`, `scripts/push-secrets.ts` |
| Amazon S3 | Holds the agent's code bundle for AgentCore direct code deployment (CDK asset) | `infra/lib/recco-stack.ts` |
| AWS IAM | Least-privilege roles per function and for the AgentCore runtime (trusts `bedrock-agentcore.amazonaws.com`, scoped to this account) | `infra/lib/recco-stack.ts` |
| Amazon CloudWatch Logs | Two-week log groups per function; AgentCore runtime logs | `infra/lib/recco-stack.ts` |
| AWS CDK | All of the above as code: `pnpm infra:deploy`, `pnpm infra:destroy` | `infra/` |
| AWS End User Messaging | Planned: a two-way long code publishing inbound texts to the SNS topic. Same payload the webhook sends today. | `packages/sms/src/aws-eum.ts` |
| Amazon Bedrock | Optional model provider; the agent uses Vercel AI Gateway for now because of new-account Bedrock quotas (decisions.md). One function to switch. | `services/recco-agent/src/model.ts` |
