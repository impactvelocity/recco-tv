import { createGateway, gateway } from "@ai-sdk/gateway";
import type { LanguageModel } from "ai";

/**
 * The agent's model, reached through Vercel AI Gateway with the Vercel AI SDK.
 *
 * Why not Amazon Bedrock (the original plan)?
 * New AWS accounts often cannot use Bedrock on-demand inference reliably.
 * AWS states that the quotas applied to an account "might be lower than the
 * default values" depending on "account age, usage history, payment history",
 * and that quota increases "aren't granted automatically"
 * (https://docs.aws.amazon.com/bedrock/latest/userguide/quotas.html). On a fresh
 * hackathon account that can mean ThrottlingException at very low volume, or
 * tokens-per-minute/day quotas too small to run the agent at all, until a
 * Service Quotas request is approved. AI Gateway gives the same models
 * (including Amazon Nova as `amazon/nova-2-lite`) with no per-account quota wait.
 *
 * To go back to Bedrock once the account has quota: add `@ai-sdk/amazon-bedrock`
 * and return `bedrock("amazon.nova-2-lite-v1:0")` (or a Claude inference profile)
 * here. Nothing else in the agent changes. See docs/decisions.md.
 */
export const DEFAULT_MODEL = "anthropic/claude-haiku-5.5";

export interface ModelEnv {
  /** A gateway model id, e.g. "anthropic/claude-haiku-5.5" or "amazon/nova-2-lite". */
  RECCO_MODEL?: string;
  /** Gateway auth. `vercel env pull` provides VERCEL_OIDC_TOKEN instead. */
  AI_GATEWAY_API_KEY?: string;
  VERCEL_OIDC_TOKEN?: string;
}

export function modelId(env: ModelEnv): string {
  return env.RECCO_MODEL || DEFAULT_MODEL;
}

export function createModel(env: ModelEnv): LanguageModel {
  // An explicit key (e.g. read from Secrets Manager) wins; otherwise the gateway reads the environment.
  return env.AI_GATEWAY_API_KEY ? createGateway({ apiKey: env.AI_GATEWAY_API_KEY })(modelId(env)) : gateway(modelId(env));
}

export function hasModelCredentials(env: ModelEnv): boolean {
  return !!(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN);
}
