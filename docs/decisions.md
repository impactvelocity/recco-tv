# Decisions

Every deviation from `RECCO_PLAN.md`, or detail it left open, with the reason. Newest last.

## 2026-10-08 · Workspace setup (task 0.1, Milestone 1)

- **Claude Code alongside Kiro.** The `.kiro/` steering and spec files were generated from `RECCO_PLAN.md` exactly as written and stay the source of truth. `CLAUDE.md` points Claude Code at them.
- **TypeScript 5.9, not 7.0.** TypeScript 7 (the native port) is the npm `latest`, but Vega, CDK and Hono tooling have not been checked against it. Revisit after Milestone 2.
- **Node.** The plan targets Node 22. `engines` is `>=22` and `.nvmrc` pins 22. Lambdas will use the `nodejs22.x` runtime. The Builder Tools MCP docs list Node 20 or 22, so use Node 22 for the Vega work too.
- **No build step for packages.** Workspace packages export their TypeScript source. `tsx` runs it locally and Vitest tests it. Lambda code will be bundled with esbuild (CDK `NodejsFunction`) in Milestone 4.
- **Module resolution is `Bundler`**, so imports have no file extensions.
- **`apps/tv` is outside the pnpm workspace** until the Vega SDK scaffolds it (task 0.2) and we know which package manager and Metro setup it expects.
- **Device tokens are `<deviceId>.<secret>`.** The API finds the device by id and compares a SHA-256 hash in constant time, so DynamoDB needs no index on the token hash.
- **Card ids are time-sortable** (base-36 milliseconds plus random). In DynamoDB the sort key `CARD#<cardId>` therefore sorts the same as `CARD#<time>#<cardId>` from design.md, and `PATCH /cards/:id` can get the item directly. To confirm in task 4.2.
- **Track record is computed from cards**, not stored as `ratedUp`/`rated` counters on the friend item. The inbox query already returns every card, so it is one less write to keep consistent. The API response still carries `ratedUp` and `rated` per friend (R4.4).
- **The inbox returns `pending` messages** (id and time), so the placeholder card (R8.2) also works when the TV is polling instead of on the WebSocket.
- **Unsorted notes are cards** with `kind: "unsorted"` and no title id. They show in "Check these".
- **A text that is only a five-digit number with no live code is dropped**, even from a linked phone. It is almost certainly an expired pairing code, not a show.
- **New households default to country `ca`.** A +1 number cannot tell Canada from the US. Settings can change it later.
- **The duplicate guard key is `<provider>:<providerMessageId>`**, so ids from different providers cannot collide.
- **The mock agent (`MOCK_AGENT=1`) lives in `services/recco-agent`** and uses the same `save_cards` code as the real agent, with recorded titles and posts from `packages/sources`. Task 1.6 needed it early so `pnpm text` could make a card.
- **`POST /dev/text` waits for the mock agent locally** so `pnpm text` can print the card it made. The deployed API never has this route.
- **LICENSE copyright holder is "The Recco authors".** Change it if you want a personal name on it.

## 2026-10-08 · Milestone 0 on the Vega Virtual Device (tasks 0.2–0.4)

- **Vega SDK 0.24.12112, Vega CLI 1.4.4**, installed with the official script, running natively on arm64.
- **The TV app uses the `helloWorld-rn72` template (React Native 0.72), not `helloWorld` (0.83).** The 0.24 release notes call RN 0.83 for Vega early access: Chrome DevTools is not supported, `setNativeProps()` crashes, and it needs OS 1.2 on a real Fire TV Stick. RN 0.72 remains supported. The Builder Tools MCP has an RN upgrade workflow if we want 0.83 later.
- **`apps/tv` uses npm and Node 22**, as generated (`apps/tv/.nvmrc`). It stays outside the pnpm workspace. Package id `com.recco.tv`, component `com.recco.tv.main`.
- **Watchman is required to build on macOS.** Without it Metro 0.76 falls back to its Node watcher and fails with `EMFILE: too many open files, watch`. Installed with `brew install watchman`.
- **How the virtual device reaches the host: `http://10.0.2.2:<port>`** (the emulator's host alias), or the Mac's LAN IP. `localhost` and `127.0.0.1` do not reach the host. Measured with the probe in `apps/tv/src/App.tsx`. Cleartext HTTP to the host works, so the local API needs no TLS.
- **HTTPS `fetch` and a `wss://` WebSocket both work** from the app (tasks 0.3 and 0.4). The AppSync Events plan (plain WebSocket, no Amplify) stands.
- **The Builder Tools MCP was not used for scaffolding.** Its setup (`init-context`) is an interactive step for the developer's own terminal, so the app was generated with `vega project generate` directly. The MCP will be set up for Milestone 2 (focus, navigation and UI component skills).

## 2026-10-08 · A mock SMS webhook instead of real phone numbers for now (replaces tasks 0.5 and 0.6)

- **No phone numbers yet.** Instead of requesting the AWS long code and testing Zernio now, texts arrive through an HTTP webhook that behaves like a real provider, so the rest of the system can be built and demoed first.
- **`POST /webhooks/sms`** accepts the exact JSON AWS End User Messaging publishes for an inbound text (`originationNumber`, `destinationNumber`, `messageBody`, `inboundMessageId`, …). The same parser (`packages/sms/src/aws-eum.ts`) also unwraps the SNS notification and SQS record it arrives in on AWS, so the real number later only changes what calls intake.
- **Calls are signed.** Header `x-recco-signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">` with `SMS_WEBHOOK_SECRET`; signatures older than five minutes are refused. The route always answers `202 {"accepted":true}`, so a caller cannot learn which phones are linked.
- **`pnpm sms "<message>" [--from <phone>]`** sends a signed webhook call exactly as a provider would. `pnpm text` stays as the quick path that prints the card it made.
- **This route is also the Zernio fallback's entry point** if we use Zernio later: Zernio → webhook → (on AWS) SNS/SQS → intake.
- Real numbers move to Milestone 4 (task 4.4), where Checkpoint 4 needs them.

## 2026-10-08 · The TV app (Milestone 2)

- **Navigation:** `@amazon-devices/react-navigation__stack` (`createStackNavigator`), `__native` and `react-native-screens`, per Amazon's navigation skill. The stack package is React Navigation 6.3.19 under an alias, so v6 options apply (`animationEnabled: false`, `headerShown: false`). Screens are chosen by pairing state: Pairing alone, or Inbox / Card / Settings.
- **Rows are horizontal `ScrollView`s inside `TVFocusGuideView autoFocus`, not FlashList.** A row holds a handful of cards, FlashList is listed as partial support on Vega, and the focus guide gives "remember the focused card per row" for free. Revisit if a household gets hundreds of cards.
- **Scrolling follows focus** with explicit `scrollTo`: the focused row moves to the top of the row area, and the focused card keeps one card of context to its left.
- **Focus restore on Back (R7.4)** is done by hand (Vega has none built in): the inbox remembers the last focused row and card and refocuses it with `FocusManager.focus` in `useFocusEffect`. If the card moved rows (rated, picked), it finds the card in its new row; if hidden, the first card left in the row; if the inbox is empty, the Settings button.
- **Initial focus is claimed once.** A card that arrives later never takes focus (R8.3).
- **Shared product rules:** the TV imports `rows`, `states`, `track-record`, `types` and `brand` straight from `packages/core/src` through a Metro alias (`@recco/core-shared`, with `watchFolders` and `nodeModulesPaths`). Those files have no Node imports. `buildRows`, `orderCards` and `applyCardUpdate` were made generic so they take the API's card shape.
- **Optimistic card updates:** the TV applies `applyCardUpdate` locally, sends the PATCH, then takes the server's card; on failure it reverts.
- **Build-time config:** `scripts/write-env.js` writes `src/env.generated.ts` before each build, so `POSTERS=off npm run build:debug` (R7.10) and `RECCO_API_BASE=… npm run build:debug` work.
- **Debug builds report to `pnpm dev:local`** (`POST /dev/log`): phases, focus moves, actions. With `pnpm remote` (presses keys on the virtual device through `inputd-cli`) this made the remote-only walkthrough in task 2.7 checkable from the terminal.
- **`pnpm pair-tv`** texts the newest live pairing code from the demo phone through the signed webhook (`GET /dev/codes` is local only). Reinstalling the app clears its storage, so a fresh install always shows a new code.
- **Voice:** every card has `aria-label` set to its title, so "Alexa, select <title>" should work once the manifest has the `com.amazon.category.kva` category (to add and test in Milestone 5; it needs a device reboot after sideloading). `ariaPosInSet` and `alexaEntityType` are documented but missing from the SDK's TypeScript types, so they were left out.
- **Pending placeholders are not focusable**, so one can disappear without taking focus with it.

## 2026-10-08 · The agent (Milestone 3)

- **Vercel AI SDK (v7) and AI Gateway instead of Strands and Bedrock for the model** (the team's call). New AWS accounts can get Bedrock quotas below the published defaults ("account age, usage history, payment history"), and increases are not automatic ([Bedrock quotas](https://docs.aws.amazon.com/bedrock/latest/userguide/quotas.html)). The full note is in `services/recco-agent/src/model.ts`.
  - **Impact on the AWS Builder mini challenge:** its judging names Bedrock, AgentCore and Strands. The agent is still deployable to **AgentCore Runtime** (it hosts any framework), and switching the model to Bedrock is one function in `model.ts` (`@ai-sdk/amazon-bedrock`). Amazon Nova is also available through the gateway as `amazon/nova-2-lite`. Revisit before Milestone 4 if the account's Bedrock quota comes through.
  - The agent loop is AI SDK `generateText` with five tools and `stopWhen: [hasToolCall("save_cards"), stepCountIs(10)]` and a 40 s timeout. No `temperature`: Claude Haiku 5.5 does not accept it.
- **Default model `anthropic/claude-haiku-5.5`**, set with `RECCO_MODEL` (any gateway id). The plan's Nova 2 Lite is one env var away; the test set compares them.
- **Guards in plain code, not left to the model:**
  - `save_cards` rejects any imdbId that `find_titles` did not return in the same run; if nothing survives, her words become an unsorted note (never invent a title).
  - `read_post` only reads links that appear in her text, so text inside a post cannot make the agent fetch other URLs.
  - A friend name must appear in her text; a post author or an invented name is dropped.
  - A note must be her exact words; if the model rewords it, her whole text is kept instead.
  - If the model never calls `save_cards`, the text is kept as an unsorted note.
- **Message and post contents are fenced as untrusted data** in the prompt; tool results label post text `untrustedCaption` / `untrustedTranscript`.
- **`save_cards` fills in services itself** (cached), so a card always has them even if the model skips `where_to_watch`. Availability failures save the card with no services (R5.3).
- **Services shown are the ones that "carry" the title:** Streaming Availability options of type subscription, free or add-on. Rent and buy are left out. Its deep links are ignored.
- **Outside APIs are live where a key is set and recorded fixtures where not** (`createSources`). The eval always uses fixtures so it measures the agent's reading. Caches: 7 days for titles and availability (R5.2), 1 day for post reads.
- **OMDb search** uses the word search (`s=`) and falls back to the exact-title endpoint (`t=`); plots are fetched for the top three results so "Check these" can tell candidates apart. Games and episodes are filtered out.
- **The client tests use recorded responses** in each provider's documented shape (`packages/sources/src/fixtures/api/recorded.ts`), since no keys were available to record live ones. Re-record when keys exist.
- **Agent unit tests use a scripted mock model** (`MockLanguageModelV4` from `ai/test`) that plays back tool calls, so the loop and guards are tested without a real model.

### Test set results (task 3.6, 2026-10-08)

| Agent | Score | Latency p50 / p95 | Tokens (25 texts) | Cost (approx.) |
|---|---|---|---|---|
| `anthropic/claude-haiku-5.5` | **25/25** | 2.8 s / 4.5 s | 123k in, 8.4k out | $0.017 |
| `amazon/nova-2-lite` | 23/25 | 1.6 s / 3.0 s | 120k in, 3.0k out | $0.044 |
| Mock (rules + fixtures) | 16/25 | — | — | — |

- **Default stays Claude Haiku 5.5**: it passed everything, including both prompt-injection cases, and costs less on this set. Nova 2 Lite did not retry the search after a typo ("Schitts creek") and saved "hacks and the bear" as one ambiguous card instead of two. Details: `docs/eval-results.md`, `docs/eval-results-nova.md`, `docs/eval-results-mock.md`.
- All latencies are far inside the 20 s budget for a plain text. Live outside APIs will add their own time; measure in task 4.7.

## 2026-10-08 · On AWS (Milestone 4)

- **Region `us-east-2`, not `us-east-1`.** The account (178231953672) sits in an AWS Organization whose service control policy denies CloudFormation, Lambda, DynamoDB, SQS, SNS, AppSync, Secrets Manager, ECR, SSM and AgentCore in us-east-1 and us-west-2. Everything is allowed in us-east-2, where CDK was already bootstrapped. Checked read-only before building.
- **The agent runs on AgentCore Runtime by direct code deployment (Node.js 22), through CDK** (task 4.3). An L1 `AWS::BedrockAgentCore::Runtime` (`aws-cdk-lib/aws-bedrockagentcore`) points at an S3 asset that CDK bundles locally with esbuild into one CommonJS file (`agent.js`). No Docker image and no ECR repository. The agent is a plain `node:http` server with `GET /ping` and `POST /invocations`.
- **The stack passes `RECCO_REGION` to the agent** and the SDK clients fall back to it. `AWS_REGION` is a reserved name on Lambda, so it was not set on AgentCore either, as a precaution (not verified either way).
- **Lambdas bundle the AWS SDK** (`externalModules: []`) so the AgentCore client is a known version, not whatever the Node.js 22 runtime ships.
- **The agent worker Lambda waits for AgentCore and has no async retries.** The agent marks its own failures; the worker only covers AgentCore being unreachable (R3.8). It skips messages that are no longer pending, so a duplicate invoke is harmless.
- **The deployed webhook publishes the AWS End User Messaging payload to the SNS topic**, so the deployed path is exactly the real-number path from SNS onwards: SNS → SQS (with a dead-letter queue after 3 tries) → intake.
- **Secrets** live in one Secrets Manager secret (JSON). CDK generates only `PHONE_HASH_SALT`; `pnpm infra:secrets` copies the other keys from `.env`, prints names only, and replaces the local default webhook secret with a generated one (also saved to `.env` so `pnpm sms --deployed` can sign).
- **AppSync Events uses an API key for both publish and subscribe** in the demo, valid for 365 days. Production needs a Lambda authoriser tied to the device token, so a TV can only subscribe to its own household channel. Channel ids are random and unguessable, which limits the exposure meanwhile.
- **Channel paths are `/recco/<channelId>` with `_` mapped to `-`**: AppSync Events segments allow only letters, digits and dashes.
- **The TV keeps polling while the WebSocket is live**, every 30 s instead of 5 s, as a safety net for missed events. A missed publish is logged, never fatal.
- **`removalPolicy: DESTROY` on the table, secret and log groups**, so `pnpm infra:destroy` leaves nothing behind (R10.5).
- **Phone numbers stay deferred** (task 4.4): the `RECCO_PHONE_NUMBER` shown on the TV is a placeholder from CDK context `reccoPhoneNumber`. Pointing a real AWS End User Messaging number at the SNS topic needs no code change.

### Budgets measured on AWS (task 4.7, 2026-10-09)

`pnpm measure` sends texts through the deployed, signed webhook and times each stage from the server's own timestamps. Warm stack, `anthropic/claude-haiku-5.5`, live OMDb and ScrapeCreators, availability from fixtures.

| Budget (tech.md) | Target | Measured |
|---|---|---|
| Placeholder on the TV after a text arrives | 3 s | 0.72–0.78 s |
| Finished card, plain text | 20 s | 4.0–5.8 s |
| Finished card, link (TikTok/Instagram/YouTube read live) | 45 s | 10.2 s |
| `GET /inbox`, p95 | 500 ms | 108 ms from the client, including the internet round trip |

- **Cold start misses the placeholder budget:** the first text after an idle period took about 6 s to reach the TV, because the API and intake Lambdas both start cold. Options: provisioned concurrency of 1 on both (a few dollars a month), or a scheduled warm-up. Not enabled yet; decide before recording the demo.
- **The TV receives events over AppSync Events within the same second** they are published (seen in the TV's debug log during the run).
- A YouTube music-video link was saved as a card ("Rick Astley: Never Gonna Give You Up"), because OMDb lists music videos. A prompt rule limiting cards to shows and movies the post recommends would make it an unsorted note.
