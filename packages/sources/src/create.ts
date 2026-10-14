import { MemoryCache, type Cache } from "./cache";
import { createFixtureSources } from "./fixtures/sources";
import { createJinaReader } from "./jina";
import { createOmdb } from "./omdb";
import { createScrapeCreators, platformOf } from "./scrapecreators";
import type { PostReader, Sources } from "./types";

export interface SourcesEnv {
  OMDB_API_KEY?: string;
  SCRAPECREATORS_API_KEY?: string;
  JINA_API_KEY?: string;
}

/**
 * Real clients where a key is set, recorded fixtures where it is not, so a
 * fresh clone runs with no keys. `fixtures: true` forces fixtures everywhere.
 */
export function createSources(env: SourcesEnv, { fixtures = false, cache = new MemoryCache() as Cache } = {}): Sources & {
  live: { titles: boolean; posts: boolean; web: boolean };
} {
  const fake = createFixtureSources();
  const live = {
    titles: !fixtures && !!env.OMDB_API_KEY,
    posts: !fixtures && !!env.SCRAPECREATORS_API_KEY,
    web: !fixtures && !!env.JINA_API_KEY,
  };
  return {
    live,
    titles: live.titles ? createOmdb({ apiKey: env.OMDB_API_KEY!, cache }) : fake.titles,
    posts: routePosts({
      social: live.posts ? createScrapeCreators({ apiKey: env.SCRAPECREATORS_API_KEY!, cache }) : fake.posts,
      web: live.web ? createJinaReader({ apiKey: env.JINA_API_KEY!, cache }) : fake.posts,
    }),
  };
}

/** TikTok, Instagram and YouTube posts go to the social reader; every other link to the web reader. */
export function routePosts({ social, web }: { social: PostReader; web: PostReader }): PostReader {
  return { read: (url) => (platformOf(url) ? social : web).read(url) };
}
