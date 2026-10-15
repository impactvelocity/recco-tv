import { hashDeviceToken, hashPhone, phoneLast4, type Card, type Friend, type Household, type TitleFacts } from "@recco/core";
import type { MemoryStore } from "./memory";

/**
 * Demo data for local runs. Titles are real shows so the demo reads naturally;
 * plots are our own one-line summaries; services and ratings are illustrative.
 */
export const DEMO = {
  householdId: "hh_demo",
  phone: "+16045551234",
  deviceId: "dev_demo",
  /** Local only. Real tokens are random. */
  deviceToken: "dev_demo.local-demo-token",
  friendIds: { jordan: "fr_jordan", steph: "fr_steph", priya: "fr_priya" },
} as const;

const FACTS: Record<string, TitleFacts> = {
  tt5875444: { imdbRating: "8.2", rtRating: "98%", runtime: "45 min", genre: "Spy drama" },
  tt14452776: { imdbRating: "8.5", rtRating: "99%", runtime: "30 min", genre: "Drama" },
  tt10802170: { imdbRating: "8.4", rtRating: "96%", runtime: "30 min", genre: "Comedy" },
  tt15677150: { imdbRating: "8.0", rtRating: "91%", runtime: "30 min", genre: "Comedy" },
  tt13238346: { imdbRating: "7.8", rtRating: "95%", runtime: "1h 46m", genre: "Romance" },
  tt4468740: { imdbRating: "7.8", rtRating: "99%", runtime: "1h 43m", genre: "Family" },
  tt2543164: { imdbRating: "7.9", rtRating: "94%", runtime: "1h 56m", genre: "Sci-fi" },
  tt14218830: { imdbRating: "8.2", rtRating: "98%", runtime: "22 min", genre: "Comedy" },
  tt14614750: { imdbRating: "8.2", rtRating: "100%", runtime: "30 min", genre: "Comedy" },
  tt11280740: { imdbRating: "8.7", rtRating: "97%", runtime: "50 min", genre: "Thriller" },
  tt0165581: { imdbRating: "7.4", rtRating: "65%", runtime: "22 min", genre: "Sitcom" },
};

export async function seedDemo(store: MemoryStore, salt: string, now = new Date()): Promise<void> {
  const created = new Date(now.getTime() - 14 * 86_400_000).toISOString();
  const household: Household = {
    id: DEMO.householdId,
    country: "ca",
    phoneLast4: phoneLast4(DEMO.phone),
    phoneHash: hashPhone(DEMO.phone, salt),
    channelId: "ch_demo_household",
    createdAt: created,
  };
  await store.createHousehold(household);
  await store.putPhoneLink(household.phoneHash, household.id);

  await store.createDevice({
    id: DEMO.deviceId,
    tokenHash: hashDeviceToken(DEMO.deviceToken),
    channelId: "ch_demo_device",
    createdAt: created,
  });
  await store.moveDevice(DEMO.deviceId, household.id, created);

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
      origin: "me",
      source: "text",
      state: "new",
      needsCheck: false,
      candidates: [],
      messageId: `msg_demo_${String(n).padStart(2, "0")}`,
      ...(c.titleId ? FACTS[c.titleId] : {}),
      ...c,
    };
  };

  await store.putCards([
    card({ title: "Slow Horses", titleId: "tt5875444", year: "2022–", plot: "Washed-up spies in a backwater office keep stumbling into real cases.", origin: "friend", friendId: jordan, note: "best spy show going", state: "watched", rating: "up" }),
    card({ title: "The Bear", titleId: "tt14452776", year: "2022–", plot: "A fine-dining chef comes home to run his late brother's sandwich shop.", origin: "friend", friendId: jordan, note: "stressful but so good", state: "watched", rating: "up" }),
    card({ title: "The Rehearsal", titleId: "tt10802170", year: "2022–", plot: "A comedian helps people rehearse life's hard conversations with elaborate sets.", origin: "friend", friendId: jordan, note: "you have to see it to believe it", state: "watched", rating: "down" }),
    card({ title: "Shrinking", titleId: "tt15677150", year: "2023–", plot: "A grieving therapist starts telling his clients exactly what he thinks.", origin: "friend", friendId: jordan, state: "watched", rating: "up" }),
    card({ title: "Past Lives", titleId: "tt13238346", year: "2023", type: "movie", plot: "Two childhood friends reconnect across decades and continents.", origin: "friend", friendId: priya, note: "bring tissues", state: "starred" }),
    card({ title: "Paddington 2", titleId: "tt4468740", year: "2017", type: "movie", plot: "A polite bear is framed for theft and wins over a prison.", origin: "friend", friendId: steph, note: "trust me", state: "starred" }),
    card({ title: "Arrival", titleId: "tt2543164", year: "2016", type: "movie", plot: "A linguist is asked to talk to visitors who have landed around the world.", origin: "internet", source: "link", sourceUrl: "https://www.youtube.com/watch?v=demo" }),
    card({ title: "Abbott Elementary", titleId: "tt14218830", year: "2021–", plot: "A documentary crew follows teachers at an underfunded Philadelphia school.", origin: "friend", friendId: steph, note: "Steph sent this", source: "link", sourceUrl: "https://www.tiktok.com/@demo/video/1", groupId: "grp_demo_tiktok" }),
    card({ title: "Hacks", titleId: "tt14614750", year: "2021–", plot: "A legendary stand-up and a young writer reluctantly work together.", origin: "friend", friendId: steph, note: "Steph sent this", source: "link", sourceUrl: "https://www.tiktok.com/@demo/video/1", groupId: "grp_demo_tiktok" }),
    card({ title: "Severance", titleId: "tt11280740", year: "2022–", plot: "Office workers have their work and home memories surgically split." }),
    card({ title: "The Office", titleId: undefined, year: undefined, origin: "friend", friendId: priya, note: "Priya says the original is better", needsCheck: true, candidates: [
      { titleId: "tt0290978", title: "The Office", year: "2001–2003", type: "series", plot: "A mockumentary about a paper company's painfully self-assured manager in Slough." },
      { titleId: "tt0386676", title: "The Office", year: "2005–2013", type: "series", plot: "A mockumentary about the staff of a Scranton paper company." },
    ] }),
    card({ title: "The King of Queens", titleId: "tt0165581", year: "1998–2007", plot: "A delivery driver, his wife, and her father share a house in Queens.", origin: "friend", friendId: jordan, note: "said it was funny and worth watching" }),
    // A second friend sending a show already in the list: the TV shows one tile with both.
    card({ title: "The Bear", titleId: "tt14452776", year: "2022–", plot: "A fine-dining chef comes home to run his late brother's sandwich shop.", origin: "friend", friendId: priya, note: "Also The Bear. Intense but so good" }),
  ]);
}
