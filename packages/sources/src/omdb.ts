import type { TitleType } from "@recco/core";
import { cached, type Cache } from "./cache";
import { closeness, isCloseMatch, titleVariants } from "./title-match";
import type { FetchLike, TitleCandidate, TitleLookup, TitleQuery } from "./types";

/**
 * OMDb (https://www.omdbapi.com). Content is CC BY-NC: fine for the hackathon,
 * replace before any commercial use. The patron-only Poster API is not used;
 * a poster link is kept only when the title response includes one.
 */
export function createOmdb({
  apiKey,
  fetch: fetchImpl = fetch as unknown as FetchLike,
  cache,
  detailsFor = 3,
}: {
  apiKey: string;
  fetch?: FetchLike;
  cache?: Cache;
  /** How many top results get a details call (for the plot). */
  detailsFor?: number;
}): TitleLookup {
  const get = async (params: Record<string, string>) => {
    const qs = new URLSearchParams({ apikey: apiKey, ...params });
    const res = await fetchImpl(`https://www.omdbapi.com/?${qs}`);
    if (!res.ok) throw new Error(`OMDb HTTP ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  };

  const details = (imdbId: string) =>
    cached(cache, `omdb:title:${imdbId}`, async () => {
      const body = await get({ i: imdbId, plot: "short" });
      return body.Response === "True" ? fromTitle(body) : null;
    });

  return {
    details,
    async search(query: TitleQuery) {
      const key = `omdb:search:${query.title.trim().toLowerCase()}|${query.year ?? ""}|${query.type ?? ""}`;
      const found = await cached(cache, key, async () => {
        const filters: Record<string, string> = {};
        if (query.year) filters.y = query.year.slice(0, 4);
        if (query.type) filters.type = query.type;
        const byId = new Map<string, TitleCandidate>();
        const add = (c: TitleCandidate | null) => {
          if (c && (c.type === "movie" || c.type === "series") && !byId.has(c.imdbId)) byId.set(c.imdbId, c);
        };
        const hasClose = () => [...byId.values()].some((c) => isCloseMatch(query.title, c.title));

        // Try other spellings ("&" for "and", no punctuation) until one finds the title itself.
        for (const title of titleVariants(query.title)) {
          const body = await get({ ...filters, s: title });
          if (body.Response === "True" && Array.isArray(body.Search)) body.Search.forEach((r) => add(fromSearch(r)));
          if (hasClose()) break;
          // Word search misses some exact titles; the title endpoint catches them.
          const exact = await get({ ...filters, t: title });
          if (exact.Response === "True") add(fromTitle(exact));
          if (hasClose()) break;
        }
        // Closest first; OMDb's order breaks ties.
        return [...byId.values()]
          .map((c, i) => ({ c, i, score: isCloseMatch(query.title, c.title) ? 2 : closeness(query.title, c.title) }))
          .sort((a, b) => b.score - a.score || a.i - b.i)
          .map(({ c }) => c)
          .slice(0, 5);
      });
      // Plots for the leading candidates, so "Check these" can tell them apart.
      return Promise.all(
        found.map(async (c, i) => {
          if (i >= detailsFor || c.plot) return c;
          // A failed details call only costs the plot, never the match.
          const more = await details(c.imdbId).catch(() => null);
          return more ? { ...c, ...more } : c;
        }),
      );
    },
  };
}

function fromSearch(raw: unknown): TitleCandidate | null {
  const r = raw as Record<string, string>;
  if (!r?.imdbID || !r.Title) return null;
  return { imdbId: r.imdbID, title: r.Title, year: r.Year, type: toType(r.Type), posterUrl: poster(r.Poster) };
}

function fromTitle(r: Record<string, unknown>): TitleCandidate {
  const s = (k: string) => (typeof r[k] === "string" && r[k] !== "N/A" ? (r[k] as string) : undefined);
  return {
    imdbId: s("imdbID")!,
    title: s("Title")!,
    year: s("Year"),
    type: toType(s("Type")),
    plot: s("Plot"),
    posterUrl: poster(s("Poster")),
    imdbRating: s("imdbRating"),
    rtRating: rottenTomatoes(r.Ratings),
    runtime: s("Runtime"),
    genre: s("Genre")?.split(",")[0]?.trim() || undefined,
  };
}

function rottenTomatoes(ratings: unknown): string | undefined {
  if (!Array.isArray(ratings)) return undefined;
  const rt = ratings.find((x) => x?.Source === "Rotten Tomatoes");
  return typeof rt?.Value === "string" ? rt.Value : undefined;
}

function toType(t: string | undefined): TitleType {
  return t === "movie" || t === "series" || t === "episode" ? t : "unknown";
}

function poster(p: string | undefined): string | undefined {
  return p && p !== "N/A" && p.startsWith("https://") ? p : undefined;
}
