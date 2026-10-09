import type { Card, Device, Friend, Household, PairingCode, RawMessage } from "@recco/core";

export interface Inbox {
  household: Household;
  friends: Friend[];
  /** Every card, including hidden ones. The API filters. */
  cards: Card[];
  pendingMessages: RawMessage[];
}

/**
 * Everything the services read and write. Two implementations: DynamoDB
 * (deployed) and in-memory (local runs and tests).
 */
export interface Store {
  createDevice(device: Device): Promise<void>;
  getDevice(deviceId: string): Promise<Device | null>;
  updateDevice(deviceId: string, changes: Partial<Omit<Device, "id">>): Promise<void>;

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

  listFriends(householdId: string): Promise<Friend[]>;
  putFriend(friend: Friend): Promise<void>;

  getCard(householdId: string, cardId: string): Promise<Card | null>;
  putCards(cards: Card[]): Promise<void>;

  putMessage(message: RawMessage): Promise<void>;
  getMessage(householdId: string, messageId: string): Promise<RawMessage | null>;
  updateMessage(householdId: string, messageId: string, changes: Partial<Pick<RawMessage, "status" | "error">>): Promise<void>;

  /** Records a provider message id. Returns false if it was already seen. */
  markSeen(providerMessageId: string): Promise<boolean>;
  /** Counts a dropped text. Nothing else about it is kept. */
  countDropped(): Promise<void>;
}
