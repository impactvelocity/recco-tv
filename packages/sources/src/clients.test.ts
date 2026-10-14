import { describe, expect, it } from "vitest";
import { MemoryCache, SEVEN_DAYS_MS } from "./cache";
import * as R from "./fixtures/api/recorded";
import { routePosts } from "./create";
import { createJinaReader, mainText } from "./jina";
import { createOmdb } from "./omdb";
import { createScrapeCreators, platformOf, vttToText } from "./scrapecreators";
import type { FetchLike, PostReader } from "./types";

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
    expect(found[0]).toMatchObject({ imdbRating: "9.0", rtRating: "81%", runtime: "22 min", genre: "Comedy" });
    expect(found[1]).toMatchObject({ imdbRating: undefined, rtRating: undefined, runtime: undefined, genre: "Comedy" });
    expect(found[1]?.posterUrl).toBeUndefined();
    expect(found[2]?.plot).toBeUndefined();
  });

  it("falls back to the exact-title endpoint, and returns nothing when nothing matches", async () => {
    const { fetch, calls } = fakeFetch(routes);
    expect(await createOmdb({ apiKey: "k", fetch }).search({ title: "Nothing" })).toEqual([]);
    expect(calls.map((c) => new URL(c.url).searchParams.has("t"))).toEqual([false, true]);
    expect(calls.every((c) => !new URL(c.url).searchParams.has("s") || !new URL(c.url).searchParams.has("t"))).toBe(true);
  });

  it("tries '&' for 'and' when the search finds only clips, and ranks the real title first", async () => {
    const clip = { Title: "Con Air (1997) - Planes! Trains! And Automobiles!", Year: "1997", imdbID: "tt15838022", Type: "movie", Poster: "N/A" };
    const real = { Title: "Planes, Trains & Automobiles", Year: "1987", imdbID: "tt0093748", Type: "movie", Poster: "N/A" };
    const { fetch, calls } = fakeFetch([
      [/[?&]s=Planes%2C\+Trains\+and\+Automobiles/, { Response: "True", Search: [clip] }],
      [/[?&]t=Planes%2C\+Trains\+and\+Automobiles/, R.OMDB_NOT_FOUND],
      [/[?&]s=Planes%2C\+Trains\+%26\+Automobiles/, { Response: "True", Search: [clip, real] }],
      [/[?&]i=/, R.OMDB_NOT_FOUND],
    ]);
    const found = await createOmdb({ apiKey: "k", fetch }).search({ title: "Planes, Trains and Automobiles" });
    expect(found.map((c) => c.imdbId)).toEqual(["tt0093748", "tt15838022"]);
    // Stops once the title itself turns up: no plain-spelling search.
    expect(calls.filter((c) => /[?&][st]=/.test(c.url))).toHaveLength(3);
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

describe("Jina Reader", () => {
  const page = (data: Record<string, unknown>) => ({ code: 200, status: 20000, data });
  const LETTERBOXD = "https://letterboxd.com/film/planes-trains-and-automobiles/";

  it("reads a page's title, description and text, with the key as a bearer token", async () => {
    const { fetch, calls } = fakeFetch([
      [/r\.jina\.ai/, page({ title: "Planes, Trains and Automobiles (1987)", description: "Directed by John Hughes", content: "  Neal Page is heading home for Thanksgiving.  ", httpStatus: 200 })],
    ]);
    const post = await createJinaReader({ apiKey: "k", fetch }).read(LETTERBOXD);
    expect(post).toEqual({
      url: LETTERBOXD,
      platform: "web",
      caption: "Planes, Trains and Automobiles (1987)\nDirected by John Hughes",
      transcript: "Neal Page is heading home for Thanksgiving.",
    });
    expect(calls[0]?.url).toBe(`https://r.jina.ai/${LETTERBOXD}`);
    expect(calls[0]?.headers).toMatchObject({ Authorization: "Bearer k", Accept: "application/json" });
  });

  it("keeps a redirected page but drops a page that is gone", async () => {
    const reader = (httpStatus: number) =>
      createJinaReader({ apiKey: "k", fetch: fakeFetch([[/r\.jina\.ai/, page({ title: "T", content: "text", httpStatus })]]).fetch });
    expect(await reader(302).read("https://www.imdb.com/title/tt0093748/")).not.toBeNull();
    expect(await reader(404).read("https://example.com/gone")).toBeNull();
  });

  it("cuts long pages, skips links that are not web addresses, and fails on a Jina error", async () => {
    const { fetch, calls } = fakeFetch([
      [/long/, page({ title: "Long", content: "x".repeat(20_000) })],
      [/broken/, () => ({ status: 401, body: {} })],
    ]);
    const jina = createJinaReader({ apiKey: "k", fetch });
    expect((await jina.read("https://example.com/long"))?.transcript).toHaveLength(12_000);
    expect(await jina.read("ftp://example.com/file")).toBeNull();
    await expect(jina.read("https://example.com/broken")).rejects.toThrow("Jina Reader HTTP 401");
    expect(calls).toHaveLength(2);
  });
});

describe("mainText", () => {
  it("skips the site menu before the main heading and squeezes blank lines", () => {
    const menu = "Menu\n\nMovies\nTV shows\n\n\n\nSign in\n".repeat(3);
    const list = "#### 1. Planes, Trains & Automobiles\n".repeat(5).trim();
    expect(mainText(`${menu}# Thanksgiving Movies\n\n   \n\n\n${list}`)).toBe(`# Thanksgiving Movies\n\n${list}`);
    // No heading, or one deep in the page: keep everything.
    expect(mainText("Severance is a TV series.\n\n\n\nCast")).toBe("Severance is a TV series.\n\nCast");
    expect(mainText(`intro\n${"x".repeat(100)}\n# Late heading`)).toMatch(/^intro/);
  });
});

describe("routePosts", () => {
  it("sends TikTok, Instagram and YouTube to the social reader and every other link to the web reader", async () => {
    const seen: string[] = [];
    const reader = (name: string): PostReader => ({ read: async (url) => (seen.push(`${name} ${url}`), null) });
    const posts = routePosts({ social: reader("social"), web: reader("web") });
    for (const url of ["https://vm.tiktok.com/x", "https://www.instagram.com/reel/x", "https://youtu.be/x", "https://www.imdb.com/title/tt0093748/", "https://vulture.com/a"]) {
      await posts.read(url);
    }
    expect(seen).toEqual([
      "social https://vm.tiktok.com/x",
      "social https://www.instagram.com/reel/x",
      "social https://youtu.be/x",
      "web https://www.imdb.com/title/tt0093748/",
      "web https://vulture.com/a",
    ]);
  });
});
