import { describe, expect, it } from "vitest";
import { createSources } from "../create";
import { createFixtureSources } from "./sources";

describe("fixture sources", () => {
  const s = createFixtureSources();

  it("search like OMDb: exact first, then near matches, filtered by year and type", async () => {
    expect((await s.titles.search({ title: "dune" })).map((t) => t.imdbId)).toEqual(["tt1160419", "tt15239678"]);
    expect((await s.titles.search({ title: "fargo", type: "series" })).map((t) => t.imdbId)).toEqual(["tt2802850"]);
    expect((await s.titles.search({ title: "fargo", year: "1996" })).map((t) => t.imdbId)).toEqual(["tt0116282"]);
    expect(await s.titles.search({ title: "zz" })).toEqual([]);
  });

  it("read recorded posts and nothing else", async () => {
    expect(await s.posts.read("https://www.instagram.com/reel/RECCODEMO1/")).toMatchObject({ platform: "instagram" });
    expect(await s.posts.read("https://www.tiktok.com/@x/video/404")).toBeNull();
  });

  it("are used wherever a key is missing", () => {
    expect(createSources({}).live).toEqual({ titles: false, availability: false, posts: false });
    expect(createSources({ OMDB_API_KEY: "k" }).live.titles).toBe(true);
    expect(createSources({ OMDB_API_KEY: "k" }, { fixtures: true }).live.titles).toBe(false);
  });
});
