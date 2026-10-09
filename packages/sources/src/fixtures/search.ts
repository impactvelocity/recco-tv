import { FIXTURE_POSTS, FIXTURE_TITLES, type FixturePost, type FixtureTitle } from "./titles";

/** Lower-case, drop accents, punctuation and a leading "the". */
export function titleKey(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^the /, "");
}

/**
 * Title search over the fixtures, shaped like OMDb's: exact matches first,
 * then titles that contain the guess (or that the guess contains). Up to five.
 */
export function searchFixtureTitles(guess: string): FixtureTitle[] {
  const key = titleKey(guess);
  if (!key) return [];
  const exact = FIXTURE_TITLES.filter((t) => titleKey(t.title) === key);
  const near =
    key.length < 4
      ? []
      : FIXTURE_TITLES.filter((t) => {
          const k = titleKey(t.title);
          return k !== key && (` ${k} `.includes(` ${key} `) || ` ${key} `.includes(` ${k} `));
        });
  return [...exact, ...near].slice(0, 5);
}

/** Every fixture title named anywhere in the text, in the order they appear. */
export function fixtureTitlesIn(text: string): FixtureTitle[] {
  const hay = ` ${titleKey(text)} `;
  const found: { at: number; title: FixtureTitle }[] = [];
  const seen = new Set<string>();
  for (const t of FIXTURE_TITLES) {
    const key = titleKey(t.title);
    const at = hay.indexOf(` ${key} `);
    if (at >= 0 && !seen.has(key)) {
      seen.add(key);
      found.push({ at, title: t });
    }
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.title);
}

export function findFixturePost(url: string): FixturePost | undefined {
  return FIXTURE_POSTS.find((p) => p.url === url);
}
