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
                                     │  tools: read_post, find_titles, list_friends,
                                     │         save_cards
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
| Household | `HH#<id>` | `META` | country, createdAt, phoneLast4, phoneHash, channelId |
| Friend | `HH#<id>` | `FRIEND#<friendId>` | name, ratedUp, rated |
| Card | `HH#<id>` | `CARD#<time>#<cardId>` | titleId, title, year, type, plot, posterUrl, friendId, note, source, sourceUrl, state, rating, needsCheck, candidates, groupId, messageId |
| Raw message | `HH#<id>` | `MSG#<time>#<messageId>` | body, status, providerMessageId |
| Household TV | `HH#<id>` | `DEVICE#<deviceId>` | pairedAt |
| Phone link | `PHONE#<hash>` | `META` | householdId |
| Device | `DEVICE#<deviceId>` | `META` | householdId, tokenHash, pairedAt |
| Pairing code | `PAIR#<code>` | `META` | deviceId, expiresAt (TTL) |
| Title cache | `TITLE#<imdbId>#<country>` | `META` | title data, expiresAt (TTL) |
| Seen message | `SEEN#<providerMessageId>` | `META` | expiresAt (TTL) |

The inbox is one query on `PK = HH#<id>` that returns the household, friends, and cards, skipping raw messages and household TVs.

Everything a household owns is either in its partition or reachable from it: the phone link through `phoneHash` on `META`, and each device through a household TV item. That is what lets a delete be complete without a scan or an index.

### API

Hono on Lambda behind a function URL. Every call except `POST /devices` needs `Authorization: Bearer <deviceToken>`.

| Call | What it does |
|---|---|
| `POST /devices` | Create a device. Returns the device token, pairing code, Recco number, and expiry. |
| `POST /devices/code` | Issue a fresh pairing code. |
| `GET /inbox` | Pairing state (including `householdId` and `otherTvs`, the household's other device count), friends, and cards. A device whose household is gone gets 401. |
| `PATCH /cards/:id` | Change state, rating, chosen candidate, or friend. |
| `DELETE /household` | Forget me. Deletes the calling device's household and returns 204 when done. |
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
| `household.deleted` | Forget me, or the last TV moved away | Clears token and saved inbox, shows pairing |
| `channel.changed` | A TV left this household | Calls `GET /realtime` and resubscribes |

Neither household event carries a channel id, so the TV that left learns nothing from them.

Use an API key for AppSync Events in the demo. Note in `docs/decisions.md` that production needs a Lambda authoriser tied to the device token.

### Recco agent

Built with the Strands Agents TypeScript SDK, deployed to AgentCore Runtime. It receives the household id, the message id, and the message body.

- **Tool: read_post.** Takes a link. Returns the caption, the transcript, and the author. Uses ScrapeCreators for TikTok, Instagram and YouTube, and Jina Reader for any other link (articles, IMDb, Letterboxd), where the caption is the page title and the transcript the page text.
- **Tool: find_titles.** Takes a title guess, with an optional year and type. Returns up to five candidates. Uses OMDb.
- **Tool: list_friends.** Returns the household's friends.
- **Tool: save_cards.** Takes the finished cards. Validates them, writes them, updates the message, and publishes the events.

Rules the agent follows:

1. Work out whether the text is a title, a link, or both.
2. For a link, call `read_post` first.
3. Call `find_titles` for every title before saving anything.
4. Mark a card for "Check these" when the top two candidates are close, or the text gives no year or type to separate them.
5. Keep her note in her own words. Do not rewrite it.
6. Call `save_cards` exactly once.

`save_cards` is plain code, not a model call. It rejects any card whose `titleId` did not come from `find_titles` in this run. It writes nothing if the household or the message no longer exists (R11.7).

### Pairing flow

1. First launch: the TV app calls `POST /devices`, stores the device token, and shows the code and the Recco number.
2. It opens the device channel, or polls `GET /inbox`, and waits.
3. She texts the code. Intake finds `PAIR#<code>`, hashes the phone, and finds or creates the household.
4. Intake writes the phone link and the device's household, deletes the code, and publishes `paired`.
5. The TV app shows "Connected to the phone ending 1234" and moves to the inbox.

### Moving a TV

When a pairing code arrives (step 3 above) for a device that already belongs to a household:

1. Same household: refresh `pairedAt` and stop.
2. Different household: write the device's new household and its household TV item, delete its household TV item in the old household, and publish `paired` on the device channel.
3. Count the old household's remaining TVs. None: forget the old household (below). Some: give it a new `channelId` and publish `channel.changed` on the old channel id.

The decision is a pure function in `packages/core` (`planMove`), so the rule is tested without a store.

### Forget me

Triggered by `DELETE /household`, or by intake when a linked phone texts "FORGET ME" (`isForgetCommand` in `packages/core`). One store call, `deleteHousehold(id)`, in this order:

1. Delete `HH#<id>` `META`. From here every reader treats the household as gone: the API answers 401, intake drops the phone's texts, `save_cards` writes nothing.
2. Delete the household's cards, friends and messages, in batches of 25.
3. Delete each `DEVICE#<deviceId>` named by a household TV item (only if it still points here), then the TV items.
4. Delete `PHONE#<phoneHash>` (only if it still points here).
5. The caller publishes `household.deleted` on the household channel.

Every step is idempotent, and the pointers in (`DEVICE#`, `PHONE#`) go last, so whatever finds one finishes a delete that stopped partway: a TV whose household is gone gets 401 and the API finishes the delete; a text from a phone linked to a missing household finishes it and is dropped. A writer that saves into a household (intake, `save_cards`, `PATCH /cards`) checks again after writing, and sweeps up what it wrote if the household went in the meantime. Pairing codes, seen-message ids and the title cache hold no household data and expire by TTL.

Outside the table, data can outlive a delete in three places, each listed in the README: the SQS dead-letter queue (raw texts with phone numbers, kept 4 days), the model provider behind the AI gateway (its own retention), and the outside lookups (OMDb sees titles, ScrapeCreators and Jina Reader see links). Logs carry ids, statuses and timings only.

### Fire TV app design

The look, sizes and focus treatments are in `docs/design/README.md` (the Claude Design handoff). Each theme is a still, a vignette layer and a set of colours; the default is Auto, which picks the seasonal scene for the TV's local date and time (`sceneFor` in `packages/core`).

- **Pairing screen.** "Getting a code…", then the code in five large digit boxes with the number, one line of explanation and a "Waiting for your text…" pill, then "Connected". Nothing to focus.
- **Home screen.** A fixed header: the logo, Featured and Inbox tabs (focusing a tab switches the view), and the settings gear.
  - **Inbox.** A 3-column grid built by `buildInbox`. A tile shows the poster, title, type and year, ratings, the message bubble and who sent it. A stack shows three fanned posters; Select opens its shows, with "Unstack into Inbox". Focus starts on the first tile.
  - **Featured.** One show at a time in a large card; Left and Right flip through, wrapping. Stacks, unsorted notes and cards to check are skipped.
- **Detail drawer.** A panel from the right: poster, title, meta, ratings, the synopsis, everyone's messages, the Alexa line, then Mark Watched, Remove and Back. Focus starts on Mark Watched and stays in the drawer. A card to check shows "Which one did you mean?" and its candidates instead of the synopsis.
- **Settings panel.** The same panel style: Theme, Default view, Hide watched, the Recco number, "Pair another phone" (shows a new code), the linked phone's last four digits, "Forget me", and the app version.
  - "Pair another phone" first says what happens to this list: "This list will be deleted when the other phone pairs" if this is the household's only TV, otherwise "This list stays on your other TVs". Selecting it again shows the code.
  - "Forget me" turns the screen into a confirm step: "Delete your list, your friends, and the link to the phone ending 1234? Every TV using this list goes back to pairing. This can't be undone." Two buttons, "Keep my list" (focused) and "Delete everything".
- **Placeholder tile.** A dashed tile with a "typing" bubble (three hopping dots), a status line that steps from "Reading your text…" through "Working out which show…", "Looking it up…" and "Finding the poster…" to "Almost there…" (3.5 s a step, then it holds), and a light sweeping across the poster slot.
- **Empty inbox.** "Nothing to watch yet.", the Recco number, three how-it-works lines, and four example texts. Settings has focus.
- **Focus.** One element always has focus. Back, or Left from the leftmost control, closes the drawer or settings and returns focus to where it was. Back closes an open stack. Back from the home screen with nothing open exits the app.
- **State.** Load the inbox on launch and keep it in memory. Apply events to it. Save the last inbox to storage for offline start. When `householdId` changes, on `household.deleted`, or on a 401, throw the saved inbox away first. `household.deleted` then asks `GET /inbox`: a 401 clears the token and shows pairing; a TV that has just moved away gets its new household instead.

### Local mode

`pnpm dev:local` runs the API and intake on localhost with the in-memory store and the SMS simulator. With `MOCK_AGENT=1` the agent returns recorded results, so the whole thing runs with no AWS account. Confirm how the Vega Virtual Device reaches a server on the host machine, and record the answer in `docs/decisions.md`.
