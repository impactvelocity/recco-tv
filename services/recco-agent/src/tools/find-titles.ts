import { tool } from "ai";
import { z } from "zod";
import type { RunContext } from "../context";

/** Looks up a title guess. Every saved card's imdbId must come from here. */
export function findTitlesTool(ctx: RunContext) {
  return tool({
    description: "Look up a show or movie by title. Returns up to five candidates with their imdbId. Call it for every title before saving.",
    inputSchema: z.object({
      title: z.string().min(1).max(200),
      year: z.string().regex(/^\d{4}$/).optional().describe("Release year, only if the text or post gives one"),
      type: z.enum(["movie", "series"]).optional().describe("Only if the text or post says which"),
    }),
    execute: async (query) => {
      const found = await ctx.deps.sources.titles.search(query);
      for (const c of found) ctx.lookedUp.set(c.imdbId, c);
      if (found.length === 0) return { candidates: [], note: "No match. Do not invent one." };
      return {
        candidates: found.map((c) => ({ imdbId: c.imdbId, title: c.title, year: c.year ?? null, type: c.type, plot: c.plot ?? null })),
      };
    },
  });
}
