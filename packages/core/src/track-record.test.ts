import { describe, expect, it } from "vitest";
import { formatTrackRecord, trackRecord, withTrackRecords } from "./track-record";
import { card, friend } from "./test-helpers";

describe("track record", () => {
  const cards = [
    card({ origin: "friend", friendId: "f1", rating: "up", state: "watched" }),
    card({ origin: "friend", friendId: "f1", rating: "up", state: "watched" }),
    card({ origin: "friend", friendId: "f1", rating: "up", state: "hidden" }),
    card({ origin: "friend", friendId: "f1", rating: "down", state: "watched" }),
    card({ origin: "friend", friendId: "f1" }),
    card({ origin: "friend", friendId: "f2", rating: "down", state: "watched" }),
    card({ origin: "me", rating: "up", state: "watched" }),
  ];

  it("counts cards rated up out of cards rated", () => {
    expect(trackRecord("f1", cards)).toEqual({ ratedUp: 3, rated: 4 });
    expect(trackRecord("f2", cards)).toEqual({ ratedUp: 0, rated: 1 });
    expect(trackRecord("f3", cards)).toEqual({ ratedUp: 0, rated: 0 });
  });

  it("reads as 'n of m landed'", () => {
    expect(formatTrackRecord({ ratedUp: 3, rated: 4 })).toBe("3 of 4 landed");
    expect(formatTrackRecord({ ratedUp: 0, rated: 0 })).toBeNull();
  });

  it("attaches to friends", () => {
    const [jordan] = withTrackRecords([friend("f1", "Jordan")], cards);
    expect(jordan).toMatchObject({ name: "Jordan", ratedUp: 3, rated: 4 });
  });
});
