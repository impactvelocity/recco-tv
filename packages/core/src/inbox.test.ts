import { describe, expect, it } from "vitest";
import { buildInbox, featuredItems, type InboxItem } from "./inbox";
import { card } from "./test-helpers";

const titles = (items: InboxItem[]) => items.map((i) => i.cards.map((c) => c.title).join("+"));

describe("buildInbox", () => {
  it("puts newest first and leaves hidden cards out", () => {
    const a = card({ title: "A" });
    const b = card({ title: "B", state: "hidden" });
    const c = card({ title: "C" });
    expect(titles(buildInbox([a, b, c]))).toEqual(["C", "A"]);
  });

  it("sorts watched items to the end, or drops them when asked", () => {
    const a = card({ title: "A", state: "watched" });
    const b = card({ title: "B" });
    const c = card({ title: "C", state: "starred" });
    expect(titles(buildInbox([a, b, c]))).toEqual(["C", "B", "A"]);
    expect(titles(buildInbox([a, b, c], { hideWatched: true }))).toEqual(["C", "B"]);
  });

  it("stacks the shows from one post in post order, at the post's place", () => {
    const a = card({ title: "A" });
    const g1 = card({ title: "G1", groupId: "g" });
    const g2 = card({ title: "G2", groupId: "g" });
    const b = card({ title: "B" });
    const items = buildInbox([a, g1, g2, b]);
    expect(titles(items)).toEqual(["B", "G1+G2", "A"]);
    expect(items[1]).toMatchObject({ kind: "stack", key: "stack:g" });
  });

  it("stops stacking when only one show of the post is left", () => {
    const g1 = card({ title: "G1", groupId: "g" });
    const g2 = card({ title: "G2", groupId: "g", state: "hidden" });
    const items = buildInbox([g1, g2]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: "single", key: `card:${g1.id}` });
  });

  it("merges the same title from several people, newest recommendation first", () => {
    const fromSteph = card({ title: "The Bear", titleId: "tt14452776", note: "Steph" });
    const other = card({ title: "Other" });
    const fromDad = card({ title: "The Bear", titleId: "tt14452776", note: "Dad" });
    const items = buildInbox([fromSteph, other, fromDad]);
    expect(items.map((i) => i.cards.map((c) => c.note ?? c.title))).toEqual([["Dad", "Steph"], ["Other"]]);
  });

  it("is watched only when every recommendation of it is", () => {
    const one = card({ titleId: "tt1", state: "watched" });
    const two = card({ titleId: "tt1" });
    expect(buildInbox([one, two])[0]!.watched).toBe(false);
    expect(buildInbox([one, { ...two, state: "watched" }])[0]!.watched).toBe(true);
  });

  it("does not merge a stacked show with the same show outside the stack", () => {
    const single = card({ title: "Dark", titleId: "tt5753856" });
    const g1 = card({ title: "Dark", titleId: "tt5753856", groupId: "g" });
    const g2 = card({ title: "Devs", groupId: "g" });
    expect(titles(buildInbox([single, g1, g2]))).toEqual(["Dark+Devs", "Dark"]);
  });

  it("never merges cards still being checked or unsorted notes", () => {
    const check = card({ titleId: undefined, needsCheck: true });
    const check2 = card({ titleId: undefined, needsCheck: true });
    const note = card({ kind: "unsorted", titleId: undefined });
    expect(buildInbox([check, check2, note])).toHaveLength(3);
  });
});

describe("featuredItems", () => {
  it("keeps matched single shows only", () => {
    const show = card({ title: "Show" });
    const check = card({ title: "Check", titleId: undefined, needsCheck: true });
    const note = card({ title: "Note", kind: "unsorted", titleId: undefined });
    const g1 = card({ title: "G1", groupId: "g" });
    const g2 = card({ title: "G2", groupId: "g" });
    expect(titles(featuredItems(buildInbox([show, check, note, g1, g2])))).toEqual(["Show"]);
  });
});
