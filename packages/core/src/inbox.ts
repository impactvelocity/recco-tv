import { needsAttention } from "./states";
import type { Card } from "./types";

/** The card fields the inbox needs, so the TV can pass API cards. */
export type InboxCard = Pick<Card, "id" | "createdAt" | "groupId" | "state" | "titleId" | "kind" | "needsCheck">;

/**
 * One tile in the inbox.
 * - single: one show. `cards[0]` is the newest recommendation; any others are
 *   more people who sent the same title, newest first.
 * - stack: the shows from one text or post, in the order it named them.
 */
export interface InboxItem<C extends InboxCard = Card> {
  kind: "single" | "stack";
  key: string;
  cards: C[];
  watched: boolean;
}

const newestFirst = <C extends InboxCard>(a: C, b: C) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
const oldestFirst = <C extends InboxCard>(a: C, b: C) => -newestFirst(a, b);

/**
 * The inbox, newest first, with watched items at the end. Hidden cards appear
 * nowhere. Cards from one text or post form a stack while two or more of them
 * are visible. Outside stacks, the same title sent by several people is one
 * item. Cards still being checked and unsorted notes always stand alone.
 */
export function buildInbox<C extends InboxCard>(cards: C[], { hideWatched = false } = {}): InboxItem<C>[] {
  const visible = cards.filter((c) => c.state !== "hidden");

  const groups = new Map<string, C[]>();
  for (const card of visible) {
    if (!card.groupId) continue;
    groups.set(card.groupId, [...(groups.get(card.groupId) ?? []), card]);
  }

  const items: InboxItem<C>[] = [];
  const byTitle = new Map<string, InboxItem<C>>();
  for (const [groupId, list] of groups) {
    if (list.length < 2) continue;
    const sorted = [...list].sort(oldestFirst);
    items.push({ kind: "stack", key: `stack:${groupId}`, cards: sorted, watched: sorted.every(isWatched) });
  }
  const stacked = new Set(items.flatMap((i) => i.cards.map((c) => c.id)));

  for (const card of [...visible].sort(newestFirst)) {
    if (stacked.has(card.id)) continue;
    const mergeKey = card.titleId && !needsAttention(card) ? card.titleId : null;
    const same = mergeKey ? byTitle.get(mergeKey) : undefined;
    if (same) {
      same.cards.push(card);
      same.watched = same.watched && isWatched(card);
      continue;
    }
    const item: InboxItem<C> = { kind: "single", key: `card:${card.id}`, cards: [card], watched: isWatched(card) };
    if (mergeKey) byTitle.set(mergeKey, item);
    items.push(item);
  }

  const newest = (item: InboxItem<C>) => item.cards.reduce((a, c) => (c.createdAt > a ? c.createdAt : a), "");
  const ordered = items.sort((a, b) => newest(b).localeCompare(newest(a)) || a.key.localeCompare(b.key));
  const fresh = ordered.filter((i) => !i.watched);
  return hideWatched ? fresh : [...fresh, ...ordered.filter((i) => i.watched)];
}

/** What Featured flips through: single shows that are matched and ready to watch. */
export function featuredItems<C extends InboxCard>(items: InboxItem<C>[]): InboxItem<C>[] {
  return items.filter((i) => i.kind === "single" && i.cards[0]!.kind === "title" && !i.cards[0]!.needsCheck);
}

function isWatched(card: InboxCard): boolean {
  return card.state === "watched";
}
