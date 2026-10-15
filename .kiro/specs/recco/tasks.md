### Milestone 0: prove the risky parts

- [x] 0.1 Create the pnpm workspace and the folder structure from structure.md. Add MIT LICENSE, `.env.example`, and empty docs files.
- [x] 0.2 Install the Vega SDK and the Builder Tools MCP. Generate a hello world app in `apps/tv` and run it on the Vega Virtual Device.
- [x] 0.3 In that app, make one `fetch` call to a public HTTPS address and show the result on screen.
- [x] 0.4 In that app, open a WebSocket to a public echo server and show a received message on screen.
- [ ] ~~0.5~~ (moved to 4.4; see decisions.md, mock SMS webhook) Request a Canadian long code in AWS End User Messaging and turn on two-way SMS to an SNS topic. Record the request in `docs/decisions.md`.
- [ ] ~~0.6~~ (moved to 4.4; see decisions.md, mock SMS webhook) Send a text from a Canadian phone to the existing Zernio number and confirm the webhook fires.
- [x] 0.7 Start `docs/friction-log.md` with anything that got in the way so far.

**CHECKPOINT 0.** Show me the app on the virtual device with the fetch and WebSocket results, and the state of both phone numbers.

### Milestone 1: the record keeper

- [x] 1.1 In `packages/core`, write the types and pure functions for phone normalising and hashing, code matching, friend matching, card states, grouping, and track record, with unit tests for every rule in product.md. (R1.6, R4.1, R4.2, R4.4)
- [x] 1.2 In `packages/store`, define the store interface, then the in-memory version with the demo household seed. (R10.1)
- [x] 1.3 In `packages/sms`, define the interface and build the local simulator. (R2.5)
- [x] 1.4 Build `services/api` with `POST /devices`, `POST /devices/code`, `GET /inbox`, `PATCH /cards/:id`, and `POST /dev/text`. (R1.1, R1.2, R6.1 to R6.5)
- [x] 1.5 Build `services/intake` with pairing and message saving, running locally. (R1.3, R1.5, R2.1 to R2.3)
- [x] 1.6 Add `pnpm dev:local` and `pnpm text`. For now, `pnpm text` creates a card from a fixture. (R10.1, R10.2)

**CHECKPOINT 1.** Show me all tests passing, and a card created by `pnpm text`.

### Milestone 2: the TV app

- [x] 2.1 Set up navigation, the theme, and the title card component in `apps/tv`. (R7.1, R7.8, R7.10)
- [x] 2.2 Build the pairing screen against the local API. (R1.1, R1.2, R1.4)
- [x] 2.3 Build the inbox screen with the hero area and rows, from seeded data. (R7.2, R7.3)
- [x] 2.4 Build the card detail screen with the Alexa line and the four actions. (R7.5, R7.6, R9.1, R9.2)
- [x] 2.5 Build the "Check these" picker, the settings screen, and the empty inbox. (R7.7)
- [x] 2.6 Add polling, the placeholder card, and offline start from saved data. (R7.9, R8.2 to R8.4)
- [x] 2.7 Walk every screen with only the remote keys. Fix any place focus is lost. (R7.3, R7.4)

**CHECKPOINT 2.** I pair, browse, star, hide, and rate on the virtual device, using seeded data.

### Milestone 3: the agent

- [x] 3.1 In `packages/sources`, build the OMDb and ScrapeCreators clients, each with recorded fixtures and the seven-day cache. (R5.1 to R5.3)
- [x] 3.2 Build `services/recco-agent` with the tools (now four; `where_to_watch` was removed 2026-10-13). Run it locally against the in-memory store. (R3.1, R3.3)
- [x] 3.3 Add link reading and grouping. (R3.2, R3.6)
- [x] 3.4 Add "Check these", unsorted notes, and the `save_cards` validation. (R3.4, R3.5)
- [x] 3.5 Add friend matching and creation. (R4.1 to R4.3)
- [x] 3.6 Write a test set of 25 real-shaped texts and links with expected results. Run it and report the score. (R3.7)
- [x] 3.7 Add `MOCK_AGENT=1`. (R10.2)

**CHECKPOINT 3.** Show me the test set results. I send ten texts of my own with `pnpm text` and watch the cards arrive on the virtual device.

### Milestone 4: on AWS

- [x] 4.1 Create the CDK app: DynamoDB table, API Lambda with function URL, SNS topic, SQS queue with a dead-letter queue, intake Lambda, agent-worker Lambda, Secrets Manager entries.
- [x] 4.2 Add the DynamoDB version of the store with the data model in design.md.
- [x] 4.3 Deploy the agent to AgentCore Runtime through CDK, or a deploy script if the CDK construct does not work. Record which in decisions.md.
- [ ] 4.4 Add the AWS End User Messaging and Zernio implementations in `packages/sms`. Point whichever number works at the queue. (R2.5)
- [x] 4.5 Add AppSync Events, publish from intake and `save_cards`, and add `GET /realtime`. (R8.1)
- [x] 4.6 Add the WebSocket client to the TV app, with polling as the fallback. (R8.2 to R8.4)
- [x] 4.7 Measure the three budgets in tech.md and report them.
- [x] 4.8 Fill in `docs/aws-integrations.md` for every service so far.

**CHECKPOINT 4.** I text the real number from my phone and the card appears on the virtual device. Tell me which SMS provider is live and why.

### Milestone 5: make it feel finished

- [ ] ~~5.1~~ (cut 2026-10-13: the new design has no thumbs or friend rows; see decisions.md) Add the friend track record to each friend row and to card detail. (R4.4)
- [x] 5.2 Apply the design handoff in `docs/design/`: themes, Featured and Inbox, the detail drawer, settings, stacks, onboarding, and ratings from OMDb. (R7.1, R7.2, R7.4 to R7.8, R7.11 to R7.13, R9.1)
- [x] 5.3 Handle the failure cases on screen: failed card, expired code, no network. (R3.8, R7.9)
- [ ] 5.4 (open at submission, 2026-10-14: no Fire TV Stick; tested on the Vega Virtual Device only) If a Fire TV Stick is available, install the app on it and repeat Checkpoint 2 and Checkpoint 4 there. Test the Alexa line for six services.
- [ ] 5.5 (open at submission: the duplicate-message guard is in, retry for failed messages is not) Add retry for failed messages and the duplicate-message guard. (R2.3, R3.8)
- [ ] 5.6 (open at submission; see README, Privacy) In `packages/core`, add `isForgetCommand` and `planMove` with tests. In `packages/store`, add `phoneHash` on the household, household TV items, `listHouseholdDevices`, `moveDevice`, `rotateChannel` and `deleteHousehold`, in both stores, with contract tests that a deleted household leaves no item behind. (R1.7 to R1.9, R11.1)
- [ ] 5.7 (open at submission) Wire them in: `DELETE /household`; "FORGET ME" and moving a TV in intake; the `save_cards` and agent-worker guards; the `household.deleted` and `channel.changed` events; `otherTvs` in the inbox. (R1.7 to R1.9, R11.2, R11.4 to R11.8)
- [ ] 5.8 (open at submission) On the TV: "Forget me" with its confirm step, the "Pair another phone" warning, handling both new events, and dropping the saved inbox on a household change. (R1.10, R1.11, R11.3, R11.5, R11.6)
- [ ] 5.9 (open at submission) Take household data out of logs (agent-worker logs the agent's reply, the agent logs its report), cut the dead-letter queue to 4 days, and backfill `phoneHash` and household TV items for households already in the deployed table, or reset it. (R11.9)

**CHECKPOINT 5.** Full run-through: pair, text, link, browse, say the line, mark watched. Then pair a second TV, move the first one to another phone and check the list stays on the second TV; forget the household from the TV; pair again and forget it by text.

### Milestone 6: documents, video, submit

- [x] 6.1 Write the README: what it is, local run, virtual device run, AWS deploy, teardown, and where data can outlive a delete. (R10.4, R11.10)
- [x] 6.2 (2026-10-14: a fresh clone installs and passes `pnpm test` with no AWS credentials) Confirm a fresh clone runs with no AWS account. (R10.1 to R10.3)
- [x] 6.3 Add `pnpm infra:destroy`. (R10.5)
- [x] 6.4 Complete friction-log.md, product-feedback.md, and aws-integrations.md.
- [x] 6.5 Write `docs/demo-script.md` from the outline below.
- [x] 6.6 Record the video. Under three minutes.
- [x] 6.7 Submit on Devpost: description, repo, video, product feedback, friction log, Fire TV track, AWS Builder mini challenge.
- [ ] ~~6.8~~ (not needed: the repo is public) If the repo is private, add the reviewer accounts listed on the hackathon page as collaborators when submitting.

**CHECKPOINT 6.** I watch the video and read the submission before it goes in.

### If scope has to be cut, cut in this order

1. Settings screen (keep a fixed "paired" label in the inbox).
2. The WebSocket (keep polling).
3. Friend track record.
4. Link reading (keep plain texts).
5. AWS End User Messaging (keep Zernio).

Never cut: pairing by text, a plain text becoming a card, the inbox, card detail with the Alexa line, the agent on AgentCore, and forget me with clean TV moves (nothing goes public without them).

### Stretch, only after milestones 0 to 5 are done

- [ ] S1 Add Bedrock Guardrails to the agent's input.
- [ ] S2 Run the same code on Fire OS using Amazon's multi-TV sample as the guide.
- [ ] S3 Open Source mini challenge: contribute a fix or a sample to a public Vega or React Native TV repo found along the way.

### Video outline (for task 6.5)

1. Her story. She sits down, runs out of featured shows, picks up her phone, and starts scrolling.
2. Pairing. The TV shows a code. She texts it. "Connected."
3. Capture in the wild. A friend's pick by text, then a link. Cards appear on the TV as they are sent.
4. Sitting down. Flip through Featured, open a card in the Inbox, say the line, the show starts.
5. A "Which one?" card gets fixed with the remote, and a TikTok's stack is unstacked into the inbox.
6. How it is built: the text path on AWS, the agent's steps, and the Vega app.
7. One line on what it would take to ship.

### Questions for hackathon office hours

- May real show titles and posters appear in the video, with a disclaimer, or must they be invented?
- Does the Alexa "Watch <title>" hand-off work from inside a third-party app on Vega, and on the virtual device?
- May one project be entered in both the Fire TV and Alexa+ tracks?
- Is there a supported way for an app to open Fire TV search for a title?
