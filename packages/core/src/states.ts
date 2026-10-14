import type { Candidate, Card, CardFields, CardState, Origin, Rating } from "./types";

export interface CardUpdate {
  state?: CardState;
  rating?: Rating;
  candidateTitleId?: string;
  origin?: Origin;
  friendId?: string;
  /** Take the card out of its post's stack, so it stands on its own in the inbox. */
  ungroup?: boolean;
}

export class CardUpdateError extends Error {}

/**
 * Apply a change from the TV. Rating a card marks it watched. Picking a
 * candidate turns a "Check these" card into a normal one.
 */
export function applyCardUpdate<C extends CardFields>(card: C, update: CardUpdate): C {
  let next: C = { ...card };

  if (update.state) next.state = update.state;

  if (update.ungroup) {
    delete next.groupId;
    delete next.groupTitle;
  }

  if (update.rating) {
    next.rating = update.rating;
    next.state = "watched";
  }

  if (update.candidateTitleId) {
    const pick = card.candidates.find((c) => c.titleId === update.candidateTitleId);
    if (!pick) throw new CardUpdateError("That candidate is not on this card");
    next = withCandidate(next, pick);
  }

  if (update.origin) {
    if (update.origin === "friend") {
      if (!update.friendId) throw new CardUpdateError("Moving to a friend needs a friendId");
      next.origin = "friend";
      next.friendId = update.friendId;
    } else {
      next.origin = update.origin;
      delete next.friendId;
    }
  }

  return next;
}

function withCandidate<C extends CardFields>(card: C, pick: Candidate): C {
  return {
    ...card,
    kind: "title",
    titleId: pick.titleId,
    title: pick.title,
    year: pick.year,
    type: pick.type,
    plot: pick.plot,
    posterUrl: pick.posterUrl,
    imdbRating: pick.imdbRating,
    rtRating: pick.rtRating,
    runtime: pick.runtime,
    genre: pick.genre,
    needsCheck: false,
    candidates: [],
  };
}

/** Cards in "Check these": uncertain matches and unsorted notes. */
export function needsAttention(card: Pick<Card, "needsCheck" | "kind">): boolean {
  return card.needsCheck || card.kind === "unsorted";
}
