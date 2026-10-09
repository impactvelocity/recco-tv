import { MemoryCache, type Cache } from "./cache";
import { createFixtureSources } from "./fixtures/sources";
import { createOmdb } from "./omdb";
import { createScrapeCreators } from "./scrapecreators";
import { createStreamingAvailability } from "./streaming-availability";
import type { Sources } from "./types";

export interface SourcesEnv {
  OMDB_API_KEY?: string;
  STREAMING_AVAILABILITY_API_KEY?: string;
  /** "rapidapi" (default) or "direct". */
  STREAMING_AVAILABILITY_VIA?: string;
  SCRAPECREATORS_API_KEY?: string;
}

/**
 * Real clients where a key is set, recorded fixtures where it is not, so a
 * fresh clone runs with no keys. `fixtures: true` forces fixtures everywhere.
 */
export function createSources(env: SourcesEnv, { fixtures = false, cache = new MemoryCache() as Cache } = {}): Sources & {
  live: { titles: boolean; availability: boolean; posts: boolean };
} {
  const fake = createFixtureSources();
  const live = {
    titles: !fixtures && !!env.OMDB_API_KEY,
    availability: !fixtures && !!env.STREAMING_AVAILABILITY_API_KEY,
    posts: !fixtures && !!env.SCRAPECREATORS_API_KEY,
  };
  return {
    live,
    titles: live.titles ? createOmdb({ apiKey: env.OMDB_API_KEY!, cache }) : fake.titles,
    availability: live.availability
      ? createStreamingAvailability({
          apiKey: env.STREAMING_AVAILABILITY_API_KEY!,
          via: env.STREAMING_AVAILABILITY_VIA === "direct" ? "direct" : "rapidapi",
          cache,
        })
      : fake.availability,
    posts: live.posts ? createScrapeCreators({ apiKey: env.SCRAPECREATORS_API_KEY!, cache }) : fake.posts,
  };
}
