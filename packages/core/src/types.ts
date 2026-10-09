export type CardState = "new" | "starred" | "hidden" | "watched";
export type Rating = "up" | "down";
export type TitleType = "movie" | "series" | "episode" | "unknown";

/** Who a card is filed under. */
export type Origin = "friend" | "me" | "internet";

/** "title" maps to a looked-up title. "unsorted" is her words and link, kept when nothing matched. */
export type CardKind = "title" | "unsorted";

export interface Household {
  id: string;
  /** Lower-case ISO 3166 code used for availability lookups, e.g. "ca". */
  country: string;
  phoneLast4: string;
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

export interface Candidate {
  titleId: string;
  title: string;
  year?: string;
  type: TitleType;
  plot?: string;
  posterUrl?: string;
  services?: string[];
}

export interface Card {
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
  services: string[];
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
  messageId: string;
}

/** A card as the API sends it to a TV. */
export type CardFields = Omit<Card, "householdId" | "messageId">;

export type MessageStatus = "pending" | "done" | "failed";

export interface RawMessage {
  id: string;
  householdId: string;
  receivedAt: string;
  body: string;
  status: MessageStatus;
  provider: string;
  providerMessageId: string;
  error?: string;
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
  | { type: "card.failed"; messageId: string };

/** The work handed from intake to the agent. */
export interface AgentJob {
  householdId: string;
  messageId: string;
  body: string;
}
