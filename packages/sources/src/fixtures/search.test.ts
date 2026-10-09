import { describe, expect, it } from "vitest";
import { fixtureTitlesIn, searchFixtureTitles, titleKey } from "./search";

describe("fixture search", () => {
  it("normalises titles", () => {
    expect(titleKey("The King of Queens")).toBe("king of queens");
    expect(titleKey("Shōgun")).toBe("shogun");
  });

  it("finds a title without 'the'", () => {
    expect(searchFixtureTitles("King of Queens").map((t) => t.imdbId)).toEqual(["tt0165581"]);
  });

  it("returns every match for an ambiguous title", () => {
    expect(searchFixtureTitles("the office")).toHaveLength(2);
  });

  it("finds titles named in a post, in order", () => {
    const text = "Number one, Abbott Elementary. Number two, Hacks. And Schitt's Creek";
    expect(fixtureTitlesIn(text).map((t) => t.title)).toEqual(["Abbott Elementary", "Hacks", "Schitt's Creek"]);
  });
});
