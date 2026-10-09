# Fire TV app

React Native for Vega (RN 0.72 template), npm, Node 22. Talks only to `services/api`.

```bash
npm install
npm run build:debug
vega run-app build/aarch64-debug/tv_aarch64.vpkg
```

From the Vega Virtual Device, the local API is at `http://10.0.2.2:8787` (the default). Override with `RECCO_API_BASE=… npm run build:debug`. `POSTERS=off npm run build:debug` renders text-only cards.

| Path | What |
|---|---|
| `src/App.tsx` | Navigation: Pairing, or Inbox / Card / Settings |
| `src/state/InboxContext.tsx` | Device token, inbox, polling, offline copy, card updates |
| `src/screens/` | One file per screen |
| `src/components/` | Title card, rows, hero, buttons, placeholder |
| `src/lib/` | API client, storage, formatting, focus helper, debug log |

Row building, card states and the track record come from `packages/core` (Metro alias `@recco/core-shared`).
