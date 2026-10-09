import type { Card, Friend, FriendWithRecord } from "./types";

export interface TrackRecord {
  ratedUp: number;
  rated: number;
}

/** Cards rated up out of cards rated, for one friend. Hidden cards still count. */
export function trackRecord(friendId: string, cards: Card[]): TrackRecord {
  let ratedUp = 0;
  let rated = 0;
  for (const card of cards) {
    if (card.origin !== "friend" || card.friendId !== friendId || !card.rating) continue;
    rated += 1;
    if (card.rating === "up") ratedUp += 1;
  }
  return { ratedUp, rated };
}

export function withTrackRecords(friends: Friend[], cards: Card[]): FriendWithRecord[] {
  return friends.map((f) => ({ ...f, ...trackRecord(f.id, cards) }));
}

/** "3 of 4 landed", or null before anything has been rated. */
export function formatTrackRecord({ ratedUp, rated }: TrackRecord): string | null {
  return rated === 0 ? null : `${ratedUp} of ${rated} landed`;
}
