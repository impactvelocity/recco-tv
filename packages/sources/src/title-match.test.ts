import { describe, expect, it } from "vitest";
import { closeness, isCloseMatch, titleVariants, titleWords } from "./title-match";

describe("title matching", () => {
  it("ignores case, punctuation, accents, '&'/'and' and a leading 'the'", () => {
    expect(titleWords("Planes, Trains & Automobiles")).toEqual(["planes", "trains", "automobiles"]);
    expect(titleWords("The Café")).toEqual(["cafe"]);
  });

  it("treats the same words in another order as a close match", () => {
    expect(isCloseMatch("trains planes and automobiles", "Planes, Trains & Automobiles")).toBe(true);
    expect(isCloseMatch("The Office", "The Office Christmas Party")).toBe(false);
    expect(isCloseMatch("", "")).toBe(false);
  });

  it("ranks the real title above clips that contain its words", () => {
    const guess = "Planes, Trains and Automobiles";
    expect(closeness(guess, "Planes, Trains & Automobiles")).toBe(1);
    expect(closeness(guess, "Con Air (1997) - Planes! Trains! And Automobiles!")).toBeLessThan(1);
  });

  it("offers '&' for 'and' (and back) and a plain spelling, without repeats", () => {
    expect(titleVariants("Planes, Trains and Automobiles")).toEqual([
      "Planes, Trains and Automobiles",
      "Planes, Trains & Automobiles",
      "planes trains automobiles",
    ]);
    expect(titleVariants("Law & Order")).toEqual(["Law & Order", "Law and Order", "law order"]);
    expect(titleVariants("severance")).toEqual(["severance"]);
  });
});
