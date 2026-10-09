import type { Card, Device, Friend, Household, PairingCode, RawMessage } from "@recco/core";
import type { Inbox, Store } from "./store";

const clone = <T>(value: T): T => structuredClone(value);

/** In-memory store for local runs and tests. Same behaviour as DynamoDB, no AWS. */
export class MemoryStore implements Store {
  readonly devices = new Map<string, Device>();
  readonly pairingCodes = new Map<string, PairingCode>();
  readonly phoneLinks = new Map<string, string>();
  readonly households = new Map<string, Household>();
  readonly friends = new Map<string, Friend>();
  readonly cards = new Map<string, Card>();
  readonly messages = new Map<string, RawMessage>();
  readonly seen = new Set<string>();
  dropped = 0;

  async createDevice(device: Device) {
    if (this.devices.has(device.id)) throw new Error(`Device ${device.id} exists`);
    this.devices.set(device.id, clone(device));
  }

  async getDevice(deviceId: string) {
    const d = this.devices.get(deviceId);
    return d ? clone(d) : null;
  }

  async updateDevice(deviceId: string, changes: Partial<Omit<Device, "id">>) {
    const d = this.devices.get(deviceId);
    if (!d) throw new Error(`No device ${deviceId}`);
    this.devices.set(deviceId, { ...d, ...clone(changes) });
  }

  async putPairingCode(code: PairingCode) {
    if (this.pairingCodes.has(code.code)) return false;
    this.pairingCodes.set(code.code, clone(code));
    return true;
  }

  async getPairingCode(code: string) {
    const c = this.pairingCodes.get(code);
    return c ? clone(c) : null;
  }

  async deletePairingCode(code: string) {
    this.pairingCodes.delete(code);
  }

  async getPhoneLink(phoneHash: string) {
    return this.phoneLinks.get(phoneHash) ?? null;
  }

  async putPhoneLink(phoneHash: string, householdId: string) {
    this.phoneLinks.set(phoneHash, householdId);
  }

  async createHousehold(household: Household) {
    this.households.set(household.id, clone(household));
  }

  async getHousehold(householdId: string) {
    const h = this.households.get(householdId);
    return h ? clone(h) : null;
  }

  async getInbox(householdId: string): Promise<Inbox | null> {
    const household = await this.getHousehold(householdId);
    if (!household) return null;
    return {
      household,
      friends: await this.listFriends(householdId),
      cards: [...this.cards.values()].filter((c) => c.householdId === householdId).map(clone),
      pendingMessages: [...this.messages.values()]
        .filter((m) => m.householdId === householdId && m.status === "pending")
        .map(clone),
    };
  }

  async listFriends(householdId: string) {
    return [...this.friends.values()].filter((f) => f.householdId === householdId).map(clone);
  }

  async putFriend(friend: Friend) {
    this.friends.set(friend.id, clone(friend));
  }

  async getCard(householdId: string, cardId: string) {
    const c = this.cards.get(cardId);
    return c && c.householdId === householdId ? clone(c) : null;
  }

  async putCards(cards: Card[]) {
    for (const c of cards) this.cards.set(c.id, clone(c));
  }

  async putMessage(message: RawMessage) {
    this.messages.set(message.id, clone(message));
  }

  async getMessage(householdId: string, messageId: string) {
    const m = this.messages.get(messageId);
    return m && m.householdId === householdId ? clone(m) : null;
  }

  async updateMessage(householdId: string, messageId: string, changes: Partial<Pick<RawMessage, "status" | "error">>) {
    const m = this.messages.get(messageId);
    if (!m || m.householdId !== householdId) throw new Error(`No message ${messageId}`);
    this.messages.set(messageId, { ...m, ...changes });
  }

  async markSeen(providerMessageId: string) {
    if (this.seen.has(providerMessageId)) return false;
    this.seen.add(providerMessageId);
    return true;
  }

  async countDropped() {
    this.dropped += 1;
  }
}
