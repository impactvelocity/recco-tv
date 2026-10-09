import { MockLanguageModelV4 } from "ai/test";

type Call = { tool: string; input: unknown };

/**
 * A model that plays back a script: each entry is one step's tool calls, or
 * "stop" to answer with text. For testing the agent loop without a real model.
 */
export function scriptedModel(script: (Call[] | "stop")[]) {
  let id = 0;
  const usage = {
    inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 5, text: 5, reasoning: 0 },
  };
  return new MockLanguageModelV4({
    doGenerate: script.map((step) =>
      step === "stop"
        ? { content: [{ type: "text" as const, text: "Done." }], finishReason: { unified: "stop" as const, raw: "stop" }, usage, warnings: [] }
        : {
            content: step.map((c) => ({
              type: "tool-call" as const,
              toolCallId: `call_${++id}`,
              toolName: c.tool,
              input: JSON.stringify(c.input),
            })),
            finishReason: { unified: "tool-calls" as const, raw: "tool_use" },
            usage,
            warnings: [],
          },
    ) as any,
  });
}
