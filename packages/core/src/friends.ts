import type { Friend, Origin } from "./types";

/**
 * Reduce a name to a first name: first word, letters (plus ' and -) only,
 * capitalised. Returns null when nothing usable is left.
 */
export function toFirstName(raw: string): string | null {
  const first = raw.trim().split(/\s+/)[0] ?? "";
  const cleaned = first.replace(/[^\p{L}'-]/gu, "").replace(/^['-]+|['-]+$/g, "");
  if (!cleaned) return null;
  return cleaned.charAt(0).toLocaleUpperCase() + cleaned.slice(1).toLocaleLowerCase();
}

/** Find a friend by name, ignoring case. */
export function matchFriend(name: string, friends: Friend[]): Friend | undefined {
  const first = toFirstName(name);
  if (!first) return undefined;
  const key = first.toLocaleLowerCase();
  return friends.find((f) => f.name.toLocaleLowerCase() === key);
}

export type FriendResolution =
  | { kind: "existing"; friend: Friend }
  | { kind: "create"; name: string }
  | { kind: "none" };

/** Match an existing friend, or say which new friend to create. */
export function resolveFriend(name: string | null | undefined, friends: Friend[]): FriendResolution {
  if (!name) return { kind: "none" };
  const existing = matchFriend(name, friends);
  if (existing) return { kind: "existing", friend: existing };
  const first = toFirstName(name);
  return first ? { kind: "create", name: first } : { kind: "none" };
}

const URL_RE = /https?:\/\/\S+/gi;

export function extractUrls(body: string): string[] {
  return body.match(URL_RE) ?? [];
}

/** The text with links removed, trimmed. */
export function wordsWithoutLinks(body: string): string {
  return body.replace(URL_RE, " ").replace(/\s+/g, " ").trim();
}

/**
 * Where a card is filed when the text names no one: a link with no other
 * words is "From the internet", anything else is "From me".
 */
export function originWithoutFriend(body: string): Exclude<Origin, "friend"> {
  return extractUrls(body).length > 0 && wordsWithoutLinks(body) === "" ? "internet" : "me";
}
