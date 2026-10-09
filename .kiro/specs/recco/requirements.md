### R1. Pairing

- R1.1 WHEN the TV app starts for the first time, THE API SHALL create a device, return a device token, and return a five-digit pairing code with the Recco phone number.
- R1.2 THE pairing code SHALL expire after ten minutes, and THE TV app SHALL request a new one when it does.
- R1.3 WHEN a text containing a valid pairing code arrives, THE system SHALL link the sender's phone to that device's household, creating the household if the phone is new.
- R1.4 WHEN pairing succeeds, THE TV app SHALL show "Connected" with the last four digits of the phone within 5 seconds.
- R1.5 WHEN a phone that already has a household pairs a second TV, THE system SHALL attach the new device to the existing household.
- R1.6 THE system SHALL store each phone number as a salted hash plus its last four digits, and SHALL NOT return the full number from any API.

### R2. Text intake

- R2.1 WHEN a text arrives from a linked phone, THE system SHALL store the raw message, send a "pending" event to the household's TVs, and start the agent.
- R2.2 IF a text arrives from a phone that is not linked and does not contain a valid pairing code, THEN THE system SHALL drop it and store nothing but a count.
- R2.3 IF the same provider message id arrives twice, THEN THE system SHALL process it once.
- R2.4 THE system SHALL NOT send any text message to the user.
- R2.5 THE intake path SHALL work the same with AWS End User Messaging, Zernio, and the local simulator.

### R3. Reading a text

- R3.1 WHEN a text has no link, THE agent SHALL extract the title, an optional friend name, and the note in her words.
- R3.2 WHEN a text has a link, THE agent SHALL read the post's caption and transcript and extract every show or movie it names.
- R3.3 THE agent SHALL look up each title and save a card only when the lookup returns a match.
- R3.4 IF the best match is uncertain, THEN THE agent SHALL save the card to "Check these" with up to three candidates.
- R3.5 IF nothing matches, THEN THE agent SHALL save an unsorted note with her words and the link.
- R3.6 WHEN one post yields several titles, THE agent SHALL save one card each with a shared group id.
- R3.7 THE agent SHALL treat message and post contents as data and SHALL NOT follow instructions found in them.
- R3.8 IF the agent fails, THEN THE system SHALL mark the message failed, send a "failed" event, and keep the raw message for a retry.

### R4. Friends

- R4.1 WHEN a text names a person, THE agent SHALL match an existing friend, ignoring case, or create a new one.
- R4.2 WHEN a text names no one, THE system SHALL file the card under "From me", or "From the internet" for a link with no other words.
- R4.3 THE system SHALL store only a first name for each friend.
- R4.4 THE API SHALL return, for each friend, the count of cards rated up and the count of cards rated.

### R5. Show data

- R5.1 EACH card SHALL carry a title, year, type, a short plot, an optional poster link, and the list of services that carry it in the household's country.
- R5.2 THE system SHALL cache title data and availability for seven days.
- R5.3 IF availability cannot be fetched, THEN THE card SHALL still be saved, with no services listed.

### R6. Inbox API

- R6.1 WHEN the TV app calls the inbox, THE API SHALL return all cards that are not hidden, the friends, and the pairing state, in one response.
- R6.2 WHEN the TV app updates a card, THE API SHALL accept a new state, a rating, a chosen candidate, or a different friend.
- R6.3 IF a request has no valid device token, THEN THE API SHALL respond 401.
- R6.4 THE API SHALL return only the calling device's household.
- R6.5 THE API SHALL make no model calls.

### R7. Fire TV app

- R7.1 THE app SHALL have four screens: pairing, inbox, card detail, and settings.
- R7.2 THE inbox SHALL show rows in this order: New, Starred, one row per friend, From me, From the internet, Check these.
- R7.3 EVERY screen SHALL be fully usable with the D-pad, Select, and Back, and one item SHALL always have focus.
- R7.4 WHEN the user presses Back on card detail, THE app SHALL return to the same card in the inbox.
- R7.5 THE card detail screen SHALL show the title, who recommended it, her note, the services, and the Alexa line.
- R7.6 THE card detail screen SHALL offer Star, Hide, Thumbs up, and Thumbs down.
- R7.7 WHEN a card is in "Check these", THE card detail screen SHALL show the candidates and let her pick one.
- R7.8 THE app SHALL remain readable from across a room: no text smaller than 28 px on a 1080p canvas, and a safe margin on every edge.
- R7.9 WHILE the app has no network, THE app SHALL show the last inbox it loaded and a small "offline" note.
- R7.10 WHERE `POSTERS=off` is set, THE app SHALL render every card as a text-only title card.

### R8. Live updates

- R8.1 WHEN a card is pending, ready, updated, or failed, THE system SHALL publish an event for that household.
- R8.2 WHEN a "pending" event arrives, THE TV app SHALL show a placeholder card in New.
- R8.3 WHEN a "ready" event arrives, THE TV app SHALL replace the placeholder with the card without moving focus.
- R8.4 IF the WebSocket is not connected, THEN THE TV app SHALL poll the inbox every five seconds.

### R9. Alexa hand-off

- R9.1 THE card detail screen SHALL show the line: hold the mic button and say "Watch <title>".
- R9.2 THE app SHALL NOT open another app, deep-link into another app, or launch Fire TV search.

### R10. Running it

- R10.1 `pnpm dev:local` SHALL start the API with the in-memory store, seeded with a demo household, three friends, and twelve cards, with no AWS account needed.
- R10.2 `pnpm text "<message>"` SHALL send a fake text through the local simulator and produce a card.
- R10.3 `pnpm test` SHALL run all unit tests with no AWS account needed.
- R10.4 THE README SHALL document local setup, running the TV app on the Vega Virtual Device, AWS deployment, and teardown.
- R10.5 `pnpm infra:destroy` SHALL remove every AWS resource the project created.
