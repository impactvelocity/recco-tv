import type { TitleType } from "@recco/core";
import { cached, type Cache } from "./cache";
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
        const params: Record<string, string> = { s: query.title.trim() };
        if (query.year) params.y = query.year.slice(0, 4);
        if (query.type) params.type = query.type;
        const body = await get(params);
        let results = body.Response === "True" && Array.isArray(body.Search) ? body.Search.map(fromSearch) : [];
        if (results.length === 0) {
          // Word search misses some exact titles; the title endpoint catches them.
          const { s: title, ...rest } = params;
          const exact = await get({ ...rest, t: title! });
          if (exact.Response === "True") results = [fromTitle(exact)];
        }
        return results.filter((r): r is TitleCandidate => !!r && (r.type === "movie" || r.type === "series")).slice(0, 5);
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
  };
}

function toType(t: string | undefined): TitleType {
  return t === "movie" || t === "series" || t === "episode" ? t : "unknown";
}

function poster(p: string | undefined): string | undefined {
  return p && p !== "N/A" && p.startsWith("https://") ? p : undefined;
}
