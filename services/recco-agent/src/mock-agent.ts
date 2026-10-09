import { extractUrls, wordsWithoutLinks, type AgentJob, type Candidate } from "@recco/core";
import { findFixturePost, fixtureTitlesIn, searchFixtureTitles, type FixtureTitle } from "@recco/sources";
import { saveCards, type DraftCard, type SaveCardsDeps } from "./save-cards";
import type { Agent } from "./run-job";

/**
 * MOCK_AGENT=1: no model and no outside APIs. Reads texts with simple rules
 * and recorded fixtures, then goes through the same save_cards as the real
 * agent. Good enough for the demo phrasing in product.md.
 */
export function createMockAgent(deps: SaveCardsDeps): Agent {
  return async (job: AgentJob) => {
    const { drafts, lookedUp } = readText(job.body);
    await saveCards(job, drafts, lookedUp, deps);
  };
}

const FRIEND_PATTERNS = [
  /\b(\p{L}[\p{L}'-]*) (?:said|says|sent|recommended|recommends|thinks|loved|loves|swears)\b/iu,
  /\bfrom (\p{L}[\p{L}'-]*)\b/iu,
  /^(\p{L}[\p{L}'-]*):/u,
];
const NOT_NAMES = new Set([
  "i", "it", "this", "that", "the", "my", "me", "you", "he", "she", "they", "we", "everyone", "someone",
  "tiktok", "instagram", "youtube", "reddit", "twitter", "work", "mom", "dad",
]);

export function guessFriend(words: string): string | null {
  for (const re of FRIEND_PATTERNS) {
    const name = words.match(re)?.[1];
    if (name && !NOT_NAMES.has(name.toLowerCase())) return name;
  }
  return null;
}

const SEPARATOR = /\s+[-–—|]\s+|\s*:\s+/;

export function readText(body: string): { drafts: DraftCard[]; lookedUp: Set<string> } {
  const lookedUp = new Set<string>();
  const words = wordsWithoutLinks(body);
  const link = extractUrls(body)[0];
  const friendName = guessFriend(words);

  const toDraft = (matches: FixtureTitle[], note: string | undefined): DraftCard | null => {
    for (const m of matches) lookedUp.add(m.imdbId);
    const [first, ...rest] = matches;
    if (!first) return null;
    if (rest.length > 0) {
      return {
        kind: "title",
        title: first.title,
        needsCheck: true,
        candidates: matches.slice(0, 3).map(toCandidate),
        friendName,
        note,
      };
    }
    return { kind: "title", ...fromFixture(first), friendName, note };
  };

  if (link) {
    const post = findFixturePost(link);
    const named = post ? fixtureTitlesIn(`${post.caption}. ${post.transcript}`) : fixtureTitlesIn(words);
    const note = words || undefined;
    const drafts = named.flatMap((t) => toDraft(searchFixtureTitles(t.title), note) ?? []);
    return { drafts, lookedUp };
  }

  const [guess = "", ...restParts] = words.split(SEPARATOR);
  const note = restParts.length > 0 ? words.slice(guess.length).replace(SEPARATOR, "").trim() : undefined;
  const draft = toDraft(searchFixtureTitles(guess), note) ?? toDraft(fixtureTitlesIn(words).slice(0, 1), note);
  return { drafts: draft ? [draft] : [], lookedUp };
}

function fromFixture(t: FixtureTitle) {
  return { titleId: t.imdbId, title: t.title, year: t.year, type: t.type, plot: t.plot, services: t.services };
}

function toCandidate(t: FixtureTitle): Candidate {
  return { titleId: t.imdbId, title: t.title, year: t.year, type: t.type, plot: t.plot, services: t.services };
}
