# Recco

An inbox of things to watch, on Fire TV.

People tell you about shows all day: a friend at dinner, a TikTok, a stray thought. Text each one to a single phone number and forget about it. When you sit down to watch, Recco is already on the TV with the list, who recommended each show, and what they said. Pick one and the TV tells you the line to say: *"Alexa, watch Severance."*

There is no phone app and Recco never texts back. Capture is a text message; everything else happens on the TV with the remote and your voice.

Built for the Amazon Developer Hackathon (Fire TV track) and the AWS Builder mini challenge. MIT licensed.

[![Demo of Recco on Fire TV](https://recco.dev/demo/recco-tv-demo-small.gif)](https://recco.dev/demo/recco-tv-demo.gif)

![The Recco inbox on Fire TV: stacks of picks and a single show, each with the text that sent it](docs/screenshots/inbox.webp)

| Featured | Detail | Settings |
|---|---|---|
| ![Featured view: one show at a time with the Alexa line](docs/screenshots/featured.webp) | ![Detail drawer: synopsis, who sent it, the Alexa line, Watched and Remove](docs/screenshots/detail.webp) | ![Settings: theme, default view, hide watched, the Recco number, pairing](docs/screenshots/settings.webp) |

<sub>Running on the Vega Virtual Device.</sub>

## How it works

```mermaid
flowchart LR
    phone(["📱 Your phone"])
    tv(["📺 Fire TV app<br/>React Native for Vega"])

    subgraph sms ["SMS provider"]
        zernio["Zernio<br/>(live number)"]
        eum["AWS End User<br/>Messaging (planned)"]
    end

    subgraph aws ["AWS · us-east-2"]
        api["api<br/>Lambda + function URL<br/>Hono"]
        sns["SNS<br/>inbound texts"]
        sqs["SQS<br/>+ dead-letter queue"]
        intake["intake<br/>Lambda"]
        worker["agent-worker<br/>Lambda"]
        agent["recco-agent<br/>AgentCore Runtime"]
        ddb[("DynamoDB<br/>one table")]
        events["AppSync Events<br/>one channel per household"]
        secrets["Secrets Manager"]
    end

    subgraph outside ["Outside APIs"]
        llm["AI Gateway<br/>Claude Haiku 5.5"]
        omdb["OMDb<br/>titles"]
        sc["ScrapeCreators<br/>TikTok · Instagram · YouTube"]
        jina["Jina Reader<br/>any other link"]
    end

    phone -- text --> zernio
    phone -. text .-> eum
    zernio -- signed webhook --> api
    eum -.-> sns
    api -- publish --> sns
    sns --> sqs --> intake
    intake -- "pairing code → link phone" --> ddb
    intake -- "otherwise save text" --> ddb
    intake -- async invoke --> worker
    worker -- InvokeAgentRuntime --> agent
    agent --> llm
    agent -- find_titles --> omdb
    agent -- read_post --> sc
    agent -- read_post --> jina
    agent -- save_cards --> ddb
    intake -- "paired · card.pending" --> events
    agent -- card.ready --> events
    events -- WebSocket --> tv
    tv -- HTTPS --> api
    api --> ddb
    secrets -.-> api & intake & agent
```

### The life of a text

1. **You text** "King of Queens - Jordan said it was funny" to the Recco number.
2. **The provider calls a webhook** on the API. The API checks the signature and publishes the text to SNS, in the same shape AWS End User Messaging uses, so everything downstream is the same whichever provider sent it.
3. **SQS hands it to intake.** If the text is a five-digit pairing code, intake links the phone to that TV's household and publishes `paired`. Otherwise it saves the raw text and publishes `card.pending`. **The TV shows a placeholder tile in under a second.**
4. **The agent worker starts the agent** on AgentCore Runtime without blocking intake.
5. **The agent reads the text.** It waits 5 seconds for any follow-up texts (a link and its comment often arrive as two), reads any link, looks every title up in OMDb, matches the friend, and calls `save_cards` once.
6. **`save_cards` is plain code, not the model.** It throws away any title the lookup did not return in this run, keeps your note in your own words, writes the cards and publishes `card.ready`.
7. **The TV swaps the placeholder** for the finished card: poster, title, ratings, who sent it and what they said.

```mermaid
sequenceDiagram
    autonumber
    participant P as Phone
    participant A as api
    participant Q as SNS → SQS
    participant I as intake
    participant W as agent-worker
    participant G as recco-agent
    participant D as DynamoDB
    participant E as AppSync Events
    participant T as Fire TV

    P->>A: text (signed webhook)
    A->>Q: publish
    Q->>I: deliver
    I->>D: save raw text
    I->>E: card.pending
    E-->>T: placeholder tile (~0.8 s)
    I->>W: invoke (async)
    W->>G: InvokeAgentRuntime
    Note over G: wait for a burst to settle (5 s)<br/>read_post → find_titles → list_friends
    G->>D: save_cards
    G->>E: card.ready
    E-->>T: finished card (~5 s plain text, ~10 s link)
    T->>A: GET /inbox · PATCH /cards/:id
```

### What the agent handles

| You text | You get |
|---|---|
| `King of Queens - Jordan said it was funny` | A card under Jordan, with that note |
| `Severance` | A card under "From me" |
| A TikTok link + `Steph sent this` | One card for each show the post mentions, stacked, under Steph |
| A bare link | Cards under "From the internet" |
| An IMDb or Letterboxd list + `Top 5 for thanksgiving` | A named stack, "Thanksgiving Movie Night" |
| `the office` | A "Which one?" card with the US and UK versions to pick from |
| `movies for a stormy night` | A stack of ideas under "Recco's picks", each checked against OMDb |
| `that show with the guy in the bunker` | Silo |
| `zzzz` | An unsorted note with your words. Recco never invents a title. |

Texts and posts are untrusted input. The agent treats their contents as data, and the guards that matter (titles must come from the lookup, friend names must appear in your text, links are only read if you sent them) are enforced in code, not left to the prompt.

### The TV app

- **Pairing.** The TV shows a five-digit code and the number to text it to. Text the code and it shows "Connected to the phone ending 1234". A household can have several TVs.
- **Featured and Inbox.** One show at a time in a large card, or a three-column grid. Shows sent by several people merge into one tile ("Steph & Dad"); cards from one post form a stack.
- **Detail drawer.** Synopsis, ratings, everyone's messages, the Alexa line, Mark Watched and Remove.
- **Seasonal backgrounds.** A muted looping video picked by season and time of day.
- **Live, with a fallback.** Updates arrive over an AppSync Events WebSocket. The TV keeps polling as a safety net and starts offline from its last saved inbox.

Recco never deep-links into another app's video (Amazon's Appstore policy only allows that between associated apps). The hand-off is the line to say to Alexa.

## Services and packages

```
apps/tv                 Fire TV app (React Native for Vega). Only ever calls services/api.
services/api            Inbox API and SMS webhooks (Hono on Lambda)
services/intake         Reads the text queue: pairs a TV, or saves the text for the agent
services/agent-worker   Starts the agent on AgentCore without blocking intake
services/recco-agent    The agent: four tools, the job runner, the mock agent, the eval set
packages/core           Product rules as pure functions with tests. No AWS imports.
packages/store          Store interface: DynamoDB, in-memory, demo seed, AppSync publisher
packages/sms            SMS providers: AWS End User Messaging, Zernio, local simulator; webhook signing
packages/sources        OMDb, ScrapeCreators, Jina Reader, title matching, recorded fixtures
infra                   CDK app: the whole AWS stack
scripts                 dev server, fake texts, remote control, eval, measure, deploy helpers
docs                    Decisions, friction log, product feedback, AWS integrations, design handoff
```

### API

Hono on a Lambda function URL. Every call except `POST /devices` and the webhooks needs `Authorization: Bearer <deviceToken>`.

| Call | What it does |
|---|---|
| `POST /devices` | Create a device. Returns its token, a pairing code, the Recco number and the code's expiry. |
| `POST /devices/code` | Issue a fresh pairing code |
| `GET /inbox` | Pairing state, friends and cards |
| `PATCH /cards/:id` | Mark watched, hide, pick a candidate, change the friend, unstack |
| `GET /realtime` | WebSocket address, channel and auth for AppSync Events |
| `POST /webhooks/sms` | Inbound text in the AWS End User Messaging shape, signed with `x-recco-signature` |
| `POST /webhooks/zernio` | Inbound text from Zernio, signed with `X-Zernio-Signature` |
| `POST /dev/text` | Local only. Feeds a fake text into intake. |

### Live events

One AppSync Events channel per household (random, unguessable id), plus one per device until it is paired.

| Event | Sent when | The TV |
|---|---|---|
| `paired` | A pairing code matches | Shows "Connected", loads the inbox |
| `card.pending` | A text is saved | Adds a placeholder tile |
| `card.ready` | The agent saves cards | Replaces the placeholder |
| `card.updated` | A card changes | Refreshes that card |
| `card.failed` | The agent gives up | Removes the placeholder |

### Data

One DynamoDB table, `PK` / `SK`, on-demand. A household's friends, cards and raw texts live in its own partition, so the inbox is a single query. Pairing codes, the 7-day title cache and the duplicate-message guard expire by TTL. The full model is in [`.kiro/specs/recco/design.md`](.kiro/specs/recco/design.md).

### AWS services

Lambda (with function URLs), SQS with a dead-letter queue, SNS, DynamoDB, AppSync Events, Bedrock AgentCore Runtime, Secrets Manager, S3 (the agent's code bundle), IAM, CloudWatch Logs, all defined in CDK in [`infra/lib/recco-stack.ts`](infra/lib/recco-stack.ts). What each one does and the code that uses it: [`docs/aws-integrations.md`](docs/aws-integrations.md).

The agent is built with the Vercel AI SDK and reaches its model through Vercel AI Gateway, deployed to AgentCore Runtime as a Node.js 22 direct-code bundle (no container). Bedrock was the plan; new-account Bedrock quotas made it unreliable, and switching back is one function in [`services/recco-agent/src/model.ts`](services/recco-agent/src/model.ts). The reasoning is in [`docs/decisions.md`](docs/decisions.md).

### Measured

| | Budget | Measured on AWS (warm) |
|---|---|---|
| Placeholder on the TV after a text arrives | 3 s | 0.72–0.78 s |
| Finished card, plain text | 20 s | 4.0–5.8 s (about 5 s more since back-to-back texts are batched) |
| Finished card, link read live | 45 s | 10.2 s |
| `GET /inbox`, p95 | 500 ms | 108 ms |
| Agent test set (25 real-shaped texts and links) | | 25/25 with Claude Haiku 5.5 |

A cold start (first text after an idle period) takes about 6 s to show the placeholder. Fourteen models were compared on the test set and on misremembered titles; the results are in [`docs/decisions.md`](docs/decisions.md) and [`docs/eval-results.md`](docs/eval-results.md).

## Run it locally (no AWS account, no API keys)

Needs Node 22+ and pnpm 9.

```bash
pnpm install
```
```bash
pnpm test
```
```bash
pnpm dev:local
```

`pnpm dev:local` starts the API on port 8787 with an in-memory store seeded with a demo household (three friends, thirteen cards), the SMS simulator, and the mock agent (`MOCK_AGENT=1`, recorded fixtures instead of a model and outside APIs). In another terminal:

```bash
pnpm text "King of Queens - Jordan said it was funny and worth watching"
```
```bash
pnpm text "https://www.tiktok.com/@reccodemo/video/7420000000000000001 Steph sent this"
```
```bash
pnpm text "the office"
```

Texts come from the demo phone unless you pass `--from <phone>`. To pair a new TV by hand:

```bash
curl -X POST localhost:8787/devices
```
```bash
pnpm text --from "+17785553333" "<code from the response>"
```

Read the demo inbox:

```bash
curl -H "Authorization: Bearer dev_demo.local-demo-token" localhost:8787/inbox
```

To use the real agent locally, copy `.env.example` to `.env`, set `MOCK_AGENT=0` and add `AI_GATEWAY_API_KEY`. Add `OMDB_API_KEY`, `SCRAPECREATORS_API_KEY` and `JINA_API_KEY` for live lookups; any key left out falls back to fixtures.

### Through the signed webhook

`pnpm sms` sends a text the way a provider would: a signed `POST /webhooks/sms` with the AWS End User Messaging payload.

```bash
pnpm sms --from "+17785553333" "Beef - Sam loved it"
```

The signature header is `x-recco-signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`, keyed with `SMS_WEBHOOK_SECRET` (default `local-webhook-secret`). The route always answers `202 {"accepted":true}`.

### The agent test set

```bash
pnpm eval
```

Runs the 25 cases in `services/recco-agent/eval/cases.ts` against fixtures. Add `--mock` for the rules-only mock agent, or `--model <gateway id>` to try another model.

## Run the TV app on the Vega Virtual Device

Needs the Vega SDK (`~/vega`), Node 22 and, on macOS, Watchman (`brew install watchman`).

```bash
cd apps/tv && npm install && npm run build:debug
```
```bash
vega virtual-device start
```
```bash
vega run-app apps/tv/build/aarch64-debug/tv_aarch64.vpkg
```

The virtual device reaches `pnpm dev:local` on your Mac at `http://10.0.2.2:8787` (not `localhost`). Build with `RECCO_API_BASE=http://<host>:8787` to point elsewhere, or `POSTERS=off` for text-only cards.

With `pnpm dev:local` running:

```bash
pnpm pair-tv
```
```bash
pnpm sms "Severance"
```
```bash
pnpm remote right down select back
```

`pnpm pair-tv` texts the code the TV is showing from the demo phone, so the TV joins the demo household. `pnpm remote` presses remote buttons on the virtual device (`up down left right select back`, with a count like `right3`). Debug builds print their focus moves and actions in the `pnpm dev:local` output.

## Deploy to AWS

Needs AWS credentials for an account where CDK is bootstrapped (this project uses `us-east-2`), and the keys in `.env`.

```bash
pnpm infra:deploy
```
```bash
pnpm infra:secrets
```

`infra:deploy` creates the stack and writes its outputs (API URL, topic, table, agent runtime ARN, AppSync domains) to `.recco-outputs.json`. `infra:secrets` copies the keys from `.env` into Secrets Manager and prints their names only.

Point the TV app at it and send texts through the deployed webhook:

```bash
cd apps/tv && RECCO_API_BASE=<ApiUrl> npm run build:debug
```
```bash
pnpm sms --deployed --from "+17785551111" "<pairing code>"
```
```bash
pnpm sms --deployed --from "+17785551111" "Severance"
```

For a real number, point the provider's inbound webhook at `<ApiUrl>/webhooks/zernio` (Zernio) or the provider's two-way SMS at the SNS topic (AWS End User Messaging). Measure the budgets with `pnpm measure --token <deviceToken> --from <phone>`.

### Tear down

```bash
pnpm infra:destroy
```

Removes every resource the stack created, including the table and the secret.

## Privacy

- Phone numbers are stored as a salted hash plus the last four digits. Friends are first names only. No contacts, no audio, no accounts or passwords.
- Logs carry ids, statuses and timings, not phone numbers or message text.
- Outside services see only what they need: OMDb sees titles, ScrapeCreators and Jina Reader see the links you send, the model provider sees the text.
- In progress: "Forget me" (from the TV's settings, or by texting `FORGET ME`) to delete a household's cards, friends, texts, phone link and every TV's pairing, and a cleaner hand-off when a TV moves to another phone. The rules and design are written (`.kiro/specs/recco/`); the code is not yet in.

## Docs

| | |
|---|---|
| [`RECCO_PLAN.md`](RECCO_PLAN.md) | The original plan, split into `.kiro/steering/` and `.kiro/specs/recco/` |
| [`docs/decisions.md`](docs/decisions.md) | Every change from the plan, and why |
| [`docs/aws-integrations.md`](docs/aws-integrations.md) | Each AWS service and the code that uses it |
| [`docs/friction-log.md`](docs/friction-log.md) | What got in the way while building |
| [`docs/product-feedback.md`](docs/product-feedback.md) | Notes on each tool and SDK used |
| [`docs/design/`](docs/design/) | The Fire TV design handoff |

## License

MIT. See [`LICENSE`](LICENSE).
