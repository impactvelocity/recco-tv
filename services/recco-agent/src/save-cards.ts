import {
  extractUrls,
  newId,
  originWithoutFriend,
  resolveFriend,
  type AgentJob,
  type Candidate,
  type Card,
  type Friend,
  type TitleFacts,
  type TitleType,
} from "@recco/core";
import { platformOf } from "@recco/sources";
import type { Publisher, Store } from "@recco/store";

/** What the agent hands to save_cards for each show. */
export interface DraftCard extends TitleFacts {
  kind: "title" | "unsorted";
  titleId?: string;
  title: string;
  year?: string;
  type?: TitleType;
  plot?: string;
  posterUrl?: string;
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
 * Writes and publishes nothing if the household or the message is gone
 * (R11.7).
 */
export async function saveCards(
  job: AgentJob,
  drafts: DraftCard[],
  lookedUpTitleIds: ReadonlySet<string>,
  deps: SaveCardsDeps,
  { groupTitle, suggestions = false }: { groupTitle?: string | null; suggestions?: boolean } = {},
): Promise<SaveCardsResult> {
  const now = deps.now?.() ?? new Date();
  const household = await deps.store.getHousehold(job.householdId);
  const message = household && (await deps.store.getMessage(job.householdId, job.messageId));
  if (!household || !message) return { saved: [], rejected: [] };

  const rejected: SaveCardsResult["rejected"] = [];
  const valid = drafts.filter((d) => {
    const reason = rejectionReason(d, lookedUpTitleIds);
    if (reason) rejected.push({ title: d.title, reason });
    return !reason;
  });

  const link = extractUrls(job.body)[0];
  const accepted: DraftCard[] =
    valid.length > 0 ? (suggestions ? valid.slice(0, MAX_SUGGESTIONS) : valid) : [unsortedNote(job.body, link, drafts[0]?.friendName)];
  // The agent's own ideas are never filed as a person's recommendation.
  const picks = suggestions && valid.length > 0;

  const friends = await deps.store.listFriends(job.householdId);
  const groupId = accepted.length > 1 ? `grp_${newId(now)}` : undefined;
  const title = groupId ? cleanGroupTitle(groupTitle) : undefined;

  const saved: Card[] = [];
  for (const [i, d] of accepted.entries()) {
    const friend = picks ? null : await friendFor(d.friendName, friends, job.householdId, deps.store, now);
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
      imdbRating: d.imdbRating,
      rtRating: d.rtRating,
      runtime: d.runtime,
      genre: d.genre,
      origin: picks ? "recco" : friend ? "friend" : originWithoutFriend(job.body),
      friendId: friend?.id,
      note: d.note,
      source: link ? "link" : "text",
      sourceUrl: d.sourceUrl ?? link,
      state: "new",
      needsCheck: d.needsCheck ?? false,
      candidates: (d.candidates ?? []).slice(0, 3),
      groupId,
      groupTitle: title,
      messageId: job.messageId,
    });
  }

  let writeError: unknown;
  try {
    await deps.store.putCards(saved);
    await deps.store.updateMessage(job.householdId, job.messageId, { status: "done" });
  } catch (err) {
    writeError = err;
  }
  // Forgotten while the agent ran: sweep up what was just written, and tell no one.
  if (!(await deps.store.getHousehold(job.householdId))) {
    await deps.store.deleteHousehold(job.householdId);
    return { saved: [], rejected };
  }
  if (writeError) throw writeError;
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

/** The most titles one request for ideas can add ("movies for a stormy night"). */
export const MAX_SUGGESTIONS = 7;

/** The model's stack name, made safe to show: one short line, no links. */
export function cleanGroupTitle(raw: string | null | undefined): string | undefined {
  const line = (raw ?? "").replace(/https?:\/\/\S+/gi, " ").replace(/\s+/g, " ").trim();
  if (!line) return undefined;
  return line.length <= 40 ? line : `${line.slice(0, 39).trimEnd()}…`;
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
