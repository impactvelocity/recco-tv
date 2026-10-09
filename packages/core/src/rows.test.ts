import { describe, expect, it } from "vitest";
import { buildRows, orderCards } from "./rows";
import { card, friend } from "./test-helpers";

describe("orderCards", () => {
  it("puts newest first and keeps a post's cards together in post order", () => {
    const a = card({ title: "A" });
    const g1 = card({ title: "G1", groupId: "g" });
    const b = card({ title: "B" });
    const g2 = card({ title: "G2", groupId: "g" });
    const c = card({ title: "C" });
    expect(orderCards([a, g1, b, g2, c]).map((x) => x.title)).toEqual(["C", "G1", "G2", "B", "A"]);
  });
});

describe("buildRows", () => {
  const friends = [friend("f2", "Steph"), friend("f1", "Jordan")];
  const cards = [
    card({ title: "jordan-new", origin: "friend", friendId: "f1" }),
    card({ title: "jordan-watched", origin: "friend", friendId: "f1", state: "watched", rating: "up" }),
    card({ title: "steph-starred", origin: "friend", friendId: "f2", state: "starred" }),
    card({ title: "mine", origin: "me" }),
    card({ title: "web", origin: "internet" }),
    card({ title: "hidden", origin: "me", state: "hidden" }),
    card({ title: "unsure", origin: "me", needsCheck: true }),
    card({ title: "note", origin: "me", kind: "unsorted", titleId: undefined }),
  ];

  const rows = buildRows(cards, friends);
  const titles = (key: string) => rows.find((r) => r.key === key)?.cards.map((c) => c.title);

  it("orders rows: New, Starred, friends, From me, From the internet, Check these", () => {
    expect(rows.map((r) => r.label)).toEqual([
      "New",
      "Starred",
      "Jordan",
      "Steph",
      "From me",
      "From the internet",
      "Check these",
    ]);
  });

  it("files cards into the right rows", () => {
    expect(titles("new")).toEqual(["web", "mine", "jordan-new"]);
    expect(titles("starred")).toEqual(["steph-starred"]);
    expect(titles("friend:f1")).toEqual(["jordan-watched", "jordan-new"]);
    expect(titles("me")).toEqual(["mine"]);
    expect(titles("check")).toEqual(["note", "unsure"]);
  });

  it("never shows hidden cards", () => {
    expect(rows.flatMap((r) => r.cards).some((c) => c.title === "hidden")).toBe(false);
  });

  it("drops empty rows", () => {
    expect(buildRows([card({ origin: "me" })], friends).map((r) => r.key)).toEqual(["new", "me"]);
  });
});
