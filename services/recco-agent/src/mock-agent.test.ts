import { describe, expect, it } from "vitest";
import { guessFriend, readText } from "./mock-agent";

describe("mock agent reading", () => {
  it("a friend's pick", () => {
    const { drafts } = readText("King of Queens - Jordan said it was funny and worth watching");
    expect(drafts).toEqual([
      expect.objectContaining({ titleId: "tt0165581", friendName: "Jordan", note: "Jordan said it was funny and worth watching" }),
    ]);
  });

  it("her own thought", () => {
    const { drafts } = readText("Severance");
    expect(drafts).toEqual([expect.objectContaining({ titleId: "tt11280740", friendName: null, note: undefined })]);
  });

  it("an ambiguous title goes to Check these", () => {
    const { drafts } = readText("the office");
    expect(drafts[0]).toMatchObject({ needsCheck: true });
    expect(drafts[0]?.candidates).toHaveLength(2);
  });

  it("a post naming several shows", () => {
    const { drafts } = readText("https://www.tiktok.com/@reccodemo/video/7420000000000000001 Steph sent this");
    expect(drafts.map((d) => d.title)).toEqual(["Abbott Elementary", "Hacks", "Schitt's Creek"]);
    expect(drafts.every((d) => d.friendName === "Steph")).toBe(true);
  });

  it("nothing matches", () => {
    expect(readText("that show with the guy").drafts).toEqual([]);
  });

  it("guesses names only from clear phrasing", () => {
    expect(guessFriend("Steph sent this")).toBe("Steph");
    expect(guessFriend("from Priya")).toBe("Priya");
    expect(guessFriend("Shogun - from priya")).toBe("priya");
    expect(guessFriend("from me")).toBeNull();
    expect(guessFriend("saw it on tiktok, from TikTok")).toBeNull();
    expect(guessFriend("I loved it")).toBeNull();
    expect(guessFriend("Severance")).toBeNull();
  });
});
