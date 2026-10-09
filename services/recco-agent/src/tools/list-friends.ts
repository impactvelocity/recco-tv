import { tool } from "ai";
import { z } from "zod";
import type { RunContext } from "../context";

/** The household's friends, so a name can be matched to an existing one. */
export function listFriendsTool(ctx: RunContext) {
  return tool({
    description: "List the first names of friends this household already has.",
    inputSchema: z.object({}),
    execute: async () => ({
      friends: (await ctx.deps.store.listFriends(ctx.job.householdId)).map((f) => f.name),
    }),
  });
}
