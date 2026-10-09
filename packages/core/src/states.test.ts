import { describe, expect, it } from "vitest";
import { applyCardUpdate, CardUpdateError, needsAttention } from "./states";
import { card } from "./test-helpers";

describe("card states", () => {
  it("can be starred, hidden and returned to new", () => {
    const c = card();
    expect(applyCardUpdate(c, { state: "starred" }).state).toBe("starred");
    expect(applyCardUpdate(c, { state: "hidden" }).state).toBe("hidden");
    expect(applyCardUpdate(card({ state: "starred" }), { state: "new" }).state).toBe("new");
  });

  it("rating up or down marks it watched", () => {
    expect(applyCardUpdate(card(), { rating: "up" })).toMatchObject({ rating: "up", state: "watched" });
    expect(applyCardUpdate(card({ state: "starred" }), { rating: "down" })).toMatchObject({
      rating: "down",
      state: "watched",
    });
  });

  it("does not mutate the original", () => {
    const c = card();
    applyCardUpdate(c, { rating: "up" });
    expect(c.state).toBe("new");
  });
});

describe("check these", () => {
  const candidates = [
    { titleId: "tt0386676", title: "The Office", year: "2005–2013", type: "series" as const, services: ["Prime Video"] },
    { titleId: "tt0290978", title: "The Office", year: "2001–2003", type: "series" as const },
  ];

  it("picking a candidate makes it a normal card", () => {
    const c = card({ needsCheck: true, candidates, titleId: undefined });
    expect(needsAttention(c)).toBe(true);
    const picked = applyCardUpdate(c, { candidateTitleId: "tt0290978" });
    expect(picked).toMatchObject({ titleId: "tt0290978", year: "2001–2003", needsCheck: false, candidates: [] });
    expect(needsAttention(picked)).toBe(false);
  });

  it("rejects a candidate that is not on the card", () => {
    expect(() => applyCardUpdate(card({ needsCheck: true, candidates }), { candidateTitleId: "tt1" })).toThrow(
      CardUpdateError,
    );
  });

  it("unsorted notes need attention", () => {
    expect(needsAttention(card({ kind: "unsorted", titleId: undefined }))).toBe(true);
  });
});

describe("moving a card", () => {
  it("to a friend", () => {
    expect(applyCardUpdate(card(), { origin: "friend", friendId: "f1" })).toMatchObject({
      origin: "friend",
      friendId: "f1",
    });
  });

  it("to From me drops the friend", () => {
    const moved = applyCardUpdate(card({ origin: "friend", friendId: "f1" }), { origin: "me" });
    expect(moved.origin).toBe("me");
    expect(moved.friendId).toBeUndefined();
  });

  it("to a friend needs an id", () => {
    expect(() => applyCardUpdate(card(), { origin: "friend" })).toThrow(CardUpdateError);
  });
});
