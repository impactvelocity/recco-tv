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
  - The agent loop is AI SDK `generateText` with four tools and `stopWhen: [hasToolCall("save_cards"), stepCountIs(10)]` and a 40 s timeout. No `temperature`: Claude Haiku 5.5 does not accept it.
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

### Misremembered titles and a wider model comparison (2026-10-13)

"Dorah said we shoud watch trains planes and automobiles…" saved an unsorted note. The model had the right title. OMDb matches whole words, so "and" missed "Planes, Trains **&** Automobiles", and clip compilations filled the results. Fixed in the lookup, not the model: `packages/sources/src/title-match.ts` tries "&"/"and" and plain spellings and ranks by word overlap. The prompt now tells the agent to retry with the official title, up to three tries per show. See `docs/friction-log.md`.

Then 14 AI Gateway models ran the 25-text set (fixtures) and 14 misremembered titles against live OMDb ("brekaing bad", "game of throwns", "Squid games", "harry potter and the sorcerers stone", "lord of the rings fellowship" and others). One run each, so a one-case gap is noise (Nova Pro scored 25/25, then 24/25, on the same day).

| Model | Test set | Misremembered | p50 / p95 (test set) | Cost per 1,000 texts |
|---|---|---|---|---|
| `anthropic/claude-haiku-5.5` | **25/25** | **14/14** | 2.6 s / 5.2 s | $0.68 |
| `spacexai/grok-4.1-fast-non-reasoning` | **25/25** | **14/14** | 1.6 s / 3.5 s | $0.96 |
| `openai/gpt-oss-120b` | **25/25** | **14/14** | 3.4 s / 6.3 s | $0.62 |
| `deepseek/deepseek-v4-flash` | **25/25** | **14/14** | 7.9 s / 12.7 s | $0.66 |
| `alibaba/qwen3.8-flash` | **25/25** | **14/14** | 6.5 s / 13.2 s | $0.73 |
| `google/gemini-3-flash` | **25/25** | **14/14** | 4.7 s / 21 s | $3.22 |
| `openai/gpt-6-luna` | 24/25 | 14/14 | 3.9 s / 9.1 s | $0.31 |
| `google/gemini-3.5-flash-lite` | 24/25 | 14/14 | 1.9 s / 3.4 s | $0.93 |
| `google/gemini-3.1-flash-lite` | 25/25 | 12/14 | 2.3 s / 4.3 s | $0.81 |
| `openai/gpt-5.6-luna` | 25/25 | 12/14 | 4.3 s / 6.7 s | $0.68 |
| `amazon/nova-pro` | 24/25 | 13/14 | 3.4 s / 5.2 s | $3.84 |
| `amazon/nova-2-lite` | 24/25 | 11/14 | 1.9 s / 2.9 s | $1.88 |
| `zai/glm-5.3-flash` | 12/25 | 7/14 | — | — |
| `mistral/mistral-small` | 9/25 | — (gateway errors) | — | — |

- **Default stays Claude Haiku 5.5** (the team's call): full marks on both sets, the cheapest of the quick models that scored full marks. Grok 4.1 Fast is the alternative if card latency matters most: about 1 s faster at p50, about 40% more per text.
- The Amazon models were the weakest usable options here. Nova 2 Lite and Nova Pro stopped at "Check these" or an unsorted note on titles with one clear answer. This matters for the Bedrock question above: moving to Bedrock with Nova would cost accuracy on misremembered titles.

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

## 2026-10-08 · Forget me, and moving a TV (added to the plan)

Two gaps found before anything goes public: there was no way to delete a household's data, and pairing a TV to another phone left the old household's cards, friends, texts and phone link in place, with the moved TV still holding the old inbox in storage and knowing the old channel id. Added as product rules, R1.7 to R1.11, R11, the "Moving a TV" and "Forget me" sections of design.md, and tasks 5.6 to 5.9.

- **Two ways to forget: Settings on the TV, or texting exactly "FORGET ME".** The text path covers a lost, sold or broken TV, and owning the phone is already what owns the household. No confirmation text, in keeping with "no reply texts"; the TVs going back to pairing is the confirmation. Exact match only, so a title like "Forget Me Not" still becomes a card. Not "STOP": carriers and AWS End User Messaging treat that as an opt-out keyword.
- **A TV that moves deletes the old household only if it was the last TV.** The alternative, keeping an orphaned household for some days in case she pairs a new TV, needs a scheduled sweep (a new AWS service) and keeps data nobody can see. The risk is losing her list if she gives away her only TV before pairing a new one, so the settings screen says so before it shows the code.
- **When other TVs remain, the old household gets a new channel id.** The moved TV knew the old one, and with the demo's API key auth on AppSync Events the channel id is the only thing keeping it out. The Lambda authoriser noted above is still the real fix.
- **No new index.** The household partition gains `phoneHash` on `META` and one item per TV, so a delete reaches everything with one query and no scan.
- **Hard delete only.** No soft-delete flag or archive. Pairing codes, seen-message ids and the title cache hold no household data and expire by TTL.
- **Outside the table:** the dead-letter queue drops to 4 days from 14, logs lose the agent reply and report (they include notes and friend names today), and the README lists what a delete cannot reach.

## 2026-10-13 · The Fire TV design handoff (Claude Design)

The TV app now follows the handoff in `docs/design/` (README plus the three HTML prototypes). It replaces the hero-and-rows inbox, the card detail screen and the settings screen. R7.1, R7.2 and R7.4 to R7.8, R9.1, design.md's "Fire TV app design" and product.md's "Look of the app" were rewritten to match.

- **Two views under one header:** Featured (one show at a time, Left/Right to flip) and Inbox (a 3-column grid). The detail drawer and settings are panels over the home screen, not separate screens, so the inbox stays behind them. Navigation keeps two screens: Pairing and Home.
- **The drawer has Mark Watched, Remove and Back only** (the user's call: the other actions added noise). Star and Thumbs up/down are gone from the TV, and with them the friend track record on screen (task 5.1 and the thumbs-up beat of the demo are cut). The API still accepts `starred` and `rating`, and `GET /inbox` still returns track records; nothing on the TV sends or shows them. Remove sets the card to hidden.
- **"Which one?" stays.** A card the agent could not match with confidence shows a "Which one?" chip, and the drawer lists the candidates in place of the synopsis. The handoff has no design for it; it uses the settings-row style.
- **New product rule, `buildInbox` in `packages/core`,** replaces `buildRows`. Newest first, watched last (or hidden with "Hide watched"). The same title sent by several people is one tile ("Steph & Dad"). Cards from one text or post form a stack while two or more are visible. Cards still being checked and unsorted notes never merge.
- **Unstack is saved on the server.** "Unstack into Inbox" sends `PATCH /cards/:id {ungroup: true}` for each card (a new field), which removes `groupId`, so every TV agrees. After that, titles already in the inbox merge with it as extra recommenders, as the handoff says.
- **Ratings, runtime and genre** (`imdbRating`, `rtRating`, `runtime`, `genre`) are new optional fields on cards and candidates, read from the OMDb title response. Search only fetches details for the top three results, so a chosen title further down gets one cached details call. Older cards have none and hide the ratings line. The demo seed has illustrative values.
- **Backgrounds are stills for now** (the user's call). The winter stills are frames at 2 s from the supplied videos. Each theme has its own vignette PNG (480×270, stretched) as a separate layer over the still, so a looping video can go between them later. Midnight blue has no media; its two glows are baked into its image. A per-theme PNG is used rather than one white mask tinted at runtime, because `tintColor` support on Vega is unconfirmed.
- **New Vega system libraries** (approved 2026-10-13): `@amazon-devices/react-native-svg` ~3.0.0 for the stroke icons and `@amazon-devices/react-linear-gradient` ~2.0.0 for the bubble tints. Both ship with the OS, so the app bundles no native code.
- **What React Native cannot do as drawn:** no `backdrop-filter`, so surfaces use the handoff's alpha values without blur. No CSS outline, so focus rings are overlays drawn outside the element. Bubbles that overflow end in an ellipsis instead of a fade mask, which would need MaskedView. The system font stands in for SF Pro; the handoff allows this.
- **Text below 28 px.** The handoff's meta lines are 19 px and its chips 15–16 px, below R7.8's 28 px floor. We follow the handoff, which was designed for the 1080p canvas, and R7.8 now points at its type scale. Check readability from the couch on a real TV.
- **IMDb and Rotten Tomatoes marks.** The handoff draws a yellow "IMDb" chip and a tomato. product.md says no third-party logos. They are built as designed, because the handoff is the source for the look, but this needs a decision before the app goes in the Appstore. The fallback is plain text ("IMDb 8.7 · RT 97%").
- **Kept from before, though not in the handoff:** "Pair another phone" in Settings, the services line ("On Netflix, Crave") in the drawer, the offline note in the header, and a pulsing placeholder tile while a text is being read.
- **Theme, default view and "Hide watched" are saved on the TV** in AsyncStorage. They are viewing choices, not household data, so forget-me does not need to reach them.

## 2026-10-13 · Zernio is the live number (task 4.4)

- **The Recco number is Zernio's `+1 332 220 1535`.** AWS End User Messaging is still not set up; Zernio was ready first. The test text came from a 705 (Ontario) phone, so new households stay `ca`.
- **`POST /webhooks/zernio`** takes Zernio's `message.received` event as Zernio sends it. Only incoming `sms` messages become texts; every other event (`webhook.test`, outgoing, other platforms) gets a 202 so Zernio does not retry it for three days.
- **Signed by Zernio, not by us.** Header `X-Zernio-Signature`, hex HMAC-SHA256 of the raw body, keyed with `ZERNIO_WEBHOOK_SECRET` (the secret set on the webhook in Zernio). There is no timestamp, so a captured call could be replayed; the duplicate guard on Zernio's message id catches it while the seen-id TTL lasts.
- **On AWS the text is republished to SNS in the End User Messaging shape**, same as `/webhooks/sms`, so intake records the provider as `aws`. The duplicate key is still unique (Zernio ids are 24 hex characters, AWS ids are UUIDs).

## 2026-10-13 · Looping video backgrounds, bundled in the app

- **The six seasonal themes now play a muted 10 s loop** between the still and the vignette. Midnight blue stays a flat image. The still shows until the first frame plays, and stays if the video fails. The splash has no video, because it is gone before a player would start.
- **Bundled, not streamed.** The first clip was put on Cloudflare Stream, but the app plays local MP4s from `apps/tv/assets/raw/`. Vega copies that folder into the package, and the app reads `/pkg/assets/raw/<theme>.mp4`. Streaming would need a Cloudflare MP4 download per clip, or a JS HLS player (Shaka) for MSE, and the background would need a network connection. Bundling costs 10 MB of package size.
- **Re-encoded** from the supplied 1280×720 H.264 files (about 11 Mbps, 84 MB in total) to CRF 23 capped at 3 Mbps, with no audio track: 1.2 to 2 MB each. The sources are in the user's Downloads, not the repo.
- **New Vega system library** (approved 2026-10-13): `@amazon-devices/react-native-w3cmedia` ~2.1.80, URL mode only (`VideoPlayer` and `KeplerVideoSurfaceView` with `scalingmode="fill"`). It ships with the OS. The manifest gains its module and the media services its docs list. Babel switches to the automatic JSX runtime, as those docs require, with `@babel/plugin-transform-react-jsx` added as a dev dependency.
- **The `/pkg/assets/raw/` path comes from an Amazon staff answer in the developer forum**, not the docs. Amazon calls it a stopgap until an asset resolver API arrives, so check it on each SDK update.

## 2026-10-13 · Where to watch is removed

- **Recco no longer says which services carry a title.** Alexa and Fire TV search already know what the household subscribes to and where a title plays, so the app's own list added nothing and could disagree with them. The Alexa line is the only hand-off.
- **Removed:** the Streaming Availability client and its key (`STREAMING_AVAILABILITY_API_KEY`, `STREAMING_AVAILABILITY_VIA`), the `where_to_watch` agent tool (the agent now has four tools), `services` on cards and candidates, the services line in the detail drawer, and the household country in `GET /inbox`. R5.3 is retired and R5.1, R5.2 and R7.5 no longer mention services. This supersedes the two `save_cards` / services notes under Milestone 3 and the "services line" under "Kept from before".
- **Kept:** the household `country`. It is still passed to the agent in its prompt. Cards already in DynamoDB keep a `services` attribute that nothing reads.

## 2026-10-13 · Auto theme by season and time of day (default)

- **Auto is the new default theme** and the first stop when Settings cycles themes. It shows "Auto · Fall · Night" and so on. Picking a theme by hand turns Auto off; cycling back to Auto turns it on.
- **The rule is `sceneFor` in `packages/core/src/scene.ts`**, read in the TV's local time. There is no spring scene, so March stays winter and April and May are summer. Day is 7:00 to 19:00. Real sunrise and sunset would need the TV's location, which the app does not have. Seasons are northern-hemisphere; every household so far is in Canada.
- **The TV checks the clock once a minute** and re-renders only when the scene changes, so the evening switch happens without a restart. The video background is keyed by its file, so it swaps with the scene.
- **Saved prefs moved to a new storage key (`recco.prefs.v2`).** The old key saved the default theme along with every other change, so it could not tell a real choice from the default. Moving keys puts every TV on Auto once and resets Default view and Hide watched. Only test TVs exist, so nothing real is lost.

## 2026-10-13 · Links that are not social posts

- **Jina Reader (`r.jina.ai`) reads every link that is not a TikTok, Instagram or YouTube post** (the team's call). Before this, an article, IMDb or Letterboxd link could not be read and became "A link" in Unsorted. `routePosts` in `packages/sources/src/create.ts` sends social links to ScrapeCreators and everything else to `createJinaReader` (`packages/sources/src/jina.ts`). No new AWS service: it is one HTTPS call with `JINA_API_KEY`, kept in Secrets Manager like the other keys (`pnpm infra:secrets`).
- **A page comes back as a post with `platform: "web"`**: the page title and description are the caption, the page text is the transcript, cut to 12,000 characters (the agent sees 8,000). Images and link URLs are dropped. Cached for a day, like posts.
- **A page that is gone is unreadable**: Jina returns the page's own status, so 4xx/5xx is treated as no post. Redirects (IMDb answers 302) are kept. "Soft 404" pages that answer 200 with "Page not found" reach the model, which saves an unsorted note.
- **List pages**: a card for each title the text singles out ("the john candy one"). If none is singled out, up to five titles get a card each; a longer list becomes one unsorted note. A first try at "the first ten titles" filled the inbox with cartoon shorts from an alphabetical Wikipedia list.
- **Privacy**: Jina sees the links she sends, as ScrapeCreators already does. Listed with the other outside lookups in design.md.
- Checked live with Claude Haiku 5.5: Letterboxd, IMDb and Wikipedia title pages, a list page with and without a pick, and two dead pages all came out right. The 25-text test set still passes 25/25.

## 2026-10-14 · Texts sent back to back are read as one

- **Why:** an IMDb list shared from a phone arrived as two texts 0.35 s apart, "Top 10 movies to watch for thanksgiving" and the link. Each was read alone, so neither made a card. Added as R2.6.
- **How:** `runAgentJob` (`services/recco-agent/src/run-job.ts`) waits until the household has had no new text for 5 seconds (capped at 10 seconds after the text arrived). Then the oldest pending text in the burst reads every text in it, joined by new lines, and marks the others `merged` (`mergedInto`). A newer text's run finds an older pending text and steps aside. The rule is `burstOf` / `burstWaitMs` / `combineBurst` in `packages/core/src/burst.ts`. No new AWS service, queue or table field beyond the message status.
- **Cost:** every card now arrives about 5 seconds later. A plain text measured 17 s with a ten-title list, inside the 20 s / 45 s budgets. The placeholder still appears at once.
- **TV:** merged texts send `card.ready` with no cards, which the current TV build already treats as "drop the placeholder", so no TV rebuild is needed.
- **Not covered:** a comment typed 30 seconds after a link is still a separate text. Joining those would mean re-reading the earlier card after it is already on the TV.
- **List pages, revised:** the "more than five titles → unsorted" rule ignored "Top 10" in her words. Now a count in the text wins (at most ten), a ranked or hand-picked list (an IMDb or Letterboxd list, a "best of") gives its first five, and a reference list (a Wikipedia "List of …") gives one unsorted card. Jina page text now starts at the main heading, since IMDb puts about 1,500 characters of menus before the list.

### Stack titles, group notes and one placeholder per burst (2026-10-14)

- **Stacks get a name from the agent.** `save_cards` takes an optional `groupTitle` (2 to 5 words, title case, from her words first, then the post: "Thanksgiving Movie Night"). It is stored on every card in the group (`Card.groupTitle`), since there is no group record. The TV shows it on the tile and the open stack bar, and falls back to the old headings for stacks saved before. Plain code trims it to one line of at most 40 characters with no links (`cleanGroupTitle`). Unstacking clears it.
- **Her words about a whole group are the note on every card.** "Top 5 movies for thanksgiving night" plus an IMDb list came out with no notes, so the TV showed its fallback, "A link". The prompt now says to copy words about all of them onto each card.
- **The TV shows one placeholder per burst** (`countBursts` in `packages/core/src/burst.ts`), matching how the agent reads them (R2.6), so a link and its words no longer show two loading cards.

## 2026-10-14 · Recco's picks: ideas when she asks for them

- **The team's call:** a text that asks for ideas ("movies for a stormy night", "3 comedies for tonight", "something like Severance") now makes a stack of suggestions instead of an unsorted note. Added as R3.9 and a product rule. "Similar shows" stays out of scope unless she asks.
- **Filed under a new origin, `recco`, shown on the TV as "Recco's picks"** (avatar ✦). The product is built on who recommended each show, so the agent's own ideas never appear under a person or "From me". The team chose this over filing them under "From me".
- **Same guard as every card:** the model picks titles from its own knowledge (no new service), but each must come back from `find_titles` to be saved. `save_cards` takes `suggestions: true`. Plain code caps it at 7 (`MAX_SUGGESTIONS`), drops any friend, sets the origin, and falls back to her words under "From me" if no pick survives the lookup. Five titles unless she gives a number; with a stack title and her words as the note.
- **Not suggestions:** a text that describes one show ("that show with the guy in the bunker" now finds Silo), gibberish, or a text or post that names its own titles. "Jordan says watch something scary this weekend" stayed an unsorted note under Jordan. A friend's vague advice is kept as their recommendation, not turned into Recco's ideas.
- Checked live with Claude Haiku 5.5 on eight texts (about 4 to 5 s each). The 25-text set still passes 25/25. The fixture-based test set cannot score suggestions, since the model's picks are mostly not in the fixtures.

## 2026-10-14 · A livelier placeholder tile

- **Why:** the placeholder was a pulsing tile that only said "Reading your text…", and with the 5-second burst wait (R2.6) it now sits there 10 to 17 seconds.
- **What:** the bubble shows three hopping "typing" dots, and a status line under it steps through "Reading your text…", "Working out which show…", "Looking it up…", "Finding the poster…" and "Almost there…", 3.5 s a step, holding on the last. A light sweeps across the poster slot. The whole-tile opacity pulse is gone.
- **Not wired to the agent:** the steps are timed on the TV, not sent by the agent, so they are approximate. Sending real progress would need new realtime events.
