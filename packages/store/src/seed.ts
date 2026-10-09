import { hashDeviceToken, hashPhone, phoneLast4, type Card, type Friend, type Household } from "@recco/core";
import type { MemoryStore } from "./memory";

/**
 * Demo data for local runs. Titles are real shows so the demo reads naturally;
 * plots are our own one-line summaries and services are illustrative.
 */
export const DEMO = {
  householdId: "hh_demo",
  phone: "+16045551234",
  deviceId: "dev_demo",
  /** Local only. Real tokens are random. */
  deviceToken: "dev_demo.local-demo-token",
  friendIds: { jordan: "fr_jordan", steph: "fr_steph", priya: "fr_priya" },
} as const;

export async function seedDemo(store: MemoryStore, salt: string, now = new Date()): Promise<void> {
  const created = new Date(now.getTime() - 14 * 86_400_000).toISOString();
  const household: Household = {
    id: DEMO.householdId,
    country: "ca",
    phoneLast4: phoneLast4(DEMO.phone),
    channelId: "ch_demo_household",
    createdAt: created,
  };
  await store.createHousehold(household);
  await store.putPhoneLink(hashPhone(DEMO.phone, salt), household.id);

  await store.createDevice({
    id: DEMO.deviceId,
    tokenHash: hashDeviceToken(DEMO.deviceToken),
    channelId: "ch_demo_device",
    createdAt: created,
    householdId: household.id,
    pairedAt: created,
  });

  const friend = (id: string, name: string): Friend => ({ id, householdId: household.id, name, createdAt: created });
  const { jordan, steph, priya } = DEMO.friendIds;
  await store.putFriend(friend(jordan, "Jordan"));
  await store.putFriend(friend(steph, "Steph"));
  await store.putFriend(friend(priya, "Priya"));

  let n = 0;
  const card = (c: Partial<Card> & Pick<Card, "title" | "titleId">): Card => {
    n += 1;
    const at = new Date(now.getTime() - (13 - n) * 3_600_000 * 7).toISOString();
    return {
      id: `card_demo_${String(n).padStart(2, "0")}`,
      householdId: household.id,
      createdAt: at,
      kind: "title",
      type: "series",
      services: [],
      origin: "me",
      source: "text",
      state: "new",
      needsCheck: false,
      candidates: [],
      messageId: `msg_demo_${String(n).padStart(2, "0")}`,
      ...c,
    };
  };

  await store.putCards([
    card({ title: "Slow Horses", titleId: "tt5875444", year: "2022–", plot: "Washed-up spies in a backwater office keep stumbling into real cases.", services: ["Apple TV+"], origin: "friend", friendId: jordan, note: "best spy show going", state: "watched", rating: "up" }),
    card({ title: "The Bear", titleId: "tt14452776", year: "2022–", plot: "A fine-dining chef comes home to run his late brother's sandwich shop.", services: ["Disney+"], origin: "friend", friendId: jordan, note: "stressful but so good", state: "watched", rating: "up" }),
    card({ title: "The Rehearsal", titleId: "tt10802170", year: "2022–", plot: "A comedian helps people rehearse life's hard conversations with elaborate sets.", services: ["Crave"], origin: "friend", friendId: jordan, note: "you have to see it to believe it", state: "watched", rating: "down" }),
    card({ title: "Shrinking", titleId: "tt15677150", year: "2023–", plot: "A grieving therapist starts telling his clients exactly what he thinks.", services: ["Apple TV+"], origin: "friend", friendId: jordan, state: "watched", rating: "up" }),
    card({ title: "Past Lives", titleId: "tt13238346", year: "2023", type: "movie", plot: "Two childhood friends reconnect across decades and continents.", services: ["Prime Video"], origin: "friend", friendId: priya, note: "bring tissues", state: "starred" }),
    card({ title: "Paddington 2", titleId: "tt4468740", year: "2017", type: "movie", plot: "A polite bear is framed for theft and wins over a prison.", services: ["Netflix"], origin: "friend", friendId: steph, note: "trust me", state: "starred" }),
    card({ title: "Arrival", titleId: "tt2543164", year: "2016", type: "movie", plot: "A linguist is asked to talk to visitors who have landed around the world.", services: ["Netflix", "Prime Video"], origin: "internet", source: "link", sourceUrl: "https://www.youtube.com/watch?v=demo" }),
    card({ title: "Abbott Elementary", titleId: "tt14218830", year: "2021–", plot: "A documentary crew follows teachers at an underfunded Philadelphia school.", services: ["Disney+"], origin: "friend", friendId: steph, note: "Steph sent this", source: "link", sourceUrl: "https://www.tiktok.com/@demo/video/1", groupId: "grp_demo_tiktok" }),
    card({ title: "Hacks", titleId: "tt14614750", year: "2021–", plot: "A legendary stand-up and a young writer reluctantly work together.", services: ["Crave"], origin: "friend", friendId: steph, note: "Steph sent this", source: "link", sourceUrl: "https://www.tiktok.com/@demo/video/1", groupId: "grp_demo_tiktok" }),
    card({ title: "Severance", titleId: "tt11280740", year: "2022–", plot: "Office workers have their work and home memories surgically split.", services: ["Apple TV+"] }),
    card({ title: "The Office", titleId: undefined, year: undefined, origin: "friend", friendId: priya, note: "Priya says the original is better", needsCheck: true, candidates: [
      { titleId: "tt0290978", title: "The Office", year: "2001–2003", type: "series", plot: "A mockumentary about a paper company's painfully self-assured manager in Slough.", services: ["BritBox"] },
      { titleId: "tt0386676", title: "The Office", year: "2005–2013", type: "series", plot: "A mockumentary about the staff of a Scranton paper company.", services: ["Prime Video"] },
    ] }),
    card({ title: "The King of Queens", titleId: "tt0165581", year: "1998–2007", plot: "A delivery driver, his wife, and her father share a house in Queens.", services: ["Prime Video"], origin: "friend", friendId: jordan, note: "said it was funny and worth watching" }),
  ]);
}
