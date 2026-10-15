import type { Card, Device, Friend, Household, PairingCode, RawMessage } from "@recco/core";

export interface Inbox {
  household: Household;
  friends: Friend[];
  /** Every card, including hidden ones. The API filters. */
  cards: Card[];
  pendingMessages: RawMessage[];
  /** The household's TVs, from its household TV items. */
  deviceIds: string[];
}

/**
 * Everything the services read and write. Two implementations: DynamoDB
 * (deployed) and in-memory (local runs and tests).
 */
export interface Store {
  createDevice(device: Device): Promise<void>;
  getDevice(deviceId: string): Promise<Device | null>;
  updateDevice(deviceId: string, changes: Partial<Omit<Device, "id">>): Promise<void>;
  /**
   * Pair a device to a household: sets its household, clears its pairing code,
   * writes the household TV item and removes the one in its old household.
   * Throws if the household no longer exists.
   */
  moveDevice(deviceId: string, householdId: string, pairedAt: string): Promise<void>;
  /** The ids of a household's TVs. */
  listHouseholdDevices(householdId: string): Promise<string[]>;

  /** Returns false if the code is already taken. */
  putPairingCode(code: PairingCode): Promise<boolean>;
  getPairingCode(code: string): Promise<PairingCode | null>;
  deletePairingCode(code: string): Promise<void>;

  getPhoneLink(phoneHash: string): Promise<string | null>;
  putPhoneLink(phoneHash: string, householdId: string): Promise<void>;

  createHousehold(household: Household): Promise<void>;
  getHousehold(householdId: string): Promise<Household | null>;
  /** Household, friends, cards and pending messages in one read. */
  getInbox(householdId: string): Promise<Inbox | null>;
  /** Gives the household a new channel id. Returns the old one, or null if the household is gone. */
  rotateChannel(householdId: string, channelId: string): Promise<string | null>;
  /**
   * Forget a household (R11.1): its META first, so every reader treats it as
   * gone, then its cards, friends and messages, then each TV's device item,
   * and the phone link last. Hard deletes only. Idempotent, so calling it again
   * finishes a delete that stopped partway; pass `phoneHash` when the caller
   * knows it, in case META is already gone. Returns the household as it was,
   * or null if META was already gone.
   */
  deleteHousehold(householdId: string, options?: { phoneHash?: string }): Promise<Household | null>;

  listFriends(householdId: string): Promise<Friend[]>;
  putFriend(friend: Friend): Promise<void>;

  getCard(householdId: string, cardId: string): Promise<Card | null>;
  putCards(cards: Card[]): Promise<void>;

  putMessage(message: RawMessage): Promise<void>;
  getMessage(householdId: string, messageId: string): Promise<RawMessage | null>;
  updateMessage(householdId: string, messageId: string, changes: Partial<Pick<RawMessage, "status" | "error" | "mergedInto">>): Promise<void>;

  /** Records a provider message id. Returns false if it was already seen. */
  markSeen(providerMessageId: string): Promise<boolean>;
  /** Counts a dropped text. Nothing else about it is kept. */
  countDropped(): Promise<void>;
}
