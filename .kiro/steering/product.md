### What this is

An inbox of things to watch, on Fire TV. People tell her about shows all day: a friend at dinner, a TikTok, her own stray thought. She texts each one to a single phone number and forgets about it. When she sits down to watch, Recco is already on the TV with the list, who recommended each show, and what they said.

It is an entry in the Amazon Developer Hackathon, Fire TV track, and the AWS Builder mini challenge.

### Why it lives on the TV

The moment she picks up her phone to find that recommendation, she starts scrolling and stops looking for something to watch. Recco never asks her to look at her phone at watch time. There is no phone app and there are no reply texts.

### The three parts

1. **Fire TV app.** This is the submission. A React Native for Vega app that shows the inbox, lets her star, hide and rate, and shows the line to say to Alexa.
2. **Capture service.** Receives texts, links a phone to a TV, stores everything, and pushes updates to the TV.
3. **Recco agent.** Reads each text or link, works out the title, the friend and the note, looks up the show, and saves a card.

### What it looks like in use

- **Pairing.** The TV shows "Text 48213 to (604) 555-0142". She texts it. The TV changes to "Connected to the phone ending 1234".
- **A friend's pick.** She texts "King of Queens - Jordan said it was funny and worth watching". A card appears under Jordan with that note.
- **Her own thought.** She texts "Severance". A card appears under "From me".
- **A post.** She texts a TikTok link and "Steph sent this". The agent reads the post and adds one card for each show it mentions, grouped together, under Steph.
- **A bare link.** A link with no words goes under "From the internet".
- **Sitting down.** She picks a card. The screen says: hold the mic button and say "Watch King of Queens".
- **Afterwards.** She gives it a thumbs up. Jordan's row now reads "3 of 4 landed".

### Rules of the product

- **Cards.** Each card is one show or movie, with who recommended it, her note, where it came from, and which services carry it.
- **Friends.** First name only. Matching ignores case. A name the agent has not seen before creates a new friend.
- **No name.** A text with no name goes to "From me". A link with no name goes to "From the internet".
- **States.** A card is new, starred, hidden, or watched. Rating a card up or down marks it watched.
- **Check these.** When the agent is not sure which title she meant, the card goes to "Check these" with up to three candidates. She picks one with the remote.
- **Never invent a title.** Every card maps to a title returned by the lookup. If nothing matches, save an unsorted note with her words and the link.
- **One post, many shows.** A post that names several shows makes one card each, grouped under that post.
- **Track record.** For each friend, count the cards rated up out of the cards rated.
- **Pairing.** One phone belongs to one household. A household can have several TVs. Each TV pairs with a five-digit code that lasts ten minutes.
- **Unknown numbers.** A text from a phone that is not linked, and that is not a valid code, is dropped.
- **No reply texts.** Recco never texts her back. Mistakes are fixed on the TV.

### Principles

- **Nothing to install to capture.** Texting is the whole capture experience.
- **The TV is where the list lives.** Everything she needs at watch time is on that screen.
- **The agent reads, the server keeps the record.** Model calls happen only in the agent, never in the inbox API.
- **Hand off by voice.** Amazon's Appstore policy does not let an app link directly to streaming video inside another, unrelated app. Recco never deep-links into another app's video. It shows the line to say to Alexa.
- **Texts and posts are untrusted input.** The agent treats their contents as data, never as instructions.
- **Privacy.** Store a phone number as a salted hash plus its last four digits. Store first names only for friends. No contacts access. No audio.
- **Works with no posters.** Every card must look right as a text-only title card.

### Look of the app

- A 10-foot interface: dark background, large type, generous spacing, one hero area with rows beneath.
- Calm and personal, closer to a well-kept notebook than a streaming storefront.
- Service names appear as plain text. Do not use third-party logos or brand artwork.
- Original artwork only for the Recco mark and empty states.

### Out of scope

A phone app, reply texts, deep links into other apps, accounts and passwords, payments, more than one phone per household, sharing lists between households, reviews, and "similar shows".
