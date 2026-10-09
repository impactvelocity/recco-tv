### Overview

```
Her phone ──text──► SMS provider (AWS End User Messaging, or Zernio)
                         │
                         ▼
                    SNS ─► SQS ─► intake (Lambda)
                                     │  pairing code? ─► link phone, publish "paired"
                                     │  otherwise ─► save raw message, publish "pending"
                                     ▼
                              agent-worker (Lambda, async)
                                     ▼
                              recco-agent (Strands on AgentCore, Bedrock model)
                                     │  tools: read_post, find_titles, where_to_watch,
                                     │         list_friends, save_cards
                                     ▼
                                 DynamoDB (one table) ──► publish "ready"
                                     ▲                         │
                                     │                         ▼
Fire TV app ──HTTPS──► api (Lambda + function URL)      AppSync Events
     ▲                                                        │
     └─────────────────────── WebSocket ──────────────────────┘
```

### Data model

One DynamoDB table. Partition key `PK`, sort key `SK`.

| Item | PK | SK | Main fields |
|---|---|---|---|
| Household | `HH#<id>` | `META` | country, createdAt, phoneLast4 |
| Friend | `HH#<id>` | `FRIEND#<friendId>` | name, ratedUp, rated |
| Card | `HH#<id>` | `CARD#<time>#<cardId>` | titleId, title, year, type, plot, posterUrl, services, friendId, note, source, sourceUrl, state, rating, needsCheck, candidates, groupId, messageId |
| Raw message | `HH#<id>` | `MSG#<time>#<messageId>` | body, status, providerMessageId |
| Phone link | `PHONE#<hash>` | `META` | householdId |
| Device | `DEVICE#<deviceId>` | `META` | householdId, tokenHash, pairedAt |
| Pairing code | `PAIR#<code>` | `META` | deviceId, expiresAt (TTL) |
| Title cache | `TITLE#<imdbId>#<country>` | `META` | title data, services, expiresAt (TTL) |
| Seen message | `SEEN#<providerMessageId>` | `META` | expiresAt (TTL) |

The inbox is one query on `PK = HH#<id>` that returns the household, friends, and cards, skipping raw messages.

### API

Hono on Lambda behind a function URL. Every call except `POST /devices` needs `Authorization: Bearer <deviceToken>`.

| Call | What it does |
|---|---|
| `POST /devices` | Create a device. Returns the device token, pairing code, Recco number, and expiry. |
| `POST /devices/code` | Issue a fresh pairing code. |
| `GET /inbox` | Pairing state, friends, and cards. |
| `PATCH /cards/:id` | Change state, rating, chosen candidate, or friend. |
| `GET /realtime` | WebSocket address, channel name, and auth for AppSync Events. |
| `POST /dev/text` | Local and demo only. Feeds a fake text into intake. |

### Events

One AppSync Events channel per household, with an unguessable id, and one per device until it is paired.

| Event | Sent when | TV does |
|---|---|---|
| `paired` | A code matches | Shows "Connected", then loads the inbox |
| `card.pending` | A text is saved | Adds a placeholder card |
| `card.ready` | The agent saves a card | Replaces the placeholder |
| `card.updated` | A card changes | Refreshes that card |
| `card.failed` | The agent gives up | Removes the placeholder |

Use an API key for AppSync Events in the demo. Note in `docs/decisions.md` that production needs a Lambda authoriser tied to the device token.

### Recco agent

Built with the Strands Agents TypeScript SDK, deployed to AgentCore Runtime. It receives the household id, the message id, and the message body.

- **Tool: read_post.** Takes a link. Returns the caption, the transcript, and the author. Uses ScrapeCreators.
- **Tool: find_titles.** Takes a title guess, with an optional year and type. Returns up to five candidates. Uses OMDb.
- **Tool: where_to_watch.** Takes an IMDb id and a country. Returns the list of services. Uses Streaming Availability.
- **Tool: list_friends.** Returns the household's friends.
- **Tool: save_cards.** Takes the finished cards. Validates them, writes them, updates the message, and publishes the events.

Rules the agent follows:

1. Work out whether the text is a title, a link, or both.
2. For a link, call `read_post` first.
3. Call `find_titles` for every title before saving anything.
4. Mark a card for "Check these" when the top two candidates are close, or the text gives no year or type to separate them.
5. Keep her note in her own words. Do not rewrite it.
6. Call `save_cards` exactly once.

`save_cards` is plain code, not a model call. It rejects any card whose `titleId` did not come from `find_titles` in this run.

### Pairing flow

1. First launch: the TV app calls `POST /devices`, stores the device token, and shows the code and the Recco number.
2. It opens the device channel, or polls `GET /inbox`, and waits.
3. She texts the code. Intake finds `PAIR#<code>`, hashes the phone, and finds or creates the household.
4. Intake writes the phone link and the device's household, deletes the code, and publishes `paired`.
5. The TV app shows "Connected to the phone ending 1234" and moves to the inbox.

### Fire TV app design

- **Pairing screen.** The code and number in very large type, one line of explanation, and a spinner. Nothing to focus.
- **Inbox screen.** A hero area at the top shows the focused card's title, who, and note. Rows scroll beneath it. Focus starts on the first card in New.
- **Card detail screen.** Poster or title card on the left. Title, year, who, note, and services on the right. The Alexa line sits above the action row. Focus starts on Star.
- **Settings screen.** The linked phone's last four digits, "Pair another phone" (shows a new code), and the app version.
- **Placeholder card.** A soft pulsing card that reads "Reading your text".
- **Empty inbox.** The Recco number and three example texts to send.
- **Focus.** Use the focus patterns from Amazon's `vega-tv-interfaces-sample`. Remember the focused card per row. Back from the inbox root exits the app.
- **State.** Load the inbox on launch and keep it in memory. Apply events to it. Save the last inbox to storage for offline start.

### Local mode

`pnpm dev:local` runs the API and intake on localhost with the in-memory store and the SMS simulator. With `MOCK_AGENT=1` the agent returns recorded results, so the whole thing runs with no AWS account. Confirm how the Vega Virtual Device reaches a server on the host machine, and record the answer in `docs/decisions.md`.
