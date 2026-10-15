## Inspiration

![Demo of Recco on Fire TV](https://recco.dev/demo/recco-tv-demo-small.gif)

My wife loves a good show. She looks forward to it all day. But when she sits down and can't find something in the first ten minutes, she gets overwhelmed. Her friends have told her about plenty of good shows; those recommendations are just stuck in DMs, text threads and half-remembered conversations. So she picks up her phone to find them, and once she's on her phone, she stays on her phone. Her time with a good show and a cup of tea turns into doom scrolling with the TV on mute.

She's not alone. Nielsen's State of Play report found that people spend about 10.5 minutes deciding what to watch each time they sit down, up from about 7 minutes a few years earlier, and about one in five give up and do something else. Surveys from YouGov keep finding that friends and family are the top way people discover new shows (around 6 in 10 streamers, a little higher for women). And close to half of US adults say they reach for a second screen very often or always while the TV is on.

So the best recommendations come from the people she trusts, they arrive when she isn't anywhere near the TV, and when she finally is at the TV, the phone pulls her away.

She didn't want to download another app. A text message was the easiest way for her to capture a recommendation while she's out with friends and family: she can share a link, write a note, or text a half-formed idea. Recco gives her the freedom to just capture. When she sits down, her own inbox is already on the TV, organized and filled in, and she can tell Alexa which one she wants to watch.

## What it does

Recco is an inbox of things to watch, on Fire TV.

![Recco on Fire TV: the inbox of shows, who sent each one, and what they said](https://recco.dev/screenshots/inbox.jpg)

1. **Text it.** Send a show, a link, or a thought to one phone number. "King of Queens - Jordan said it was funny." A TikTok link with "Steph sent this." Just "Severance." There's no app, and Recco never texts back.
2. **It sorts itself out.** An AI agent works out which show you mean, who recommended it, and what they said. It reads links (TikTok, Instagram, YouTube, IMDb and Letterboxd lists, any article), looks every title up, and keeps your note in your own words.
3. **Sit down and pick.** The TV already has the list: poster, ratings, who sent it and why. Pick one and Recco tells you the line to say: *"Alexa, watch Severance."*

![Featured view: one show at a time, with the line to say to Alexa](https://recco.dev/screenshots/featured.jpg)

A tile shows up on the TV within a second of a text arriving, and fills in with the finished card a few seconds later. Some of what it handles:

| You text | You get |
|---|---|
| `King of Queens - Jordan said it was funny` | A card under Jordan, with that note |
| `Severance` | A card under "From me" |
| A TikTok link + `Steph sent this` | One card for each show the post mentions, stacked, under Steph |
| An IMDb list + `Top 5 for thanksgiving` | A named stack, "Thanksgiving Movie Night" |
| `the office` | A "Which one?" card with the US and UK versions |
| `movies for a stormy night` | A stack of ideas under "Recco's picks" |
| `zzzz` | An unsorted note with your words. Recco never invents a title. |

On the TV there's a Featured view (one big show at a time) and an Inbox grid. Shows sent by more than one person merge into one tile ("Steph & Dad"), and every card opens a drawer with the synopsis, ratings, everyone's messages, Mark Watched and Remove. Pairing takes one text: the TV shows a five-digit code, she texts it, and the TV says "Connected to the phone ending 1234." The background is a quiet looping scene that changes with the season and time of day.

![Detail drawer: synopsis, who sent it, the Alexa line, Watched and Remove](https://recco.dev/screenshots/detail.jpg)

## How I built it

![How Recco works](https://recco.dev/diagrams/how-recco-works.jpg)

- **TV app:** React Native for Vega, built and tested on the Vega Virtual Device. It only ever talks to my API, gets live updates over an AppSync Events WebSocket, keeps polling as a safety net, and starts from its last saved inbox when offline.
- **Texts in:** the SMS provider calls a signed webhook on the API (Hono on a Lambda function URL). The API publishes the text to SNS in the same shape AWS End User Messaging uses, so the rest of the pipeline doesn't care which provider sent it. SQS (with a dead-letter queue) hands it to an intake Lambda, which either pairs a TV or saves the text and puts a placeholder tile on the TV.
- **The agent:** built with the Vercel AI SDK and deployed to Amazon Bedrock AgentCore Runtime as a Node.js 22 code bundle, with no container. It has four tools: `read_post` (ScrapeCreators for TikTok, Instagram and YouTube, Jina Reader for everything else), `find_titles` (OMDb), `list_friends` and `save_cards`. It runs on Claude Haiku 5.5 through Vercel AI Gateway.
- **Guardrails in code, not in the prompt:** `save_cards` is plain code. It throws away any title the lookup didn't return in that run, only accepts friend names that appear in the text, and only reads links she actually sent. Texts and posts are treated as untrusted data.
- **Storage and infra:** one DynamoDB table (each household's friends, cards and texts in one partition, so the inbox is a single query), Secrets Manager, S3, CloudWatch, all defined in CDK.
- **Product rules** live in a pure TypeScript package with tests, and the whole thing runs locally with no AWS account (`pnpm dev:local`, `pnpm text "Severance"`).
- **Kiro** for the spec: requirements, design and a task list I worked through checkpoint by checkpoint.

![Inside the Recco agent](https://recco.dev/diagrams/recco-agent-flow.jpg)

## Challenges I ran into

- **Bedrock on a new AWS account.** New accounts can get Bedrock quotas well below the published defaults, and increases aren't automatic, so calls were unreliable right when I needed them. I moved the model to Vercel AI Gateway and kept the agent on AgentCore Runtime. Switching back to Bedrock is one function.
- **Making the agent "just work."** People don't text clean titles. They text "that show with the guy in the bunker", "SLOW HORSES!!! from jordan", "Fargo, the movie not the show", a TikTok that mentions three shows, or a link with no words at all. I wanted any combination of text, a search-style description, a link, a friend's name and a note to land as the right cards, under the right person, with her words kept. I built a test set of 25 real-shaped texts and links (including prompt injections hidden in texts and posts) and ran 14 models against it before picking one.
- **Texts that arrive in pieces.** A link and the comment about it usually come in as two separate texts a second apart, and phones split long messages. Each text flows through SNS and SQS on its own, so I had to stitch them back together: the agent waits until that household's texts go quiet for five seconds, then the oldest text claims the rest and reads them as one message. A link plus "Steph says the second one is the best" becomes one set of cards with Steph's note, not a card from the internet and an unsorted note.
- **Keeping it fast while waiting.** That five-second wait makes the TV sit on a placeholder longer, so the placeholder became a typing bubble with steps ("Reading your text…", "Looking it up…", "Finding the poster…") so it feels alive instead of stuck.
- **No deep links into streaming apps.** I wanted picking a show to open it straight in the app that has it. Amazon's Appstore policy only allows deep links between associated apps, so Recco can't send her into another company's player. Instead, the TV shows the line to say: *"Alexa, watch Severance."* That turned out to be the better experience. Alexa already knows how to find a show across the apps on her TV, it's one sentence instead of another menu, and it keeps her on the couch with the remote down, which was the point all along.
- **Fire TV development without a device.** The Vega Virtual Device has no CLI screenshot or JS console access, reinstalling the app wipes its storage, and playing a bundled video file wasn't documented. I logged each of these in the friction log.

## Accomplishments that I'm proud of

- It feels like magic in the room: text a show, and it's on the TV before you put your phone down. Measured on AWS, the placeholder tile appears in about 0.75 seconds, a finished card from plain text in 4 to 6 seconds, and a card from a link that has to be read live in about 10 seconds. The inbox loads in about 100 ms at p95.
- The agent scores 25 out of 25 on the test set, including misspellings, ambiguous titles and prompt injections, and it never makes up a title.
- No app to download, no account to create, no reply texts. Capture is a text message, and everything else happens on the TV with the remote and her voice.
- The whole stack is in CDK, and the whole product also runs locally with no AWS account.

![The app's stages, from pairing to a finished inbox](https://recco.dev/diagrams/app-stages.jpg)

## What I learned

- The best interface for capture is the one people already use. Nobody has to learn how to send a text.
- Put the rules that matter in code. The model is great at reading messy human messages, but the checks that keep it honest (real titles only, real friend names only) work better as plain functions than as instructions in a prompt.
- Test models on your own data. On my test set, smaller, cheaper models were often as accurate as bigger ones, and some well-known models struggled with misremembered titles.
- Design for the moment, not the feature list. The real goal was protecting a quiet hour on the couch, which is why Recco never texts back and the hand-off is a line to say to Alexa instead of another screen.

## What's next for Recco.dev

- **Get it on my wife's real Fire TV,** and test the Alexa line across the major streaming services.
- **Move texting to AWS End User Messaging,** so the whole path from text to TV runs on AWS.
- **"Forget me":** text one command to delete a household and everything in it.
- **Real progress on the placeholder,** sent by the agent as it works, instead of timed steps.
- **Shared inboxes,** so a couple or a family can text into the same list, and friends can see which of their picks got watched.
- **Back to Bedrock** once the account quota comes through.

Watch the demo: https://www.youtube.com/watch?v=J1pppa0i8ds · Code: https://github.com/impactvelocity/recco-tv
