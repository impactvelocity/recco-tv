import type { Card, Friend } from "@recco/core";
import type { EvalCase } from "./cases";

export interface CaseScore {
  pass: boolean;
  problems: string[];
  got: string;
}

/** Compare the cards the agent saved with what the case expects. */
export function scoreCase(c: EvalCase, cards: Card[], friends: Friend[]): CaseScore {
  const problems: string[] = [];
  const e = c.expect;
  const nameOf = (card: Card) => friends.find((f) => f.id === card.friendId)?.name ?? null;

  if (e.titles) {
    const got = cards.filter((x) => x.kind === "title" && !x.needsCheck).map((x) => x.titleId).sort();
    const want = [...e.titles].sort();
    if (cards.length !== e.titles.length || JSON.stringify(got) !== JSON.stringify(want)) {
      problems.push(`titles: want ${want.join(",")} got ${describe(cards)}`);
    }
  }
  if (e.check) {
    const card = cards[0];
    const ids = card?.candidates.map((x) => x.titleId) ?? [];
    if (cards.length !== 1 || !card?.needsCheck || !e.check.every((id) => ids.includes(id))) {
      problems.push(`check: want one card with ${e.check.join(",")} got ${describe(cards)}`);
    }
  }
  if (e.unsorted && (cards.length !== 1 || cards[0]?.kind !== "unsorted")) {
    problems.push(`unsorted: got ${describe(cards)}`);
  }
  if (e.friend !== undefined) {
    const names = [...new Set(cards.map(nameOf))];
    const want = e.friend?.toLowerCase() ?? null;
    if (names.length !== 1 || (names[0]?.toLowerCase() ?? null) !== want) {
      problems.push(`friend: want ${e.friend} got ${names.join(",") || "none"}`);
    }
  }
  if (e.origin && !cards.every((x) => x.origin === e.origin)) {
    problems.push(`origin: want ${e.origin} got ${cards.map((x) => x.origin).join(",")}`);
  }
  if (e.grouped && (cards.length < 2 || new Set(cards.map((x) => x.groupId)).size !== 1 || !cards[0]?.groupId)) {
    problems.push("grouped: cards do not share a group");
  }
  if (e.noteIncludes && !cards.every((x) => x.note?.toLowerCase().includes(e.noteIncludes!.toLowerCase()))) {
    problems.push(`note: want "${e.noteIncludes}" got ${cards.map((x) => JSON.stringify(x.note ?? null)).join(",")}`);
  }
  return { pass: problems.length === 0, problems, got: describe(cards, nameOf) };
}

function describe(cards: Card[], nameOf?: (c: Card) => string | null): string {
  if (cards.length === 0) return "(none)";
  return cards
    .map((c) => {
      const what = c.kind === "unsorted" ? "unsorted" : c.needsCheck ? `check[${c.candidates.map((x) => x.titleId).join("|")}]` : c.titleId;
      const who = nameOf ? nameOf(c) ?? c.origin : c.origin;
      return `${what}@${who}`;
    })
    .join(" ");
}
