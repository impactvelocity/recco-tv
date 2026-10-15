/**
 * A text that deletes the household (R11.4): exactly "forget me", ignoring
 * case, surrounding spaces and trailing punctuation. Anything longer is a
 * normal text, so a title like "Forget Me Not" still becomes a card. Not
 * "STOP": carriers treat that as an opt-out keyword.
 */
export function isForgetCommand(body: string): boolean {
  return /^forget\s+me[\s.!?]*$/i.test(body.trim());
}

/**
 * What pairing a TV does to its households (design.md, "Moving a TV").
 *
 * join  – the TV had no household: attach it.
 * stay  – already in the phone's household: refresh pairedAt.
 * move  – leave `from` for the phone's household. The old household is
 *         forgotten if no other TV uses it (R1.8), otherwise it gets a new
 *         channel id so the TV that left stops hearing it (R1.9).
 */
export type MovePlan =
  | { kind: "join" }
  | { kind: "stay" }
  | { kind: "move"; from: string; leaving: "forget" | "rotate" };

export function planMove(
  deviceId: string,
  currentHouseholdId: string | undefined,
  targetHouseholdId: string,
  /** The TVs of the current household, read before the move. */
  currentHouseholdTvs: readonly string[],
): MovePlan {
  if (!currentHouseholdId) return { kind: "join" };
  if (currentHouseholdId === targetHouseholdId) return { kind: "stay" };
  const others = currentHouseholdTvs.filter((id) => id !== deviceId);
  return { kind: "move", from: currentHouseholdId, leaving: others.length === 0 ? "forget" : "rotate" };
}
