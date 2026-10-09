import type { AgentJob } from "@recco/core";
import type { Post, Sources, TitleCandidate } from "@recco/sources";
import type { SaveCardsDeps, SaveCardsResult } from "./save-cards";

export interface AgentDeps extends SaveCardsDeps {
  sources: Sources;
}

/** What one run of the agent knows. Tools read and write it; nothing outlives the run. */
export interface RunContext {
  job: AgentJob;
  country: string;
  deps: AgentDeps;
  /** Every title find_titles returned in this run. Only these ids can be saved. */
  lookedUp: Map<string, TitleCandidate>;
  services: Map<string, string[]>;
  posts: Map<string, Post>;
  result: SaveCardsResult | null;
}

/** Services for a title, or none when availability cannot be fetched (R5.3). */
export async function servicesFor(ctx: RunContext, imdbId: string): Promise<string[]> {
  const known = ctx.services.get(imdbId);
  if (known) return known;
  const found = await ctx.deps.sources.availability.services(imdbId, ctx.country).catch(() => []);
  ctx.services.set(imdbId, found);
  return found;
}
