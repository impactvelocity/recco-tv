# Recco site

The landing page for Recco. Next.js 16 (App Router, Turbopack), Tailwind CSS 4, TypeScript. One static page.

```bash
pnpm dev:site
```

Runs on http://localhost:3100. `pnpm --filter site build` makes the production build.

## What's here

- `src/app/page.tsx`: the page, one component per section.
- `src/components/tv.tsx`: a browser rebuild of the Fire TV inbox (header, cards, stacks, placeholder). The real app is React Native for Vega and can't render here. Sizes are the design handoff's 1920×1080 px values (`docs/design/README.md`), scaled with container query units, so `u(30)` is the 30px card title at any width.
- `src/lib/content.ts`: copy and data: themes, inbox cards, examples, the pipeline, measured numbers.
- `public/`: the logo, original mock posters and season backgrounds from the demo film, the film's poster frame (the film itself is on YouTube and loads on click), the demo GIFs in `public/demo/`, and the three diagrams from `docs/diagram/`.

Everything on the page is fictional: mock shows with original posters, made-up names and links, and the reserved 555 number. The app's real screenshots aren't used because they show studio posters and logos.
