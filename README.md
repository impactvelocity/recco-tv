# Recco

An inbox of things to watch, on Fire TV. Text a show to one number and forget about it. When you sit down to watch, Recco is on the TV with the list, who recommended each show, and what they said.

Built for the Amazon Developer Hackathon (Fire TV track) and the AWS Builder mini challenge. See `RECCO_PLAN.md` for the full plan.

> Work in progress. This README is completed in task 6.1.

## Run it locally (no AWS account, no API keys)

Needs Node 22+ and pnpm 9.

```bash
pnpm install
pnpm test
pnpm dev:local
```

`pnpm dev:local` starts the API on port 8787 with an in-memory store, seeded with a demo household (three friends, twelve cards), the SMS simulator, and the mock agent. In another terminal:

```bash
pnpm text "King of Queens - Jordan said it was funny and worth watching"
pnpm text "Severance"
pnpm text "https://www.tiktok.com/@reccodemo/video/7420000000000000001 Steph sent this"
pnpm text "the office"
```

Texts come from the demo phone unless you pass `--from <phone>`. To pair a new TV by hand:

```bash
curl -X POST localhost:8787/devices
pnpm text --from "+17785553333" "<code from the response>"
```

### The SMS webhook

Until real phone numbers are set up, texts arrive the way a provider would send them: a signed `POST /webhooks/sms` with the AWS End User Messaging inbound payload.

```bash
pnpm sms "Severance"
pnpm sms --from "+17785553333" "Beef - Sam loved it"
```

The signature header is `x-recco-signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`, keyed with `SMS_WEBHOOK_SECRET` (default `local-webhook-secret`). The route always answers `202 {"accepted":true}`.

Read the demo inbox:

```bash
curl -H "Authorization: Bearer dev_demo.local-demo-token" localhost:8787/inbox
```

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

The development loop, with `pnpm dev:local` running:

```bash
pnpm pair-tv
```
```bash
pnpm sms "Severance"
```
```bash
pnpm remote right down select back
```

`pnpm pair-tv` texts the code the TV is showing from the demo phone, so the TV gets the demo household. `pnpm remote` presses remote buttons on the virtual device (`up down left right select back`, with a count like `right3`). Debug builds print their focus moves and actions in the `pnpm dev:local` output.

## Deploy to AWS

Needs AWS credentials for an account where CDK is bootstrapped (this project uses `us-east-2`), and the keys in `.env`.

```bash
pnpm infra:deploy
```
```bash
pnpm infra:secrets
```

`infra:deploy` creates the stack (DynamoDB, the API Lambda's function URL, SNS, SQS, intake and agent-worker Lambdas, AppSync Events, Secrets Manager, and the agent on AgentCore Runtime) and writes the outputs to `.recco-outputs.json`. `infra:secrets` copies the keys from `.env` into Secrets Manager.

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

Measure the budgets with `pnpm measure --token <deviceToken> --from <phone>`.

## Tear down

```bash
pnpm infra:destroy
```

Removes every resource the stack created, including the table and the secret.

## Layout

| Path | What |
|---|---|
| `apps/tv` | Fire TV app (React Native for Vega 0.72): pairing, inbox, card detail, settings. npm, Node 22. |
| `services/api` | Inbox API: pairing, inbox, card updates (Hono) |
| `services/intake` | Reads inbound texts: pairs a TV or queues work for the agent |
| `services/recco-agent` | The agent: `save_cards`, job runner, and the mock agent |
| `services/agent-worker` | Starts the agent without blocking (Milestone 4) |
| `packages/core` | Product rules and types. No AWS imports. |
| `packages/store` | Store interface, in-memory store, demo seed |
| `packages/sms` | SMS provider interface, AWS End User Messaging payload parser, webhook signing, simulator |
| `packages/sources` | OMDb, Streaming Availability, ScrapeCreators (fixtures so far) |
| `infra` | CDK app (Milestone 4) |
| `docs` | Decisions, friction log, product feedback, AWS integrations |

## License

MIT. See `LICENSE`.
