import { describe, expect, it } from "vitest";
import { MemoryCache, SEVEN_DAYS_MS } from "./cache";
import * as R from "./fixtures/api/recorded";
import { createOmdb } from "./omdb";
import { createScrapeCreators, platformOf, vttToText } from "./scrapecreators";
import { createStreamingAvailability, servicesFrom } from "./streaming-availability";
import type { FetchLike } from "./types";

/** A fake fetch that answers by URL and records calls. */
function fakeFetch(routes: [RegExp, unknown | ((url: string) => { status: number; body: unknown })][]) {
  const calls: { url: string; headers?: Record<string, string> }[] = [];
  const fetch: FetchLike = async (url, init) => {
    calls.push({ url, headers: init?.headers });
    const route = routes.find(([re]) => re.test(url));
    if (!route) return { ok: false, status: 404, json: async () => ({}) };
    const answer = typeof route[1] === "function" ? (route[1] as (u: string) => { status: number; body: unknown })(url) : { status: 200, body: route[1] };
    return { ok: answer.status < 400, status: answer.status, json: async () => answer.body };
  };
  return { fetch, calls };
}

describe("OMDb", () => {
  const routes: [RegExp, unknown][] = [
    [/[?&]s=The\+Office/, R.OMDB_SEARCH_OFFICE],
    [/[?&]i=tt0386676/, R.OMDB_TITLE_OFFICE_US],
    [/[?&]i=tt0290978/, R.OMDB_TITLE_OFFICE_UK],
    [/[?&]s=Nothing/, R.OMDB_NOT_FOUND],
    [/[?&]t=Nothing/, R.OMDB_NOT_FOUND],
  ];

  it("returns movies and series only, with plots for the leaders and no 'N/A' posters", async () => {
    const { fetch } = fakeFetch(routes);
    const omdb = createOmdb({ apiKey: "k", fetch, detailsFor: 2 });
    const found = await omdb.search({ title: "The Office" });
    expect(found.map((c) => [c.imdbId, c.type])).toEqual([
      ["tt0386676", "series"],
      ["tt0290978", "series"],
      ["tt1711525", "movie"],
    ]);
    expect(found[0]).toMatchObject({ plot: "A mockumentary on a group of typical office workers.", posterUrl: expect.stringMatching(/^https:/) });
    expect(found[1]?.posterUrl).toBeUndefined();
    expect(found[2]?.plot).toBeUndefined();
  });

  it("falls back to the exact-title endpoint, and returns nothing when nothing matches", async () => {
    const { fetch, calls } = fakeFetch(routes);
    expect(await createOmdb({ apiKey: "k", fetch }).search({ title: "Nothing" })).toEqual([]);
    expect(calls.map((c) => new URL(c.url).searchParams.has("t"))).toEqual([false, true]);
    expect(calls.every((c) => !new URL(c.url).searchParams.has("s") || !new URL(c.url).searchParams.has("t"))).toBe(true);
  });

  it("caches searches and titles for seven days", async () => {
    let now = 0;
    const cache = new MemoryCache(() => now);
    const { fetch, calls } = fakeFetch(routes);
    const omdb = createOmdb({ apiKey: "k", fetch, cache, detailsFor: 2 });
    await omdb.search({ title: "The Office" });
    const first = calls.length;
    await omdb.search({ title: "The Office" });
    expect(calls.length).toBe(first);
    now = SEVEN_DAYS_MS + 1;
    await omdb.search({ title: "The Office" });
    expect(calls.length).toBeGreaterThan(first);
  });
});

describe("Streaming Availability", () => {
  it("lists services that carry the title, once each, ignoring rent/buy and deep links", () => {
    expect(servicesFrom(R.SA_SHOW_CA, "ca")).toEqual(["Prime Video", "Crave", "Tubi"]);
    expect(servicesFrom(R.SA_SHOW_CA, "us")).toEqual([]);
    expect(servicesFrom(null, "ca")).toEqual([]);
  });

  it("calls RapidAPI with the IMDb id and country, and treats 404 as no services", async () => {
    const { fetch, calls } = fakeFetch([
      [/shows\/tt0386676/, R.SA_SHOW_CA],
      [/shows\/tt0000001/, () => ({ status: 404, body: {} })],
    ]);
    const sa = createStreamingAvailability({ apiKey: "k", fetch });
    expect(await sa.services("tt0386676", "ca")).toEqual(["Prime Video", "Crave", "Tubi"]);
    expect(await sa.services("tt0000001", "ca")).toEqual([]);
    expect(calls[0]?.url).toBe("https://streaming-availability.p.rapidapi.com/shows/tt0386676?country=ca&series_granularity=show");
    expect(calls[0]?.headers).toMatchObject({ "X-RapidAPI-Key": "k" });
  });

  it("throws on server errors so the caller can save the card with no services (R5.3)", async () => {
    const { fetch } = fakeFetch([[/shows/, () => ({ status: 500, body: {} })]]);
    await expect(createStreamingAvailability({ apiKey: "k", fetch }).services("tt1", "ca")).rejects.toThrow();
  });
});

describe("ScrapeCreators", () => {
  const routes: [RegExp, unknown][] = [
    [/\/v2\/tiktok\/video\?/, R.SC_TIKTOK_VIDEO],
    [/\/v1\/tiktok\/video\/transcript/, R.SC_TIKTOK_TRANSCRIPT],
    [/\/v1\/instagram\/post/, R.SC_INSTAGRAM_POST],
    [/\/v2\/instagram\/media\/transcript/, R.SC_INSTAGRAM_TRANSCRIPT],
    [/\/v1\/youtube\/video\?/, R.SC_YOUTUBE_VIDEO],
    [/\/v1\/youtube\/video\/transcript/, R.SC_YOUTUBE_TRANSCRIPT],
  ];

  it("reads a TikTok caption and transcript", async () => {
    const { fetch, calls } = fakeFetch(routes);
    const post = await createScrapeCreators({ apiKey: "k", fetch }).read("https://www.tiktok.com/@tvtok/video/1");
    expect(post).toEqual({
      url: "https://www.tiktok.com/@tvtok/video/1",
      platform: "tiktok",
      author: "tvtok",
      caption: "3 shows to binge this weekend #tv",
      transcript: "Number one, Severance. Number two, The Bear.",
    });
    expect(calls[0]?.headers).toEqual({ "x-api-key": "k" });
  });

  it("reads Instagram and YouTube", async () => {
    const { fetch } = fakeFetch(routes);
    const sc = createScrapeCreators({ apiKey: "k", fetch });
    expect(await sc.read("https://www.instagram.com/reel/abc/")).toMatchObject({
      author: "filmgram",
      caption: "Past Lives (2023) wrecked me",
      transcript: "This one is about two friends.",
    });
    expect(await sc.read("https://youtu.be/xyz")).toMatchObject({
      author: "crimetv",
      caption: "Best crime shows\nSlow Horses and Fargo",
      transcript: "first slow horses then fargo the series",
    });
  });

  it("keeps the caption when the transcript fails", async () => {
    const { fetch } = fakeFetch([routes[0]!, [/transcript/, () => ({ status: 500, body: {} })]]);
    const post = await createScrapeCreators({ apiKey: "k", fetch }).read("https://vm.tiktok.com/ZMabc/");
    expect(post).toMatchObject({ caption: "3 shows to binge this weekend #tv", transcript: "" });
  });

  it("returns null for links it cannot read", async () => {
    const { fetch, calls } = fakeFetch(routes);
    expect(await createScrapeCreators({ apiKey: "k", fetch }).read("https://example.com/x")).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it("knows the platforms", () => {
    expect(platformOf("https://vm.tiktok.com/ZM1/")).toBe("tiktok");
    expect(platformOf("https://m.youtube.com/watch?v=1")).toBe("youtube");
    expect(platformOf("https://instagram.com/p/1")).toBe("instagram");
    expect(platformOf("not a url")).toBeNull();
  });

  it("turns WEBVTT into plain words", () => {
    expect(vttToText("WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nHello\n\n2\n00:00:01.000 --> 00:00:02.000\nthere")).toBe("Hello there");
  });
});
