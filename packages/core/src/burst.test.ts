import { describe, expect, it } from "vitest";
import { burstOf, burstWaitMs, combineBurst, countBursts } from "./burst";

const at = (s: number) => new Date(Date.UTC(2026, 9, 14, 1, 17, 0) + s * 1000).toISOString();
const msg = (id: string, s: number, body = id) => ({ id, receivedAt: at(s), body });

describe("bursts of texts", () => {
  const words = msg("words", 11.456, "Top 10 movies to watch for thanksgiving ");
  const link = msg("link", 11.81, "https://www.imdb.com/list/ls086453555/");

  it("joins texts sent back to back, oldest first", () => {
    expect(burstOf([link, words], "link").map((m) => m.id)).toEqual(["words", "link"]);
    expect(burstOf([link, words], "words").map((m) => m.id)).toEqual(["words", "link"]);
  });

  it("chains through close gaps and stops at a quiet one", () => {
    const pending = [msg("a", 0), msg("b", 4), msg("c", 8), msg("d", 20)];
    expect(burstOf(pending, "a").map((m) => m.id)).toEqual(["a", "b", "c"]);
    expect(burstOf(pending, "d").map((m) => m.id)).toEqual(["d"]);
  });

  it("is empty when the text is no longer pending", () => {
    expect(burstOf([words], "link")).toEqual([]);
  });

  it("waits until the burst has been quiet, but not past the cap", () => {
    expect(burstWaitMs([words, link], "words", new Date(at(12)))).toBe(4_810);
    expect(burstWaitMs([words, link], "words", new Date(at(17)))).toBe(0);
    // A long chain cannot hold the first text past ten seconds.
    const chain = [msg("a", 0), msg("b", 4), msg("c", 8)];
    expect(burstWaitMs(chain, "a", new Date(at(1)))).toBe(9_000);
  });

  it("counts one placeholder per burst", () => {
    expect(countBursts([])).toBe(0);
    expect(countBursts([link, words])).toBe(1);
    expect(countBursts([msg("a", 0), msg("b", 2), msg("c", 30)])).toBe(2);
  });

  it("reads the burst as one text in the order sent", () => {
    expect(combineBurst([words, link])).toBe("Top 10 movies to watch for thanksgiving\nhttps://www.imdb.com/list/ls086453555/");
  });
});
