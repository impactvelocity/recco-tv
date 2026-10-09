import { cached, type Cache } from "./cache";
import type { AvailabilityLookup, FetchLike } from "./types";

/** Option types that mean "you can watch it there with what you have". Rent and buy are left out. */
const CARRIES = new Set(["subscription", "free", "addon"]);

/**
 * Streaming Availability API v4 (Movie of the Night). Looked up by IMDb id for
 * the household's country. Only the list of services is used; its deep links
 * are ignored (Recco never deep-links into another app).
 */
export function createStreamingAvailability({
  apiKey,
  via = "rapidapi",
  fetch: fetchImpl = fetch as unknown as FetchLike,
  cache,
}: {
  apiKey: string;
  /** "rapidapi" for a RapidAPI key, "direct" for a developers.movieofthenight.com key. */
  via?: "rapidapi" | "direct";
  fetch?: FetchLike;
  cache?: Cache;
}): AvailabilityLookup {
  const base = via === "rapidapi" ? "https://streaming-availability.p.rapidapi.com" : "https://api.movieofthenight.com/v4";
  const headers: Record<string, string> =
    via === "rapidapi"
      ? { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com" }
      : { "X-API-Key": apiKey };

  return {
    services: (imdbId, country) =>
      cached(cache, `sa:${imdbId}:${country}`, async () => {
        const res = await fetchImpl(`${base}/shows/${encodeURIComponent(imdbId)}?country=${country}&series_granularity=show`, {
          headers,
        });
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Streaming Availability HTTP ${res.status}`);
        return servicesFrom(await res.json(), country);
      }),
  };
}

export function servicesFrom(body: unknown, country: string): string[] {
  const options = (body as { streamingOptions?: Record<string, unknown[]> })?.streamingOptions?.[country.toLowerCase()];
  if (!Array.isArray(options)) return [];
  const names: string[] = [];
  for (const o of options as { type?: string; service?: { name?: string } }[]) {
    const name = o.service?.name;
    if (name && o.type && CARRIES.has(o.type) && !names.includes(name)) names.push(name);
  }
  return names;
}
