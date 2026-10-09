import type {ApiCard, ApiFriend} from './types';

/** "+16045550142" → "(604) 555-0142". Other numbers are shown as given. */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

/** Who the card is filed under, as a line of text. */
export function whoLabel(card: ApiCard, friends: ApiFriend[]): string {
  if (card.origin === 'friend') {
    const friend = friends.find((f) => f.id === card.friendId);
    return friend ? `From ${friend.name}` : 'From a friend';
  }
  return card.origin === 'me' ? 'From me' : 'From the internet';
}

export function typeLabel(type: ApiCard['type']): string {
  return type === 'movie' ? 'Movie' : type === 'series' ? 'Series' : type === 'episode' ? 'Episode' : '';
}

export function metaLine(card: Pick<ApiCard, 'year' | 'type'>): string {
  return [card.year, typeLabel(card.type)].filter(Boolean).join(' · ');
}

export function servicesLine(services: string[], country = 'ca'): string {
  if (services.length === 0) {
    return `Not on a streaming service in ${country === 'ca' ? 'Canada' : country.toUpperCase()} yet`;
  }
  return `On ${services.join(', ')}`;
}

/** The Alexa hand-off line (R9.1). Recco never opens another app. */
export function alexaLine(title: string): string {
  return `Hold the mic button and say “Watch ${title}”`;
}
