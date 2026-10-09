import type { ReccoEvent } from "@recco/core";

/** Sends live updates to TVs. AppSync Events when deployed; in memory locally. */
export interface Publisher {
  publish(channelId: string, event: ReccoEvent): Promise<void>;
}

export class MemoryPublisher implements Publisher {
  readonly sent: { channelId: string; event: ReccoEvent }[] = [];
  private listeners = new Set<(channelId: string, event: ReccoEvent) => void>();

  async publish(channelId: string, event: ReccoEvent) {
    this.sent.push({ channelId, event });
    for (const l of this.listeners) l(channelId, event);
  }

  onPublish(listener: (channelId: string, event: ReccoEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
