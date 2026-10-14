import { extractUrls, toFirstName, wordsWithoutLinks, type Candidate, type TitleFacts } from "@recco/core";
import type { TitleCandidate } from "@recco/sources";
import { tool } from "ai";
import { z } from "zod";
import type { RunContext } from "../context";
import { saveCards, unsortedTitle, type DraftCard } from "../save-cards";

const cardInput = z.object({
  imdbId: z.string().nullable().describe("From find_titles. null only for an unsorted note when nothing matched."),
  friendName: z.string().nullable().describe("First name of who recommended it, as written in the text, or null"),
  note: z.string().nullable().describe("Her own words from the text, copied exactly, or null"),
  needsCheck: z.boolean().describe("true when it is unclear which candidate she meant"),
  candidateImdbIds: z.array(z.string()).max(3).describe("When needsCheck: up to three candidates from find_titles, best first. Otherwise []"),
});

export type SaveCardsInput = z.infer<typeof cardInput>;

/**
 * Plain code, not a model call: turns the agent's picks into cards, checks
 * them, writes them and tells the TVs. Rejects ids that find_titles did not
 * return in this run. Callable once.
 */
export function saveCardsTool(ctx: RunContext) {
  return tool({
    description: "Save the finished cards. Call exactly once, with every card.",
    inputSchema: z.object({
      groupTitle: z
        .string()
        .max(60)
        .nullable()
        .optional()
        .describe('With two or more cards: a short name for the stack, 2 to 5 words, in title case, e.g. "Thanksgiving Movie Night". null for one card.'),
      suggestions: z
        .boolean()
        .optional()
        .describe("true only when she asked for ideas and these are titles you picked. Omit when the titles came from her text or a post."),
      cards: z.array(cardInput).max(10),
    }),
    execute: async ({ groupTitle, suggestions, cards }) => {
      if (ctx.result) return { error: "save_cards was already called. Stop." };
      const drafts = await Promise.all(cards.map((c) => toDraft(ctx, c)));
      ctx.result = await saveCards(ctx.job, drafts, new Set(ctx.lookedUp.keys()), ctx.deps, { groupTitle, suggestions });
      return { saved: ctx.result.saved.length, rejected: ctx.result.rejected };
    },
  });
}

export async function toDraft(ctx: RunContext, input: SaveCardsInput): Promise<DraftCard> {
  const body = ctx.job.body;
  const friendName = friendNamedInText(input.friendName, body);
  const note = herWords(input.note, body);
  const sourceUrl = extractUrls(body)[0];

  if (!input.imdbId && !input.needsCheck) {
    return { kind: "unsorted", title: unsortedTitle(body), note: body.trim(), sourceUrl, friendName };
  }

  if (input.needsCheck) {
    const ids = input.candidateImdbIds.length > 0 ? input.candidateImdbIds : input.imdbId ? [input.imdbId] : [];
    const candidates: Candidate[] = await Promise.all(
      ids.map(async (id) => {
        const c = ctx.lookedUp.get(id);
        // Unknown ids pass through so save_cards rejects them, rather than being silently dropped.
        if (!c) return { titleId: id, title: "?", type: "unknown" as const };
        return { titleId: id, title: c.title, year: c.year, type: c.type, plot: c.plot, posterUrl: c.posterUrl, ...factsOf(c) };
      }),
    );
    return { kind: "title", title: candidates[0]?.title ?? "?", needsCheck: true, candidates, friendName, note, sourceUrl };
  }

  const c = await withDetails(ctx, ctx.lookedUp.get(input.imdbId!));
  return {
    kind: "title",
    titleId: input.imdbId!,
    title: c?.title ?? "?",
    year: c?.year,
    type: c?.type,
    plot: c?.plot,
    posterUrl: c?.posterUrl,
    ...(c ? factsOf(c) : {}),
    friendName,
    note,
    sourceUrl,
  };
}

/**
 * Search results only carry details for the leading few. A chosen title further
 * down gets one details call (cached) for its plot and ratings; a failure costs
 * only those.
 */
async function withDetails(ctx: RunContext, c: TitleCandidate | undefined): Promise<TitleCandidate | undefined> {
  if (!c || c.plot || c.imdbRating || c.runtime) return c;
  const more = await ctx.deps.sources.titles.details(c.imdbId).catch(() => null);
  return more ? { ...c, ...more } : c;
}

function factsOf(c: TitleFacts): TitleFacts {
  return { imdbRating: c.imdbRating, rtRating: c.rtRating, runtime: c.runtime, genre: c.genre };
}

const squash = (s: string) => s.toLocaleLowerCase().replace(/\s+/g, " ").trim();

/** A friend must be named in her text; names from a post (or invented) are dropped. */
export function friendNamedInText(name: string | null, body: string): string | null {
  const first = name ? toFirstName(name) : null;
  if (!first) return null;
  const words = squash(wordsWithoutLinks(body)).split(/[^\p{L}'-]+/u);
  return words.includes(first.toLocaleLowerCase()) ? first : null;
}

/** Her note must be her words. If the model reworded it, keep her whole text instead. */
export function herWords(note: string | null, body: string): string | undefined {
  if (!note?.trim()) return undefined;
  const words = wordsWithoutLinks(body);
  return squash(words).includes(squash(note)) ? note.trim() : words || undefined;
}
