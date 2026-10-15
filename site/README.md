# Recco site

The landing page for Recco. Next.js 16 (App Router, Turbopack), Tailwind CSS 4, TypeScript. One static page.

```bash
pnpm dev:site
```

Runs on http://localhost:3100. `pnpm --filter site build` makes the production build.

## What's here

A light, editorial page (after runway.com) with dark cards for the TV and warm colour where it helps: hero, the film, five chapters that follow the film, "Why a text?", and the real app running on the Vega Virtual Device.

- `src/app/page.tsx`: the page, one component per section.
- `src/components/journey.tsx`: the five chapters, with a sticky chapter list on wide screens.
- `src/components/tv.tsx`: a browser rebuild of the Fire TV inbox. The real app is React Native for Vega and can't render here. Sizes are the design handoff's 1920×1080 px values (`docs/design/README.md`), scaled with container query units, so `u(30)` is the 30px card title at any width.
- `src/lib/content.ts`: links, TV themes and the inbox cards.
- `public/`: the logo, original mock posters, the winter-night room loop, one still from the film (the film itself is embedded from YouTube), your avatar (`brand/dylan.png`, from the BoardSeat site), the Vega Virtual Device recording in `public/demo/` (MP4 on the page, GIFs for linking), and the three diagrams from `docs/diagram/`.

Everything on the page is fictional: mock shows with original posters, made-up names and links, and the reserved 555 number. The app's real screenshots aren't used because they show studio posters and logos.
