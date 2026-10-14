### Ground rules

- TypeScript everywhere. Node.js 22. pnpm workspaces.
- One AWS region for everything: `us-east-1`.
- **Check before you code.** The Vega, Strands, AgentCore and AppSync Events libraries change quickly. Before using a package, read its current documentation and confirm the package name and API. If it differs from this plan, follow the documentation and record the change in `docs/decisions.md`.
- Use the Amazon Devices Builder Tools MCP server for anything Vega-specific: scaffolding, building, installing, and debugging.
- Never commit secrets. Use environment variables and `.env.example`.
- Ask before adding any AWS service or npm package with native code that is not listed here.

### Stack

| Part | Choice |
|---|---|
| TV app | React Native for Vega, current Vega SDK, TypeScript |
| TV navigation | `react-navigation` (Vega port) |
| TV lists | FlashList (Vega system library), or FlatList |
| TV storage | `async-storage` (Vega system library), for the device token |
| TV tools | Vega Studio in VS Code, Vega CLI, Vega Virtual Device |
| API | AWS Lambda behind a function URL, Hono, `zod` |
| Text intake | SMS provider → Amazon SNS → Amazon SQS → Lambda |
| SMS provider | AWS End User Messaging (target), Zernio (fallback) |
| Agent | Strands Agents TypeScript SDK on Bedrock AgentCore Runtime |
| Agent model | Amazon Bedrock. Start with Amazon Nova 2 Lite and record the choice. |
| Agent start | A Lambda worker that invokes the agent without blocking |
| Database | DynamoDB, one table, on-demand |
| Live updates | AWS AppSync Events over a plain WebSocket, with polling as the fallback |
| Secrets | AWS Secrets Manager, for the outside API keys |
| Post reader | ScrapeCreators API (captions and transcripts) for TikTok, Instagram and YouTube; Jina Reader (r.jina.ai) for any other link |
| Show data | OMDb API |
| Infrastructure | AWS CDK in TypeScript |
| Tests | Vitest |

### SMS provider rule

All texting goes through one interface in `packages/sms` with three implementations: AWS End User Messaging, Zernio, and a local simulator. Both real providers deliver into the same SQS queue, so nothing downstream knows which one is in use.

- Request a Canadian long code in AWS End User Messaging first. Canada supports two-way SMS on long codes.
- Do not wait on a US number. US numbers need carrier registration before they work.
- If the AWS number is not receiving texts by Checkpoint 4, ship on Zernio and say so in `docs/decisions.md` and the friction log.

### Live updates rule

React Native for Vega documents WebSocket support. Connect to AppSync Events with a plain WebSocket and do not add the Amplify client library. Build polling first (every five seconds), then add the WebSocket. Keep polling as the automatic fallback when the socket drops.

### Outside data notes

- **OMDb.** Content is licensed CC BY-NC. Fine for the hackathon; replace before any commercial use. Do not depend on the patron-only Poster API. Use a poster link only if the title response includes one.
- **ScrapeCreators.** Read both the caption and the transcript. Many posts name the show in the caption or on screen and never say it aloud.
- Cache title data in DynamoDB for seven days.

### Budgets

- A placeholder card appears on the TV within 3 seconds of the text arriving.
- The finished card appears within 20 seconds for a plain text, and within 45 seconds for a link.
- Every inbox API call returns in under 500 ms at the 95th percentile.

### Demo and local mode

- `MOCK_AGENT=1` replaces the model and the outside APIs with recorded fixtures.
- `POSTERS=off` renders every card as a text-only title card.
- A fresh clone must run with no AWS account and no API keys.
