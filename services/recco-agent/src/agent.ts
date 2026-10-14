import type { AgentJob } from "@recco/core";
import { generateText, hasToolCall, stepCountIs, type LanguageModel } from "ai";
import type { AgentDeps, RunContext } from "./context";
import { SYSTEM_PROMPT, userPrompt } from "./prompt";
import { saveCards } from "./save-cards";
import { findTitlesTool } from "./tools/find-titles";
import { listFriendsTool } from "./tools/list-friends";
import { readPostTool } from "./tools/read-post";
import { saveCardsTool } from "./tools/save-cards";

export interface AgentRunReport {
  model: string;
  steps: number;
  toolCalls: { tool: string; input: unknown }[];
  inputTokens?: number;
  outputTokens?: number;
  /** True when the model never called save_cards and her words were kept as an unsorted note. */
  fellBack: boolean;
}

/**
 * The Recco agent: reads one text with four tools and saves cards. Model calls
 * happen only here, never in the inbox API.
 */
export function createReccoAgent(deps: AgentDeps & { model: LanguageModel; modelName: string; timeoutMs?: number }) {
  return async (job: AgentJob): Promise<AgentRunReport> => {
    const household = await deps.store.getHousehold(job.householdId);
    const ctx: RunContext = {
      job,
      country: household?.country ?? "ca",
      deps,
      lookedUp: new Map(),
      posts: new Map(),
      result: null,
    };

    const result = await generateText({
      model: deps.model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt(job, ctx.country),
      tools: {
        read_post: readPostTool(ctx),
        find_titles: findTitlesTool(ctx),
        list_friends: listFriendsTool(ctx),
        save_cards: saveCardsTool(ctx),
      },
      stopWhen: [hasToolCall("save_cards"), stepCountIs(10)],
      maxOutputTokens: 1500,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(deps.timeoutMs ?? 40_000),
    });

    // The model must call save_cards once. If it did not, never invent: keep her words.
    const fellBack = !ctx.result;
    if (fellBack) ctx.result = await saveCards(job, [], new Set(), deps);

    return {
      model: deps.modelName,
      steps: result.steps.length,
      toolCalls: result.steps.flatMap((s) => s.toolCalls.map((c) => ({ tool: c.toolName, input: c.input }))),
      inputTokens: result.totalUsage?.inputTokens,
      outputTokens: result.totalUsage?.outputTokens,
      fellBack,
    };
  };
}
