/**
 * Title search helpers. OMDb matches whole words, so "Planes, Trains and
 * Automobiles" misses "Planes, Trains & Automobiles" (and returns clip
 * compilations that happen to contain the words instead). These turn one guess
 * into a few spellings and rank what comes back by how close it is.
 */

/** Lower-case words, accents and punctuation dropped, "&"/"and" and a leading "the" ignored. */
export function titleWords(raw: string): string[] {
  const words = raw
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w !== "and");
  return words[0] === "the" ? words.slice(1) : words;
}

/** Same words in any order: "Trains, Planes and Automobiles" is "Planes, Trains & Automobiles". */
export function isCloseMatch(guess: string, title: string): boolean {
  const a = titleWords(guess).sort().join(" ");
  return a !== "" && a === titleWords(title).sort().join(" ");
}

/** Share of words in common (0 to 1). Ranks the real title above "Con Air (1997) - Planes! Trains! And Automobiles!". */
export function closeness(guess: string, title: string): number {
  const a = new Set(titleWords(guess));
  const b = new Set(titleWords(title));
  const shared = [...a].filter((w) => b.has(w)).length;
  return shared / (new Set([...a, ...b]).size || 1);
}

/** The guess as written, then up to three other spellings worth searching. */
export function titleVariants(raw: string): string[] {
  const title = raw.trim().replace(/\s+/g, " ");
  const swapped = / & /.test(title) ? title.replace(/ & /g, " and ") : title.replace(/ and /gi, " & ");
  const plain = titleWords(title).join(" ");
  const seen = new Set<string>();
  return [title, swapped, plain].filter((v) => {
    const key = v.toLowerCase();
    if (!v || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
