# Demo script

Task 6.5. Under three minutes. Female voiceover, first person: she is the person who uses Recco. About 320 words of voiceover: about 2:10 at 150 words a minute, which leaves room for pauses while the demo plays.

Recording notes are at the end, along with the sources for every number said out loud.

---

## 1. The ritual (0:00–0:20)

**Screen:** Evening, warm lamp light. Kettle clicks off. Tea poured into a big mug. A bowl of popcorn. A blanket. The dog jumps up and settles on her lap. Remote in hand. The TV glows.

> **VO:** Nine o'clock. This hour is mine.
> Hot tea, a good snack, and my dog.

## 2. The problem (0:20–0:50)

**Screen:** She browses rows of tiles on a generic streaming screen. A small clock in the corner ticks forward. She sighs and picks up her phone. Phone glow on her face. A generic, unbranded feed scrolls. The clock jumps: 9:04, 9:22, 9:41.

**Lower third:** *10.5 minutes to choose. 1 in 5 give up. (Nielsen, 2023)*

> **VO:** Then ten minutes of deciding what to watch. That's average. One in five people just give up.
> So I grab my phone to find that show a friend mentioned... and I'm gone.
> Forty minutes later, I feel worse, and there's no time left for an episode. So I keep scrolling.

## 3. Why it matters (0:50–1:08)

**Screen:** Split screen. Left: her face lit by the phone, flat. Right: her on the couch laughing at the TV, tea in hand.

**Lower third:** *Friends are the #1 way people find new shows. (TiVo, 2025)*

> **VO:** Twenty minutes of scrolling can leave you in a worse mood. A good show does the opposite.
> My best shows came from friends, not an algorithm.
> But their picks get lost in dinners, group chats, and videos.

## 4. Meet Recco (1:08–1:15)

**Screen:** Recco mark on the seasonal background.

> **VO:** So, Recco. An inbox of things to watch, on my TV.

## 5. Pairing (1:15–1:27)

**Screen (Vega Virtual Device or Fire TV):** Pairing screen: "Text 48213 to (604) 555-0142". Cut to her phone sending the code. TV changes to "Connected to the phone ending 1234".

> **VO:** The TV shows a code. I text it. Connected. No app, no account, no password.

## 6. Capture in the wild (1:27–1:55)

**Screen:** Her phone at a restaurant table: *"[sitcom] - Jordan said it was hilarious"*. Hard cut to the TV: a card arrives under Jordan, with the note. Then she texts a video link and *"Steph sent this"*. Three cards arrive together under Steph. One card shows "Check these" with three candidates; she picks the right one with the remote.

> **VO:** Someone recommends a show, I text it, and forget it.
> Jordan says a sitcom is hilarious. It's on my TV before my phone is down, in her words.
> Steph sends a video naming three shows. One link, three cards.
> If Recco isn't sure, I pick with the remote.

## 7. Sitting down (1:55–2:17)

**Screen:** Back on the couch, tea, dog. The Featured view cycles slowly. She moves to the Inbox grid, focuses a card, opens the drawer: *To watch, say "Alexa, watch …"*. She says it. Cut away as the show begins. Later: she opens the drawer and picks **Mark watched**; the card moves to the end.

> **VO:** Tonight, it's all waiting: every show, who sent it, and why.
> *(her voice, live)* "Alexa, watch …"
> My phone stays in the other room.

## 8. How it's built (2:17–2:40)

**Screen:** Animated diagram, one box lighting up at a time: text → SNS → SQS → Lambda → agent on AgentCore → title lookup → DynamoDB → AppSync Events → Vega app.

> **VO:** Behind the screen, SNS and SQS queue my text, and Lambda hands it to the Recco agent on Bedrock AgentCore.
> It finds the show, the friend and the note, and checks a real catalog, so it never invents a title.
> DynamoDB keeps the record. AppSync Events pushes the card to the Vega app.

## 9. Trust and shipping (2:40–2:50)

**Screen:** Settings, "Forget me" with its confirm step. Then back to the inbox.

> **VO:** First names only. Text "forget me" and it's all gone.
> To ship, Recco needs one thing: a real two-way number.

## 10. Close (2:50–3:00)

**Screen:** Wide shot. Couch, blanket, dog asleep, tea steaming, a show playing. Recco mark fades up.

> **VO:** A great show. Hot tea. A good snack.
> My hour, back.
> Recco.

---

## Recording notes

- **Read it slowly.** Warm, unhurried, a little wry in section 2. Let the demo moments breathe: a beat of silence when each card lands on the TV is worth more than another sentence. The screen does the explaining (the Alexa line in the drawer, Mark watched), so the voiceover doesn't.
- **Over time?** Cut in this order: section 4 (go straight from section 3 into pairing), then the second line of section 8.
- **Third-party marks.** The rules ban third-party trademarks, music, images and text without permission. Use a made-up streaming screen and a made-up social feed in section 2, and say "a video" rather than naming the app. Show titles, posters and service names are still an open office-hours question (see `RECCO_PLAN.md`). Until it's answered, the script never names a show out loud, and on-screen cards should use the text-only title card. Music must be licensed or original.
- **Lower-third sources.** The Nielsen and TiVo lower thirds name a third-party source. If that feels risky, drop the source from the screen and put it in the Devpost description, or say "industry research found" in the voiceover.
- **Section 9 depends on unbuilt work.** "Forget me" is tasks 5.6–5.8, and the real two-way number is task 4.4. If "forget me" isn't built when you record, cut the first line of section 9.
- **The Alexa moment.** Whether the Alexa "watch" hand-off works from inside a third-party app on Vega and on the virtual device is still open (task 5.4). If it doesn't work on the device you record on, show the drawer line and cut to the couch without the live voice command.
- **The demo must run on a real Fire TV or the Vega Virtual Device.** Sections 5–7 and 9 have to be screen captures of the app, not mockups.

## Sources

Every number said out loud, and where it comes from. Check each one again against the original before the video is published.

| Claim in the script | Source |
|---|---|
| 10.5 minutes per session deciding what to watch | Nielsen, *State of Play* 2023, via [CBS News](https://www.cbsnews.com/amp/losangeles/news/study-finds-the-many-streaming-choices-overwhelm-audiences-steering-some-to-turn-the-tv-off) and [Marketing Brew](https://marketingbrew.com/stories/2023/08/28/streaming-s-big-pain-point-there-s-too-much-stuff-to-watch) |
| 1 in 5 give up | Nielsen's June 2023 consumer survey, same coverage as above |
| Twenty minutes of scrolling can leave you in a worse mood | Sagioglou & Greitemeyer, *Computers in Human Behavior*, 2014, via [Pacific Standard](https://psmag.com/social-justice/enjoy-life-use-facebook-less-78515/) |
| Friends are the #1 way people find new shows | TiVo report, October 2025: 49.3% hear about new shows from friends (seen in search results only; find the original report). Backed up by [YouGov US](https://yougov.com/en-us/articles/53847-how-americans-discover-new-tv-shows) (58% of men, 63% of women) and [YouGov global](https://business.yougov.com/content/46628-global-word-of-mouth-is-the-best-way-to-get-consumers-to-watch-new-tv-shows-and-movies) (58% across 18 markets) |

Useful, but not in the script:

- People estimate they lose three days a month to scrolling: [Talker Research, 2024](https://fox35orlando.com/news/talker-research-media-consumption-report-2024). It's a self-estimate, not a measurement.
- 30% of US consumers say choosing what to watch often takes longer than watching it: Bango, May 2026, via [NewscastStudio](https://www.newscaststudio.com/2026/05/20/u-s-viewers-report-growing-frustration-with-streaming-content-overload/).
- Moms average about 1 hour 7 minutes of personal time a day: Welch's survey, 2018, via [Motherly](https://www.mother.ly/news/survey-says-moms-only-get-30-minutes-of-me-time-per-day). It's an old survey from a brand.
- Passive scrolling lowers mood through envy: Verduyn et al., 2015, via [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4710707).

Nothing found: a "happiness score" comparing doomscrolling with a good show, or a statistic on how people feel after a bad show. The script makes those points without numbers.
