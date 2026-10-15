export type CardState = "new" | "starred" | "hidden" | "watched";
export type Rating = "up" | "down";
export type TitleType = "movie" | "series" | "episode" | "unknown";

/** Who a card is filed under. "recco": the agent's own ideas, when she asked for some ("movies for a stormy night"). */
export type Origin = "friend" | "me" | "internet" | "recco";

/** "title" maps to a looked-up title. "unsorted" is her words and link, kept when nothing matched. */
export type CardKind = "title" | "unsorted";

export interface Household {
  id: string;
  /** Lower-case ISO 3166 code, e.g. "ca". */
  country: string;
  phoneLast4: string;
  /** Salted hash of the linked phone, so a delete can find the phone link (R11.1). */
  phoneHash: string;
  /** Unguessable id of the household's live-update channel. */
  channelId: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  householdId: string;
  /** First name only. */
  name: string;
  createdAt: string;
}

export interface FriendWithRecord extends Friend {
  ratedUp: number;
  rated: number;
}

/** Details from the title lookup. Optional: older cards and some titles have none. */
export interface TitleFacts {
  /** IMDb score as OMDb gives it, e.g. "8.7". */
  imdbRating?: string;
  /** Rotten Tomatoes score, e.g. "97%". */
  rtRating?: string;
  /** e.g. "50 min". */
  runtime?: string;
  /** The first genre only, e.g. "Thriller". */
  genre?: string;
}

export interface Candidate extends TitleFacts {
  titleId: string;
  title: string;
  year?: string;
  type: TitleType;
  plot?: string;
  posterUrl?: string;
}

export interface Card extends TitleFacts {
  id: string;
  householdId: string;
  createdAt: string;
  kind: CardKind;
  /** IMDb id. Absent for unsorted notes. */
  titleId?: string;
  title: string;
  year?: string;
  type: TitleType;
  plot?: string;
  posterUrl?: string;
  origin: Origin;
  friendId?: string;
  /** Her words, unedited. */
  note?: string;
  source: "text" | "link";
  sourceUrl?: string;
  state: CardState;
  rating?: Rating;
  needsCheck: boolean;
  candidates: Candidate[];
  /** Shared by every card that came from one post. */
  groupId?: string;
  /** The stack's short name, written by the agent ("Thanksgiving Movie Night"). Same on every card in the group. */
  groupTitle?: string;
  messageId: string;
}

/** A card as the API sends it to a TV. */
export type CardFields = Omit<Card, "householdId" | "messageId">;

/** "merged": read together with an older text sent just before it (see burst.ts). */
export type MessageStatus = "pending" | "done" | "failed" | "merged";

export interface RawMessage {
  id: string;
  householdId: string;
  receivedAt: string;
  body: string;
  status: MessageStatus;
  provider: string;
  providerMessageId: string;
  error?: string;
  /** For a merged text: the message whose run read it. */
  mergedInto?: string;
}

export interface Device {
  id: string;
  tokenHash: string;
  channelId: string;
  createdAt: string;
  householdId?: string;
  pairedAt?: string;
  /** The code currently shown on this TV, if any. */
  pairingCode?: string;
  pairingExpiresAt?: string;
}

export interface PairingCode {
  code: string;
  deviceId: string;
  expiresAt: string;
}

export interface PhoneLink {
  phoneHash: string;
  householdId: string;
}

export type ReccoEvent =
  | { type: "paired"; phoneLast4: string; householdId: string }
  | { type: "card.pending"; messageId: string; receivedAt: string }
  | { type: "card.ready"; messageId: string; cards: Card[] }
  | { type: "card.updated"; card: Card }
  | { type: "card.failed"; messageId: string }
  /** Forget me, or the last TV moved away. Carries no channel id. */
  | { type: "household.deleted" }
  /** A TV left the household; the others fetch the new channel from GET /realtime. */
  | { type: "channel.changed" };

/** The work handed from intake to the agent. */
export interface AgentJob {
  householdId: string;
  messageId: string;
  body: string;
}
