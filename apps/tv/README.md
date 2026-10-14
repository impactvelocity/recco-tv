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
| `src/App.tsx` | Navigation: Pairing, or Home |
| `src/state/InboxContext.tsx` | Device token, inbox, polling, offline copy, card updates |
| `src/state/PrefsContext.tsx` | Theme, default view and "Hide watched", saved on the TV |
| `src/theme.ts` | The seven themes and the type scale from `docs/design/` |
| `src/screens/` | Pairing and Home, plus the detail drawer and settings panels |
| `src/components/` | Header, Featured, the inbox grid and tiles, card parts, buttons, background |
| `assets/` | Logo, theme stills and vignettes (built from the design handoff's assets) |
| `src/lib/` | API client, storage, formatting, focus helper, debug log |

Inbox grouping (`buildInbox`) and card states come from `packages/core` (Metro alias `@recco/core-shared`).
