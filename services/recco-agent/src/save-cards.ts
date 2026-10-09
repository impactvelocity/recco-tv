import {
  extractUrls,
  newId,
  originWithoutFriend,
  resolveFriend,
  type AgentJob,
  type Candidate,
  type Card,
  type Friend,
  type TitleType,
} from "@recco/core";
import { platformOf } from "@recco/sources";
import type { Publisher, Store } from "@recco/store";

/** What the agent hands to save_cards for each show. */
export interface DraftCard {
  kind: "title" | "unsorted";
  titleId?: string;
  title: string;
  year?: string;
  type?: TitleType;
  plot?: string;
  posterUrl?: string;
  services?: string[];
  /** As written in the text. Matched or created here. */
  friendName?: string | null;
  /** Her words, unedited. */
  note?: string;
  sourceUrl?: string;
  needsCheck?: boolean;
  candidates?: Candidate[];
}

export interface SaveCardsDeps {
  store: Store;
  publisher: Publisher;
  now?: () => Date;
}

export interface SaveCardsResult {
  saved: Card[];
  rejected: { title: string; reason: string }[];
}

/**
 * Validate, write, finish the message, and tell the TVs. Plain code, not a
 * model call. Any title id that did not come from find_titles in this run is
 * rejected; if nothing survives, her words are kept as an unsorted note.
 */
export async function saveCards(
  job: AgentJob,
  drafts: DraftCard[],
  lookedUpTitleIds: ReadonlySet<string>,
  deps: SaveCardsDeps,
): Promise<SaveCardsResult> {
  const now = deps.now?.() ?? new Date();
  const household = await deps.store.getHousehold(job.householdId);
  if (!household) throw new Error(`No household ${job.householdId}`);

  const rejected: SaveCardsResult["rejected"] = [];
  const valid = drafts.filter((d) => {
    const reason = rejectionReason(d, lookedUpTitleIds);
    if (reason) rejected.push({ title: d.title, reason });
    return !reason;
  });

  const link = extractUrls(job.body)[0];
  const accepted: DraftCard[] = valid.length > 0 ? valid : [unsortedNote(job.body, link, drafts[0]?.friendName)];

  const friends = await deps.store.listFriends(job.householdId);
  const groupId = accepted.length > 1 ? `grp_${newId(now)}` : undefined;

  const saved: Card[] = [];
  for (const [i, d] of accepted.entries()) {
    const friend = await friendFor(d.friendName, friends, job.householdId, deps.store, now);
    const createdAt = new Date(now.getTime() + i).toISOString();
    saved.push({
      id: `card_${newId(new Date(now.getTime() + i))}`,
      householdId: job.householdId,
      createdAt,
      kind: d.kind,
      titleId: d.kind === "title" && !d.needsCheck ? d.titleId : undefined,
      title: d.title,
      year: d.year,
      type: d.type ?? "unknown",
      plot: d.plot,
      posterUrl: d.posterUrl,
      services: d.services ?? [],
      origin: friend ? "friend" : originWithoutFriend(job.body),
      friendId: friend?.id,
      note: d.note,
      source: link ? "link" : "text",
      sourceUrl: d.sourceUrl ?? link,
      state: "new",
      needsCheck: d.needsCheck ?? false,
      candidates: (d.candidates ?? []).slice(0, 3),
      groupId,
      messageId: job.messageId,
    });
  }

  await deps.store.putCards(saved);
  await deps.store.updateMessage(job.householdId, job.messageId, { status: "done" });
  await deps.publisher.publish(household.channelId, { type: "card.ready", messageId: job.messageId, cards: saved });
  return { saved, rejected };
}

function rejectionReason(d: DraftCard, lookedUp: ReadonlySet<string>): string | null {
  if (!d.title?.trim()) return "missing title";
  if (d.kind === "unsorted") return null;
  if (d.needsCheck) {
    const candidates = d.candidates ?? [];
    if (candidates.length === 0) return "a card to check needs candidates";
    const unknown = candidates.find((c) => !lookedUp.has(c.titleId));
    return unknown ? `candidate ${unknown.titleId} was not returned by find_titles` : null;
  }
  if (!d.titleId) return "missing titleId";
  return lookedUp.has(d.titleId) ? null : `titleId ${d.titleId} was not returned by find_titles`;
}

function unsortedNote(body: string, link: string | undefined, friendName: string | null | undefined): DraftCard {
  return { kind: "unsorted", title: unsortedTitle(body), note: body.trim(), sourceUrl: link, friendName };
}

const PLATFORM_NAMES = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" } as const;

/**
 * What an unsorted note is called on the TV. A link it could not read is named
 * for what it is ("TikTok link"); otherwise her words.
 */
export function unsortedTitle(body: string): string {
  const link = extractUrls(body)[0];
  if (link) {
    const platform = platformOf(link);
    return platform ? `${PLATFORM_NAMES[platform]} link` : "A link";
  }
  return body.trim().slice(0, 120) || "Untitled";
}

async function friendFor(
  name: string | null | undefined,
  friends: Friend[],
  householdId: string,
  store: Store,
  now: Date,
): Promise<Friend | null> {
  const resolution = resolveFriend(name, friends);
  if (resolution.kind === "existing") return resolution.friend;
  if (resolution.kind === "none") return null;
  const friend: Friend = { id: `fr_${newId(now)}`, householdId, name: resolution.name, createdAt: now.toISOString() };
  await store.putFriend(friend);
  friends.push(friend);
  return friend;
}
