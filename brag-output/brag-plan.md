# Recco: brag plan

**What it is:** an inbox of things to watch, on Fire TV. Text a show to one number; when you sit down, the TV has the list, who recommended each show, and what they said.
**Who it's for:** people whose best shows come from friends, and who lose the evening scrolling.
**What sets it apart:** capture is just a text (no phone app, Recco never texts back). The agent turns a name, a link or a vague search into real, checked titles. The TV hands off with one line: "Alexa, watch …".
**Most impressive claim:** one TikTok link becomes three cards, and every title is checked against OMDb, so it never invents a show.
**Visual hook:** 9pm in a cozy winter-night living room (a static still, the user's new art); only the seasons montage at the end uses the looping season videos.
**Real UI shown:** pairing code, Connected, inbox with the pending tile → finished card, stack card, detail drawer with the Alexa line, Featured, all six season themes. Rebuilt from `docs/design/Recco TV v3.dc.html` and `Recco Onboarding.dc.html` (the TV app is React Native for Vega and can't render in a browser).
**Tone:** `polished`, warm and cozy. Long holds, soft fades, restrained motion.
**Share caption:** see `share-copy.txt`.

## Angle

The user's two scripts, read verbatim (VO at 1.25x): an evening story, then how it's built. Length follows the voiceover (~1:43), not the 20s default, because the script is the brief.

## Sound

The user's track, "Sunny Day Promise" (132.75 bpm, 120s), under the voice. No sound effects.
- It plays from 0. At a bar line under the voice (~30.8s) it crossfades on one beat back seven bars (12.5s, the jump refined by cross-correlating onsets), so the song runs 132.6s and its final hit lands as the end logo arrives (~130s).
- The bed ducks about 11 dB under the voice (envelope follower with look-ahead, slow release) and comes up in the gaps, like the silent tagline card at 64–66s.
- Part one voice: `assets/audio/vo-intro-v2.mp3` at 0.6s; part two: `vo-built-1x-cut.wav` at 67.0s (the build VO cut after "snowy winter nights", dropping "Just tell Alexa what to watch", so the last ~4s are music under the end card). Mixed by `work/sound/mix2.mjs` (song timing via env; Bright and Bouncy settings in its header), then plain gain plus a peak limiter to −17.1 LUFS, −1.4 dBFS (`assets/audio/mix.wav`; earlier mixes kept as `mix-bright-and-bouncy.wav`, `mix-v2-voiceonly.wav`).

## Motion pass

- Headlines rise in word by word, each scene enters with a soft scale and drifts slowly, and warm glow orbs drift behind the dark scenes.
- From "and a really good show" through "ten minutes of looking" it is one browse with one rhythm: the focus hops across, and when it drops a row the grid scrolls with it. "That's the plan" is a pause and a press on the pick.
- Each card that lands on the TV gets a punch-in. The inbox staggers in and the camera pushes toward Two-Car Garage before the drawer opens.
- The diagram has flowing edges, a steady stream of packets and icons that pop as each node lights. The agent breathes on the beat, inputs fly into it and outputs burst out of it.
- The search types itself, posters tumble in and pop when verified, the made-up title shakes before it's dropped, and the phone number scrambles into a hash.
- In the season sequence, a focus ring hops across the cards every two beats and takes on each theme's focus colour.

## Storyboard (global seconds)

| # | Time | Beat | On screen |
|---|---|---|---|
| A | 0–5.2 | 9pm. Tea, snacks, and an hour and a half before bed… | Winter-night room; "9pm"; tea and snacks pop in, then a clock whose hands run 9:00 → 10:30 while a wedge fills |
| B | 5.2–23.3 | …for a really good show. Ten minutes searching → Megan mentioned a show → forty minutes later, still scrolling → no time for anything → not exactly me time | A TV in the room shows a generic streaming home screen (featured film Sandfall: Part Two, then category rows); focus starts on Play, drops into the rows and highlights each tile in place while rows slide and the page scrolls (clock 9:00 → 9:10); the phone rises in front while the TV stays behind, smaller and faded, messages scroll to Megan's thread; the feed (user's clip) plays, clock jumps to 9:50 and creeps to 9:58; captions "No time for anything", "So I scroll some more", "Not exactly me time" |
| D+E | 23.3–55.5 | So now I use Recco, an inbox for my TV I text like a friend → setup → Jill → Steph → texting is great, send it anything, it just works | Logo lands on "So now I use Recco", lifts, and "An inbox for your TV you text like a friend" plays out: a phone and a small TV slide in and three texts (Jill's pick, a link, a rainy-night search) fly from the phone into the TV as cards; app page → install → pairing → inbox; Jill and Steph as before; then "Nothing to install. Just text it" / "Send it anything": a link (The Fog House), Megan's pick (The Will Reading) and "movies for a rainy night" (a three-film stack) land on the TV; "It just works"; the TV zooms to full frame |
| I | 55.5–63.9 | So when it's me time, my phone stays off, my inbox is full of reccos… tell Alexa which one | Full-frame inbox; focus moves across the new cards; the drawer opens on The Will Reading with "Alexa, watch The Will Reading" |
| K | 63.7–66.3 | (no voice) | Logo, "From a friend, a link, or you / Ready when you are" |
| O | 48.95–90.96 | Built for the hackathon → the TV app → how a text arrives → the agent → checked → saved and pushed → private | The big TV shows the TV app's own React Native code typing in, a "Hackathon build" sticker, the react-native imports light up, it builds and launches into the pairing screen and the code digits pop in. The phone texts it and the inbox opens. Then the phone sits left-centre, the TV app right-centre, and the steps come in top-down between them (Zernio → Lambda → SQS → agent → DynamoDB → AppSync), each taking an orange highlight; agent inputs drop in from the left, its outputs and the OMDb check appear to its right. For privacy the map dims and the two promises come forward; then the TV grows back to full frame |
| S | 119–132.6 | An inbox for all your reccos; seasons… to snowy winter nights (voice ends ~128.3s) | Part two's TV grows into a TV in the room; the app cycles winter night, fall day, winter day, summer day, summer night, winter night with the matching room behind the TV (stills where there is new art, loops otherwise); the focused card lifts with each theme's focus outline (no separate ring); the logo fades in over the end |

Part one times above are real seconds on the new voiceover (vo-intro-v2.mp3, from 0.6s); part two starts 5.9s later than before (build VO at 67.0s). In `work/composition/src/build.mjs`, `T()` maps the original 1.25x authoring clock through a piecewise retime (`WA` anchors) onto this voiceover, and `R(seconds)` writes cues in real seconds. The build voiceover plays in full; the hackathon line runs over the big TV with its own caption, with no title card.

## Stand-ins

Links are made up (filmtok.cx, reelhub.cx); no real platforms are named. All shows are mock titles with generated posters, one per show: Two-Car Garage, Desk Nine, Back of House, Floor Thirteen, Second Summer, Snowbound, Sandfall: Part Two, Away Game, Room 104, Couch Time, The Third-Floor Mystery, The Fog House, The Will Reading. Ratings use a plain yellow rectangle and red circle, not the IMDb or Rotten Tomatoes marks (hackathon rule: no third-party trademarks).

All names (Jill, Steph, Dad, Mom, Sarah), the pairing code 48217 and the number (604) 555-0142 (a reserved 555 number from the design) are fictional. The hash shown for "number never stored" is illustrative.
