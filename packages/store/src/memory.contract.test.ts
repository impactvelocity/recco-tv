import { MemoryStore } from "./memory";
import { storeContract } from "./contract";

storeContract("memory", async () => new MemoryStore(), async (store, householdId) => {
  const m = store as MemoryStore;
  const found: string[] = [];
  if (m.households.has(householdId)) found.push("household");
  if (m.householdDevices.get(householdId)?.size) found.push("household TVs");
  for (const [name, map] of Object.entries({ cards: m.cards, friends: m.friends, messages: m.messages, devices: m.devices })) {
    for (const [id, item] of map as Map<string, { householdId?: string }>) if (item.householdId === householdId) found.push(`${name}:${id}`);
  }
  for (const [hash, id] of m.phoneLinks) if (id === householdId) found.push(`phone:${hash}`);
  return found;
});
