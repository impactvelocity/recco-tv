---
workflow: general-video
flow: automation
storyboard: no
message: "Text Recco any show; it's waiting on your Fire TV when it's your time."
destination: youtube
aspect: 1920x1080
language: en
length: ~104s
angle: story-then-architecture
---

## Intent

Hackathon (Build, Ship, Shape) demo video for Recco, the Fire TV watch inbox. Part one is the
evening story (user's script, verbatim VO); part two is how it's built (user's second VO, verbatim).
Clean, cozy, and it must show the real app screens from the Claude Design file `Recco TV v3.dc.html`.

## Assets

- ~/Downloads/recco-intro-voi.mp3 → assets/audio/vo-intro.mp3 — story VO, sped to 1.25x (atempo).
- ~/Downloads/recco-built.mp3 → assets/audio/vo-built.mp3 — build VO, sped to 1.25x.
- docs/design/Recco TV v3.dc.html + Recco Onboarding.dc.html — UI markup and theme tokens, rebuilt as HTML.
- apps/tv/assets/raw/*.mp4, backgrounds/*.jpg, recco-logo.png — season backgrounds and logo.
- assets/posters/*.jpg — mock posters from docs/diagram/posters (two-car-garage, desk-nine, …). The older OMDb posters are still in the folder but no longer used.

## Notes

- VO is verbatim; no music bed (offer it).
- Fonts: Inter (the design's documented SF substitute) for UI, Fraunces for narration lines.
- `src/build.mjs` generates `index.html`; edit the script, then `node src/build.mjs`.
