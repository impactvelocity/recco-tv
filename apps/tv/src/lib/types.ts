import type {CardFields, FriendWithRecord} from '@recco/core-shared/types';

export type {
  Candidate,
  CardState,
  Rating,
  TitleType,
} from '@recco/core-shared/types';

/** Response shapes of services/api. */
export type ApiCard = CardFields;
export type ApiFriend = Omit<FriendWithRecord, 'householdId'>;

export type PairingState =
  | {
      paired: false;
      code: string | null;
      expiresAt: string | null;
      phoneNumber: string;
    }
  | {paired: true; phoneLast4: string; phoneNumber: string};

export interface PendingText {
  messageId: string;
  receivedAt: string;
}

export interface Inbox {
  serverTime: string;
  pairing: PairingState;
  friends: ApiFriend[];
  cards: ApiCard[];
  pending: PendingText[];
}

export interface PairingCode {
  code: string;
  expiresAt: string;
  phoneNumber: string;
}

export interface CardUpdate {
  state?: 'new' | 'starred' | 'hidden' | 'watched';
  rating?: 'up' | 'down';
  candidateTitleId?: string;
  origin?: 'friend' | 'me' | 'internet';
  friendId?: string;
  /** Take the card out of its post's stack. */
  ungroup?: true;
}
