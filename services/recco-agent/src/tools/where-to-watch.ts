import { tool } from "ai";
import { z } from "zod";
import { servicesFor, type RunContext } from "../context";

/** Which services carry a title in the household's country. save_cards also fills this in. */
export function whereToWatchTool(ctx: RunContext) {
  return tool({
    description: "List the streaming services that carry a title in the household's country.",
    inputSchema: z.object({ imdbId: z.string().describe("An imdbId returned by find_titles") }),
    execute: async ({ imdbId }) => {
      if (!ctx.lookedUp.has(imdbId)) return { error: "Look the title up with find_titles first." };
      return { services: await servicesFor(ctx, imdbId) };
    },
  });
}
