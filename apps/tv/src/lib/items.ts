import type {InboxItem} from '@recco/core-shared/inbox';
import {messageOf, namesLabel, senderName, timeAgo} from './format';
import type {ApiCard, ApiFriend} from './types';

export type Item = InboxItem<ApiCard>;

export interface Recommendation {
  name: string;
  time: string;
  message?: string;
}

/** What a tile shows about who sent it: everyone, newest first. */
export interface ItemView {
  primary: ApiCard;
  names: string[];
  /** "Steph", "Steph & Dad", "Steph, Dad +2" */
  label: string;
  time: string;
  message?: string;
  recommendations: Recommendation[];
}

export function describeItem(
  item: Item,
  friends: ApiFriend[],
  now = new Date(),
): ItemView {
  // A stack's cards share one sender and message; a single's cards are separate recommendations.
  const from = item.kind === 'stack' ? item.cards.slice(0, 1) : item.cards;
  const recommendations = from.map((card) => ({
    name: senderName(card, friends),
    time: timeAgo(card.createdAt, now),
    message: messageOf(card),
  }));
  const names = [...new Set(recommendations.map((r) => r.name))];
  const primary = item.cards[0]!;
  return {
    primary,
    names,
    label: namesLabel(names),
    time: recommendations[0]!.time,
    message: recommendations[0]!.message,
    recommendations,
  };
}
