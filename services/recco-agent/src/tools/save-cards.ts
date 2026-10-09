import { extractUrls, toFirstName, wordsWithoutLinks, type Candidate } from "@recco/core";
import { tool } from "ai";
import { z } from "zod";
import { servicesFor, type RunContext } from "../context";
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
    inputSchema: z.object({ cards: z.array(cardInput).max(10) }),
    execute: async ({ cards }) => {
      if (ctx.result) return { error: "save_cards was already called. Stop." };
      const drafts = await Promise.all(cards.map((c) => toDraft(ctx, c)));
      ctx.result = await saveCards(ctx.job, drafts, new Set(ctx.lookedUp.keys()), ctx.deps);
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
        return { titleId: id, title: c.title, year: c.year, type: c.type, plot: c.plot, posterUrl: c.posterUrl, services: await servicesFor(ctx, id) };
      }),
    );
    return { kind: "title", title: candidates[0]?.title ?? "?", needsCheck: true, candidates, friendName, note, sourceUrl };
  }

  const c = ctx.lookedUp.get(input.imdbId!);
  return {
    kind: "title",
    titleId: input.imdbId!,
    title: c?.title ?? "?",
    year: c?.year,
    type: c?.type,
    plot: c?.plot,
    posterUrl: c?.posterUrl,
    services: c ? await servicesFor(ctx, c.imdbId) : [],
    friendName,
    note,
    sourceUrl,
  };
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
