import type { Publisher } from "./publisher";
import type { Store } from "./store";

/**
 * Forget me (R11.1, R11.5): delete everything the household holds, then tell
 * its TVs. Used by `DELETE /household`, a "FORGET ME" text, and a move that
 * leaves a household with no TVs. Safe to call again.
 */
export async function forgetHousehold(store: Store, publisher: Publisher, householdId: string, options: { phoneHash?: string } = {}): Promise<void> {
  const household = await store.deleteHousehold(householdId, options);
  if (household) await publisher.publish(household.channelId, { type: "household.deleted" });
}
