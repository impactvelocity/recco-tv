import type { Card, Friend } from "./types";

let seq = 0;

export function card(overrides: Partial<Card> = {}): Card {
  seq += 1;
  return {
    id: `c${String(seq).padStart(3, "0")}`,
    householdId: "hh1",
    createdAt: new Date(Date.UTC(2026, 9, 1, 0, 0, seq)).toISOString(),
    kind: "title",
    titleId: `tt${seq}`,
    title: `Show ${seq}`,
    type: "series",
    origin: "me",
    source: "text",
    state: "new",
    needsCheck: false,
    candidates: [],
    messageId: `m${seq}`,
    ...overrides,
  };
}

export function friend(id: string, name: string): Friend {
  return { id, householdId: "hh1", name, createdAt: "2026-10-01T00:00:00.000Z" };
}
