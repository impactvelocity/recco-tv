```
/
├── apps/
│   └── tv/                   React Native for Vega: the Fire TV app
├── services/
│   ├── api/                  Lambda + Hono: pairing, inbox, card updates
│   ├── intake/               Lambda: reads the text queue, pairs or queues work
│   ├── agent-worker/         Lambda: starts the agent without blocking
│   └── recco-agent/          Strands agent for AgentCore Runtime
├── packages/
│   ├── core/                 Product rules, types, brand name. No AWS imports.
│   ├── store/                DynamoDB access + in-memory version for local runs
│   ├── sms/                  One interface: AWS End User Messaging, Zernio, simulator
│   └── sources/              ScrapeCreators, OMDb, Streaming Availability + fixtures
├── infra/                    CDK app
├── docs/
│   ├── decisions.md          Any deviation from this plan, with the reason
│   ├── friction-log.md       Hackathon friction log (see hackathon rules)
│   ├── product-feedback.md   Notes per tool used
│   ├── aws-integrations.md   Each AWS service and where the code uses it
│   └── demo-script.md        The video script
├── scripts/                  seed, text (send a fake text), destroy
├── RECCO_PLAN.md
├── LICENSE                   MIT
└── README.md
```

Conventions:

- Product rules live in `packages/core` as pure functions with unit tests: phone normalising, code matching, friend matching, card states, track record, grouping.
- `packages/store` exposes one interface with two implementations: DynamoDB and in-memory.
- One file per agent tool in `services/recco-agent/src/tools/`.
- One file per screen in `apps/tv/src/screens/`. Shared pieces in `apps/tv/src/components/`.
- The TV app never talks to DynamoDB, Bedrock, or an outside API. It only calls `services/api`.
