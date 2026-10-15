import type { ReccoEvent } from "@recco/core";
import type { Publisher } from "./publisher";

/** The namespace every Recco channel lives in. */
export const CHANNEL_NAMESPACE = "recco";

/**
 * AppSync Events channel for a household or device. Channel segments allow
 * only letters, digits and dashes, so the id's underscores become dashes.
 */
export function channelPath(channelId: string): string {
  return `/${CHANNEL_NAMESPACE}/${channelId.replace(/[^A-Za-z0-9-]/g, "-").slice(0, 50)}`;
}

export interface AppSyncEventsConfig {
  httpDomain: string;
  realtimeDomain: string;
  /** Demo auth. Production needs a Lambda authoriser tied to the device token (decisions.md). */
  apiKey: string;
}

/** Publishes live updates over the AppSync Events HTTP endpoint. */
export class AppSyncEventsPublisher implements Publisher {
  constructor(private readonly config: AppSyncEventsConfig) {}

  async publish(channelId: string, event: ReccoEvent) {
    const res = await fetch(`https://${this.config.httpDomain}/event`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": this.config.apiKey },
      body: JSON.stringify({ channel: channelPath(channelId), events: [JSON.stringify(event)] }),
    });
    if (!res.ok) {
      // A missed live update is not fatal: TVs fall back to polling. Log and carry on.
      // Status only: the response can echo the event, and events carry cards.
      console.error(`AppSync publish failed: ${res.status}`);
    }
  }
}
