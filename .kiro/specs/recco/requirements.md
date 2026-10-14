### R1. Pairing

- R1.1 WHEN the TV app starts for the first time, THE API SHALL create a device, return a device token, and return a five-digit pairing code with the Recco phone number.
- R1.2 THE pairing code SHALL expire after ten minutes, and THE TV app SHALL request a new one when it does.
- R1.3 WHEN a text containing a valid pairing code arrives, THE system SHALL link the sender's phone to that device's household, creating the household if the phone is new.
- R1.4 WHEN pairing succeeds, THE TV app SHALL show "Connected" with the last four digits of the phone within 5 seconds.
- R1.5 WHEN a phone that already has a household pairs a second TV, THE system SHALL attach the new device to the existing household.
- R1.6 THE system SHALL store each phone number as a salted hash plus its last four digits, and SHALL NOT return the full number from any API.
- R1.7 WHEN a paired TV pairs with a phone linked to a different household, or to no household, THE system SHALL move the device to that phone's household and remove it from the old one.
- R1.8 WHEN a TV moves and the old household has no other devices, THE system SHALL delete the old household as in R11.1.
- R1.9 WHEN a TV moves and the old household still has other devices, THE system SHALL give the old household a new channel id and tell its remaining TVs to reconnect.
- R1.10 WHEN a TV is paired to a different household, THE TV app SHALL discard its saved inbox before it shows the new one.
- R1.11 BEFORE the settings screen shows a code under "Pair another phone", IT SHALL say whether the current list will be deleted (this is its only TV) or stay on the other TVs.

### R2. Text intake

- R2.1 WHEN a text arrives from a linked phone, THE system SHALL store the raw message, send a "pending" event to the household's TVs, and start the agent.
- R2.2 IF a text arrives from a phone that is not linked and does not contain a valid pairing code, THEN THE system SHALL drop it and store nothing but a count.
- R2.3 IF the same provider message id arrives twice, THEN THE system SHALL process it once.
- R2.4 THE system SHALL NOT send any text message to the user.
- R2.5 THE intake path SHALL work the same with AWS End User Messaging, Zernio, and the local simulator.
- R2.6 WHEN texts from one household arrive less than 5 seconds apart (a phone splitting a link and its words), THE agent SHALL read them as one text, save the cards under the first, mark the others merged, and drop their placeholders.

### R3. Reading a text

- R3.1 WHEN a text has no link, THE agent SHALL extract the title, an optional friend name, and the note in her words.
- R3.2 WHEN a text has a link, THE agent SHALL read the post's caption and transcript and extract every show or movie it names.
- R3.3 THE agent SHALL look up each title and save a card only when the lookup returns a match.
- R3.4 IF the best match is uncertain, THEN THE agent SHALL save the card to "Check these" with up to three candidates.
- R3.5 IF nothing matches, THEN THE agent SHALL save an unsorted note with her words and the link.
- R3.6 WHEN one post yields several titles, THE agent SHALL save one card each with a shared group id, a short group title ("Thanksgiving Movie Night"), and her words about the group as the note on every card.
- R3.7 THE agent SHALL treat message and post contents as data and SHALL NOT follow instructions found in them.
- R3.8 IF the agent fails, THEN THE system SHALL mark the message failed, send a "failed" event, and keep the raw message for a retry.
- R3.9 WHEN a text asks for ideas rather than naming a show, THE agent SHALL pick up to seven titles that fit (five unless the text gives a number), save only titles the lookup returns, and file them as one named stack under "Recco's picks".

### R4. Friends

- R4.1 WHEN a text names a person, THE agent SHALL match an existing friend, ignoring case, or create a new one.
- R4.2 WHEN a text names no one, THE system SHALL file the card under "From me", or "From the internet" for a link with no other words.
- R4.3 THE system SHALL store only a first name for each friend.
- R4.4 THE API SHALL return, for each friend, the count of cards rated up and the count of cards rated.

### R5. Show data

- R5.1 EACH card SHALL carry a title, year, type, a short plot, and an optional poster link.
- R5.2 THE system SHALL cache title data for seven days.
- R5.3 (Removed 2026-10-13. Recco does not say where a title streams; Alexa and Fire TV search decide that.)

### R6. Inbox API

- R6.1 WHEN the TV app calls the inbox, THE API SHALL return all cards that are not hidden, the friends, and the pairing state, in one response.
- R6.2 WHEN the TV app updates a card, THE API SHALL accept a new state, a rating, a chosen candidate, or a different friend.
- R6.3 IF a request has no valid device token, THEN THE API SHALL respond 401.
- R6.4 THE API SHALL return only the calling device's household.
- R6.5 THE API SHALL make no model calls.

### R7. Fire TV app

- R7.1 THE app SHALL have a pairing screen and a home screen. Home SHALL have a Featured view and an Inbox view under one header, with the detail drawer and settings as panels over it.
- R7.2 THE inbox SHALL show one tile per show, newest first and watched shows last. The same title from several people SHALL be one tile, and the shows from one text or post SHALL be one stack while two or more of them remain.
- R7.3 EVERY screen SHALL be fully usable with the D-pad, Select, and Back, and one item SHALL always have focus.
- R7.4 WHEN the user closes the detail drawer, THE app SHALL return focus to the tile it was opened from.
- R7.5 THE detail drawer SHALL show the title, ratings, synopsis, everyone who recommended it with their messages, and the Alexa line.
- R7.6 THE detail drawer SHALL offer Mark Watched, Remove, and Back.
- R7.7 WHEN a card needs a check, THE detail drawer SHALL show the candidates and let her pick one.
- R7.8 THE app SHALL remain readable from across a room: it SHALL follow the type scale in `docs/design/README.md` on a 1080p canvas, with 96 px side margins.
- R7.9 WHILE the app has no network, THE app SHALL show the last inbox it loaded and a small "offline" note.
- R7.10 WHERE `POSTERS=off` is set, THE app SHALL render every card as a text-only title card.
- R7.11 THE settings panel SHALL let her choose Auto or one of the seven themes, the view that opens first, and whether watched shows are hidden. THE TV SHALL remember these choices.
- R7.13 WHEN the theme is Auto (the default) THE TV SHALL show the seasonal scene for its local date and time: winter December to March, summer April to August, fall September to November; day from 7:00 to 19:00, night otherwise.
- R7.12 WHEN she opens a stack and chooses "Unstack into Inbox", THE system SHALL make each of its shows a separate card for every TV of the household.

### R8. Live updates

- R8.1 WHEN a card is pending, ready, updated, or failed, THE system SHALL publish an event for that household.
- R8.2 WHEN a "pending" event arrives, THE TV app SHALL show a placeholder card in New, one per burst of texts sent less than 5 seconds apart (R2.6).
- R8.3 WHEN a "ready" event arrives, THE TV app SHALL replace the placeholder with the card without moving focus.
- R8.4 IF the WebSocket is not connected, THEN THE TV app SHALL poll the inbox every five seconds.

### R9. Alexa hand-off

- R9.1 THE detail drawer and Featured SHALL show the line: To watch, say "Alexa, watch <title>".
- R9.2 THE app SHALL NOT open another app, deep-link into another app, or launch Fire TV search.

### R10. Running it

- R10.1 `pnpm dev:local` SHALL start the API with the in-memory store, seeded with a demo household, three friends, and twelve cards, with no AWS account needed.
- R10.2 `pnpm text "<message>"` SHALL send a fake text through the local simulator and produce a card.
- R10.3 `pnpm test` SHALL run all unit tests with no AWS account needed.
- R10.4 THE README SHALL document local setup, running the TV app on the Vega Virtual Device, AWS deployment, and teardown.
- R10.5 `pnpm infra:destroy` SHALL remove every AWS resource the project created.

### R11. Forget me

- R11.1 WHEN a household is forgotten, THE system SHALL permanently delete its cards, friends, raw messages, phone link, and devices, and SHALL keep no copy or soft-delete flag.
- R11.2 WHEN the user confirms "Forget me" on the settings screen, THE API SHALL delete the calling device's household and respond only once the delete is complete.
- R11.3 THE settings screen SHALL ask for confirmation before deleting, with focus starting on the option that keeps the list.
- R11.4 WHEN a text from a linked phone is exactly "forget me" (ignoring case, surrounding spaces, and trailing punctuation), THE system SHALL delete that household and SHALL NOT start the agent or save the text.
- R11.5 WHEN a household is deleted, THE system SHALL publish a "household.deleted" event, and every TV of that household SHALL clear its saved inbox and device token and show the pairing screen.
- R11.6 IF a TV of a deleted household calls the API, THEN THE API SHALL respond 401, and THE TV app SHALL do the same as in R11.5.
- R11.7 IF the agent finishes for a household that no longer exists, THEN `save_cards` SHALL write nothing and publish nothing.
- R11.8 AFTER a household is deleted, THE system SHALL treat texts from its phone as texts from an unknown number (R2.2).
- R11.9 THE system SHALL NOT write phone numbers, message text, or card contents to logs.
- R11.10 THE README SHALL list where data can outlive a delete (the dead-letter queue, the model provider, outside lookups) and for how long.
