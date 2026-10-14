import type {ApiCard, ApiFriend} from './types';

/** "+16045550142" → "(604) 555-0142". Other numbers are shown as given. */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export function typeLabel(type: ApiCard['type']): string {
  return type === 'movie'
    ? 'Film'
    : type === 'series'
    ? 'Series'
    : type === 'episode'
    ? 'Episode'
    : '';
}

/** "Series · 2022–" */
export function metaLine(card: Pick<ApiCard, 'year' | 'type'>): string {
  return [typeLabel(card.type), card.year].filter(Boolean).join(' · ');
}

/** "Series · 2022– · 50 min · Thriller", for Featured and the drawer. */
export function longMetaLine(
  card: Pick<ApiCard, 'year' | 'type' | 'runtime' | 'genre'>,
): string {
  return [typeLabel(card.type), card.year, card.runtime, card.genre]
    .filter(Boolean)
    .join(' · ');
}

/** The Alexa hand-off line (R9.1). Recco never opens another app. */
export function alexaLine(title: string): string {
  return `“Alexa, watch ${title}”`;
}

type Platform = 'TikTok' | 'YouTube' | 'Instagram';

export function platformOf(url: string | undefined): Platform | null {
  if (!url) {
    return null;
  }
  if (/(^|\/\/|\.)tiktok\.com/i.test(url)) {
    return 'TikTok';
  }
  if (/(^|\/\/|\.)(youtube\.com|youtu\.be)/i.test(url)) {
    return 'YouTube';
  }
  if (/(^|\/\/|\.)instagram\.com/i.test(url)) {
    return 'Instagram';
  }
  return null;
}

/** The sender for ideas Recco picked when she asked for some, so they never pass for a person's recommendation. */
export const RECCO_PICKS = "Recco's picks";

/** Who the card came from, as one name: a friend, "Me", Recco's picks, or where the link came from. */
export function senderName(
  card: Pick<ApiCard, 'origin' | 'friendId' | 'sourceUrl'>,
  friends: ApiFriend[],
): string {
  if (card.origin === 'friend') {
    return friends.find((f) => f.id === card.friendId)?.name ?? 'A friend';
  }
  if (card.origin === 'me') {
    return 'Me';
  }
  if (card.origin === 'recco') {
    return RECCO_PICKS;
  }
  return platformOf(card.sourceUrl) ?? 'A link';
}

/** The letters in a sender's avatar. */
export function initials(name: string): string {
  const short: Record<string, string> = {
    TikTok: 'TT',
    YouTube: 'YT',
    Instagram: 'IG',
    'A link': '↗',
    [RECCO_PICKS]: '✦',
  };
  return short[name] ?? name.trim().charAt(0).toUpperCase();
}

/** "Steph", "Steph & Dad", "Steph, Dad +2". */
export function namesLabel(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? '';
  }
  if (names.length === 2) {
    return `${names[0]} & ${names[1]}`;
  }
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

/** What goes in the message bubble: her words, or what the link was. */
export function messageOf(
  card: Pick<ApiCard, 'note' | 'source' | 'sourceUrl'>,
): string | undefined {
  if (card.note) {
    return card.note;
  }
  if (card.source === 'link') {
    return `${platformOf(card.sourceUrl) ?? 'A'} link`;
  }
  return undefined;
}

/** A stack's heading: where its shows came from. */
export function stackTitle(
  card: Pick<ApiCard, 'source' | 'sourceUrl'>,
): string {
  if (card.source !== 'link') {
    return 'From one text';
  }
  const platform = platformOf(card.sourceUrl);
  if (platform === 'TikTok') {
    return 'From a TikTok';
  }
  if (platform === 'YouTube') {
    return 'From a YouTube video';
  }
  if (platform === 'Instagram') {
    return 'From an Instagram post';
  }
  return 'From a link';
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "Just now", "5m ago", "2h ago", "Yesterday", "Tue", "Oct 3". */
export function timeAgo(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const daysBack = Math.ceil((startOfToday - then.getTime()) / 86_400_000);
  if (daysBack <= 0) {
    return `${Math.floor(minutes / 60)}h ago`;
  }
  if (daysBack === 1) {
    return 'Yesterday';
  }
  if (daysBack < 7) {
    return DAYS[then.getDay()]!;
  }
  return `${MONTHS[then.getMonth()]} ${then.getDate()}`;
}

/** OMDb posters come at 300 px wide; the TV wants 600. */
export function posterAt600(url: string): string {
  return url.replace('_SX300', '_SX600');
}
