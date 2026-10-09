import { needsAttention } from "./states";
import type { Card } from "./types";

/** The card fields row building needs, so the TV can pass API cards. */
export type RowCard = Pick<Card, "id" | "createdAt" | "groupId" | "state" | "origin" | "friendId" | "needsCheck" | "kind">;

export type RowKey = "new" | "starred" | `friend:${string}` | "me" | "internet" | "check";

export interface InboxRow<C extends RowCard = Card> {
  key: RowKey;
  label: string;
  /** Set on friend rows. */
  friendId?: string;
  cards: C[];
}

/**
 * Newest first, but cards from one post stay together, in the order the post
 * named them, at the position of the group's newest card.
 */
export function orderCards<C extends RowCard>(cards: C[]): C[] {
  const byNewest = [...cards].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  const groups = new Map<string, C[]>();
  for (const card of cards) {
    if (!card.groupId) continue;
    const list = groups.get(card.groupId) ?? [];
    list.push(card);
    groups.set(card.groupId, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
  const out: C[] = [];
  const placed = new Set<string>();
  for (const card of byNewest) {
    if (!card.groupId) {
      out.push(card);
      continue;
    }
    if (placed.has(card.groupId)) continue;
    placed.add(card.groupId);
    out.push(...(groups.get(card.groupId) ?? []));
  }
  return out;
}

/**
 * The inbox rows in order: New, Starred, one row per friend, From me, From the
 * internet, Check these. Hidden cards appear nowhere. Empty rows are dropped.
 */
export function buildRows<C extends RowCard>(cards: C[], friends: { id: string; name: string }[]): InboxRow<C>[] {
  const visible = orderCards(cards.filter((c) => c.state !== "hidden"));
  const sorted = visible.filter((c) => !needsAttention(c));

  const rows: InboxRow<C>[] = [
    { key: "new", label: "New", cards: sorted.filter((c) => c.state === "new") },
    { key: "starred", label: "Starred", cards: sorted.filter((c) => c.state === "starred") },
    ...[...friends]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f): InboxRow<C> => ({
        key: `friend:${f.id}`,
        label: f.name,
        friendId: f.id,
        cards: sorted.filter((c) => c.origin === "friend" && c.friendId === f.id),
      })),
    { key: "me", label: "From me", cards: sorted.filter((c) => c.origin === "me") },
    { key: "internet", label: "From the internet", cards: sorted.filter((c) => c.origin === "internet") },
    { key: "check", label: "Check these", cards: visible.filter(needsAttention) },
  ];
  return rows.filter((r) => r.cards.length > 0);
}
