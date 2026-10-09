import type { Sources, TitleCandidate } from "../types";
import { findFixturePost, searchFixtureTitles } from "./search";
import { FIXTURE_TITLES, type FixtureTitle } from "./titles";

const toCandidate = (t: FixtureTitle): TitleCandidate => ({
  imdbId: t.imdbId,
  title: t.title,
  year: t.year,
  type: t.type,
  plot: t.plot,
});

/** Recorded titles, availability and posts. Used for MOCK_AGENT=1, tests, and the eval. */
export function createFixtureSources(): Sources {
  return {
    titles: {
      async search({ title, year, type }) {
        return searchFixtureTitles(title)
          .filter((t) => (!type || t.type === type) && (!year || (t.year ?? "").startsWith(year.slice(0, 4))))
          .map(toCandidate);
      },
      async details(imdbId) {
        const t = FIXTURE_TITLES.find((f) => f.imdbId === imdbId);
        return t ? toCandidate(t) : null;
      },
    },
    availability: {
      async services(imdbId) {
        return FIXTURE_TITLES.find((f) => f.imdbId === imdbId)?.services ?? [];
      },
    },
    posts: {
      async read(url) {
        const p = findFixturePost(url);
        if (!p) return null;
        const platform = p.url.includes("tiktok") ? "tiktok" : p.url.includes("instagram") ? "instagram" : "youtube";
        return { url: p.url, platform, author: p.author, caption: p.caption, transcript: p.transcript };
      },
    },
  };
}
