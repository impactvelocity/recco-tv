# Handoff: Recco — Fire TV app

## Overview
Recco is a Fire TV app for a texted watchlist. Users text show titles, friends' recommendations, social links (TikTok/YouTube/IG) or notes to a Recco phone number. A backend resolves the titles, and the TV shows them as cards. The UI is built for ten-foot, D-pad-only use. There is no deep linking to other apps, so the call to action is a voice prompt ("Alexa, watch …").

## About the design files
The files in this bundle are **design references created in HTML**. They show the intended look and behavior; they are not production code to copy directly. Recreate them in the target environment (for example Fire TV web app/React, React Native for TV, or Android TV Compose), using that codebase's patterns. If no codebase exists yet, a React web app packaged for Fire TV is the closest match to these prototypes.

Open each `.dc.html` in a browser. Click a screen, then use the arrow keys, Enter, and Backspace/Esc to drive the remote navigation.

## Fidelity
**High-fidelity.** Colors, type, spacing, focus treatments and behavior are final. Build pixel-accurate on a 1920×1080 canvas. All px values below are at that canvas size.

## Files
- `Recco Style Guide.dc.html` — **start here.** Live tokens for all 7 themes (switch with the chips at the top), plus the type scale, shape/elevation, focus treatments and component specimens.
- `Recco TV v3.dc.html` — the main app: Inbox, Featured, the detail drawer, Settings, the stack list, themes, and working remote navigation. Shipped defaults: theme `fallDay`, overlay `vignette` at 100%, card layout `hero`, focus `lift`.
- `Recco Onboarding.dc.html` — pairing flow: waiting → code → connected → empty inbox.
- `assets/` — logo, the per-theme still images (fall, summer) and looping videos (all four seasons, day and night).

The prototypes also contain alternative treatments that are **not** the defaults. These are card layouts `thread/backdrop/stacked`, focus `ring/glow/fill/spotlight`, and the other overlay modes. Ignore them unless asked.

## Design tokens

### Theme model
A theme is a set of CSS custom properties on the app root, plus some JS values:

| Token | Role |
|---|---|
| `--canvas` | Solid app background; vignette color |
| `--surface` | Resting cards, tab track, gear, arrow buttons (~80% alpha) |
| `--surfaceSolid` | Focused card fill (72% alpha), always with `backdrop-filter: blur(24px)` |
| `--surface2` | Drawer and settings panels (96% alpha); focused buttons use this hex at 100% alpha |
| `--border` | 1px hairlines |
| `--accent`, `--accent2` | `accent2` is the highlight: badges, gear stroke, active dot, check, Watched pill |
| `--onAccent` | Text on `accent2` fills |
| `--text`, `--textB`, `--text2` | Primary, bright body, secondary/meta |
| `--tint`, `--textBubble` | Message bubble gradient and its text |
| `--chipBg`, `--chipBorder` | Accent chips |
| `--bgimg` + `video` | Still fallback image and looping mp4 |
| JS `focus` | Focus-ring color |
| JS `segOn`, `segOnFg`, `segOff` | Selected tab fill, selected tab text, unselected tab text |

### Themes
These are the exact values. The same list is in the `themes = { … }` object inside any of the `.dc.html` files.

| Key | canvas | surface (rgb) | focus | accent / accent2 | text / text2 | segOn → fg | media |
|---|---|---|---|---|---|---|---|
| `fallDay` (default) | #555740 | 41,54,45 | #F0B667 | #D3632D / #F0B667 | #FFF7E8 / #D5CFB9 | #F0B667 → #2A1A10 | fall-day.png + .mp4 |
| `fallNight` | #1D2929 | 18,28,30 | #E28A3B | #C8572F / #E28A3B | #FFF6E8 / #C4CAC0 | #E28A3B → #1D1410 | fall-night.png + .mp4 |
| `winterDay` | #71889B | 38,54,66 | #8CC8D8 | #516B7B / #8CC8D8 | #FFFDF8 / #D9E1E4 | #8CC8D8 → #263642 | winter-day.mp4 |
| `winterNight` | #152A43 | 13,28,43 | #8FBDE8 | #789ECC / #8FBDE8 | #F8FBFD / #BBCAD6 | #8FBDE8 → #10233A | winter-night.mp4 |
| `summerDay` | #5EA7B6 | 25,76,86 | #F2D34F | #D7683D / #F2D34F | #FFFDF7 / #D5ECEA | #D7683D → #FFFDF7 | summer-day.png + .mp4 |
| `summerNight` | #174D68 | 11,41,56 | #F0A64B | #83BCD4 / #F0A64B | #F8FCFC / #BDD9DF | #83BCD4 → #0B2938 | summer-night.png + .mp4 |
| `default` (Midnight blue) | #0E1218 | 14,18,24 | #3CC7F5 | #1A8CFF / #3CC7F5 | #FFFFFF / #9AA0A8 | #FFFFFF → #101114 | blue radial glow, no media |

Each surface rgb is used at alpha .8 for `surface`, .72 for `surfaceSolid` and .96 for `surface2`. Bubble tints (135° gradients):

| Theme | Tint |
|---|---|
| fallDay | `rgba(211,99,45,.42)` → `rgba(240,182,103,.22)` |
| fallNight | `rgba(200,87,47,.42)` → `rgba(226,138,59,.22)` |
| winterDay | `rgba(94,117,108,.55)` → `rgba(175,200,216,.3)` |
| winterNight | `rgba(120,158,204,.4)` → `rgba(175,201,232,.2)` |
| summerDay | `rgba(215,104,61,.5)` → `rgba(231,211,174,.25)` |
| summerNight | `rgba(131,188,212,.4)` → `rgba(31,91,114,.35)` |

### Background layers (bottom → top)
1. `--canvas` solid.
2. `--bgimg`, cover/center. This is the fallback while the video buffers.
3. `<video muted loop autoplay playsinline>` with `object-fit: cover`. Set `src` from code after the theme is known; never bind an unresolved template string.
4. Vignette at 100% opacity: `radial-gradient(ellipse 90% 90% at 50% 40%, transparent 30%, var(--canvas) 100%)`. Onboarding also adds a flat `--canvas` dim at 40% under the vignette.

### Typography
Use the system stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, sans-serif`. If SF isn't available on Fire TV, substitute a neutral grotesk such as Inter or Roboto Flex and keep the same sizes and weights.

| Role | Size / weight / tracking / line-height |
|---|---|
| Pairing digits | 150 / 700 |
| Onboarding display | 128 / 700 / -0.03em |
| Empty-state title | 84 / 700 / -0.03em |
| Featured title | 68 / 700 / -0.025em / 1 |
| Drawer title | 46 / 700 / -0.02em / 1.05 |
| Card title | 30 / 700 / -0.01em / 1.1 |
| Tabs | 26 / 600 |
| Synopsis | 26 / 400 / 1.5 |
| Card bubble | 24 / 400 / 1.3 |
| Button | 23 / 600 |
| Meta | 19 / 400, `--text2` |
| Chips | 15–16 / 600–700 |

### Shape, elevation, motion
- **Radius:** pill 999 · panel 28 · card 20 · bubble `18 18 18 4` (tail bottom-left) · button 14–16 · poster 14 (card) / 16 (drawer) / 20 (featured).
- **Shadows:**
  - poster: `0 16px 40px rgba(0,0,0,.45)`
  - focused card: `0 40px 90px rgba(0,0,0,.6)`
  - panel: `0 40px 120px rgba(0,0,0,.6)`
- **Blur:** surfaces 30px, focused card 24px, panels 40px, scrim behind drawer `rgba(0,0,0,.45)` + 12px.
- **Spacing:** 96px side margins; header at top 48–56; grid gap 28; card padding 18; drawer padding 48/52.
- **Motion:** `transform, box-shadow, background` over `.22s cubic-bezier(.2,.8,.2,1)`.

## Remote focus
There is no hover on TV; the focus state *is* hover. Exactly one element is focused at a time.

**Spatial navigation.** For an arrow press, consider focusables whose center lies in that direction. Pick the one with the lowest `axisDistance + 2.5 × offAxisDistance`.

**Focus treatments.** These are applied by element type:

| Element | Treatment |
|---|---|
| Inbox/stack card ("lift") | `scale(1.06)`, `outline: 4px solid focus` (offset 0), background `--surfaceSolid` + blur 24, shadow `0 40 90 rgba(0,0,0,.6)`, z-index 5 |
| Featured card | Same as a card, but **no scale** |
| Buttons, gear, back, Unstack, settings rows ("solid") | `outline: 3px solid focus` (offset 0), background = `--surface2` at alpha 1, no scale |
| Tab segment ("ring") | `outline: 4px solid focus`, offset 6px |

**Restoring styles.** Save and restore only the properties a treatment changes. Restoring everything clobbers state-driven styles such as the selected tab.

**Scrolling.** Keep the focused card inside the scroll viewport with 28px padding, so the scale and shadow are never clipped.

## Screens

### Home header (always visible)
- Logo: `assets/recco-logo.png` at 64px tall, left 96, top 50.
- Tabs: centered at top 48, order **Featured, Inbox**. The selected tab uses the `segOn` fill. The track uses `--surface` + 1px `--border`, padding 6. Each segment is 14/40 padding, 26/600.
- Settings gear: 60px circle at right 96, stroke `--accent2`.
- Focusing a tab switches the view. Down moves into the content.

### Inbox (default view)
- Layout: 3-column grid (`minmax(0,1fr)`), gap 28, starts at y≈168.
- Watched items sort to the end.
- **Single card** (557×414): padding 18, gap 20.
  - Left column, top to bottom: title; type · year (+ Watched pill in `--accent2`/`--onAccent`); the ratings line; the message bubble; the sender line.
  - The bubble stretches up to the ratings and fades out (mask over the last 44px) **only when the text overflows**.
  - Sender line: 24px avatar, name, `· time`. With 2+ recommenders, avatars overlap at −7px with a 2px canvas ring. Names read "A & B" for two, or "A, B +N" for three or more, with ellipsis truncation.
  - Right side: 252×378 poster.
- **Ratings line:** IMDb chip in `#F5C518` with `#111` text, then the value. Rotten Tomatoes uses a `#FA320A` circle with a `#1DB954` stem, then the %.
- **Stack card** (one link → many shows, e.g. "Top 5 Mind Benders"):
  - Same frame as a single card.
  - Under the title: a chip with the stack icon and "N shows", plus the source.
  - Right side: three 200×300 posters fanned at 0°, −7° and 10°, in their own stacking context (`isolation: isolate`).
  - Select opens a list of the stack's items with:
    - a 64px round back button
    - the title and the sender's name
    - an outlined "Unstack into Inbox" pill on the right
  - Unstacking inserts the items into the Inbox. Titles already in the Inbox merge as extra recommenders.

### Featured
- One recco at a time in a 1440px card (radius 28, padding 44): a 380×570 poster on the left; the right column has:
  - the title (68/700)
  - type · year · runtime · genre
  - the ratings line
  - the synopsis
  - a divider
  - the recommender (avatar, name/time, message)
  - the Alexa row
- Left/Right flips through items, wrapping around. Stacks are skipped.
- Arrow buttons: 84px circles in `--surface2`, 2px border, shadow, 38px chevrons.
- Dots: 16px each, inactive `rgba(255,255,255,.7)`, active = focus color.

### Detail drawer
- Panel: right side, 760×1032, 24px inset, `--surface2` with 40px blur, radius 28. The scrim behind it blurs the screen.
- Contents, top to bottom:
  1. Poster (200×300) beside the title (46), meta and ratings.
  2. Synopsis (26/1.5): the main content.
  3. 1px divider.
  4. Every recommender's message: 40px avatar, name · time, message at 22px.
  5. The Alexa row: `rgba(255,255,255,.06)` fill, no border; a 44px mic circle; "To watch, say" (19, `--text2`) above "“Alexa, watch {Title}”" (25/500).
  6. Buttons with icons: **Mark Watched** (check) · **Remove** (trash) · **Back** (chevron). Outlined, 23/600.
- Focus starts on Mark Watched.
- Back/Esc, or Left from the leftmost control, closes the drawer and refocuses the source card.

### Settings
- Same panel style as the drawer, 640px wide.
- Rows: Theme (Select cycles through themes) · Text reccos to (the Recco number) · Default view · Hide watched · Signed in as.

### Onboarding (see `Recco Onboarding.dc.html`)
Nothing is focusable until the Inbox; the TV advances on its own.
1. **Waiting:** logo at 120px, "Getting a code…", a 96px spinner (7px ring, `--accent2` top, 1s linear).
2. **Code:** "On your phone, text", then five digit boxes (170×210, radius 24, `--surface2`, 2px border, 150/700 digits), then "to **(604) 555-0142**", an explanation line, and a dark "Waiting for your text…" pill with a spinner. The code expires after 10 minutes and is replaced silently.
3. **Connected:** a 120px `--accent2` check circle to the left of "Connected" (128/700), then "to the phone ending 4821". Hold for ~2s, then go to the Inbox.
4. **Empty Inbox:**
   - Header with Settings focused.
   - Left: "Nothing to watch yet." (84), the number, and three how-it-works bullets.
   - Right: a "Try one of these" panel with example texts as bubbles (title only, title + friend, a link, a note).

## State
- `theme`
- `view` (`featured` | `inbox`)
- `focusedId`
- `detailId`
- `settingsOpen`
- `stackOpenId`
- `featuredIndex`
- `watched{}`
- `removed{}`
- `recs[]`, where each rec is:
  - `{ id, title, type, year, runtime, genre, imdb, rt, synopsis, poster, from, source: friend|link|note, message, time }`
  - `also[]` for extra recommenders
  - for stacks: `stack: true, items[]`

## Data
Prototypes call OMDb (`https://www.omdbapi.com/?t=<title>&type=series|movie&apikey=…`). From each response they read `Poster` (swap `_SX300` for `_SX600` for TV resolution), `Plot`, `imdbRating`, `Ratings[Source="Rotten Tomatoes"]`, `Year`, `Runtime`, and the first `Genre`. In production, do this lookup in the backend when the text arrives, and keep the API key off the client.

## Assets
- `assets/recco-logo.png`: the brand script wordmark (white, transparent).
- Season backgrounds were supplied by the client:
  - `fall-day.png/.mp4`
  - `fall-night.png/.mp4`
  - `winter-day.mp4`
  - `winter-night.mp4`
  - `summer-day.png/.mp4`
  - `summer-night.png/.mp4`
- Icons are simple 24px stroke icons (2px stroke, round caps): mic, check, trash, chevron, gear, stack. Use the codebase's icon set.
- Posters come from OMDb at runtime.

---

*Copied into the repo on 2026-10-13. The `.dc.html` prototypes reference `assets/`, which is not checked in (about 90 MB, mostly video). The stills the app uses are in `apps/tv/assets/backgrounds/`; see `docs/decisions.md` (2026-10-13).*
