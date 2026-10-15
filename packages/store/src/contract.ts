import type { Card, Device, RawMessage } from "@recco/core";
import { beforeEach, describe, expect, it } from "vitest";
import type { Store } from "./store";

const iso = (s: string) => new Date(s).toISOString();

const card = (id: string, householdId: string, extra: Partial<Card> = {}): Card => ({
  id,
  householdId,
  createdAt: iso("2026-10-08T12:00:00Z"),
  kind: "title",
  titleId: "tt1",
  title: `Show ${id}`,
  type: "series",
  origin: "me",
  source: "text",
  state: "new",
  needsCheck: false,
  candidates: [],
  messageId: "m1",
  ...extra,
});

const rand = () => Math.random().toString(36).slice(2);

const message = (id: string, householdId: string): RawMessage => ({
  id,
  householdId,
  receivedAt: iso("2026-10-08T12:00:00Z"),
  body: "Severance - Jordan loved it",
  status: "pending",
  provider: "simulator",
  providerMessageId: `p_${id}`,
});

/**
 * The same behaviour from every Store implementation. `leftovers` lists
 * anything still stored that belongs to or points at a household, read
 * straight from the backing store rather than through the interface.
 */
export function storeContract(name: string, make: () => Promise<Store>, leftovers: (store: Store, householdId: string) => Promise<string[]>) {
  describe(`${name} store contract`, () => {
    let store: Store;
    const hh = `hh_${Math.random().toString(36).slice(2)}`;

    beforeEach(async () => {
      store = await make();
      await store.createHousehold({ id: hh, country: "ca", phoneLast4: "1234", phoneHash: `ph_${hh}`, channelId: "ch", createdAt: iso("2026-10-01T00:00:00Z") });
    });

    it("stores devices and updates them, removing cleared fields", async () => {
      const id = `dev_${Math.random().toString(36).slice(2)}`;
      const device: Device = { id, tokenHash: "h", channelId: "c", createdAt: iso("2026-10-01T00:00:00Z"), pairingCode: "12345", pairingExpiresAt: iso("2026-10-01T00:10:00Z") };
      await store.createDevice(device);
      await expect(store.createDevice(device)).rejects.toThrow();
      await store.updateDevice(id, { householdId: hh, pairingCode: undefined, pairingExpiresAt: undefined });
      const got = await store.getDevice(id);
      expect(got).toMatchObject({ id, householdId: hh });
      expect(got?.pairingCode).toBeUndefined();
      expect(await store.getDevice("dev_missing")).toBeNull();
    });

    it("takes a pairing code once, and frees it when deleted", async () => {
      const code = String(10000 + Math.floor(Math.random() * 89999));
      const expiresAt = new Date(Date.now() + 600_000).toISOString();
      expect(await store.putPairingCode({ code, deviceId: "d1", expiresAt })).toBe(true);
      expect(await store.putPairingCode({ code, deviceId: "d2", expiresAt })).toBe(false);
      expect(await store.getPairingCode(code)).toEqual({ code, deviceId: "d1", expiresAt });
      await store.deletePairingCode(code);
      expect(await store.getPairingCode(code)).toBeNull();
    });

    it("links phones", async () => {
      const hash = `h_${Math.random()}`;
      expect(await store.getPhoneLink(hash)).toBeNull();
      await store.putPhoneLink(hash, hh);
      expect(await store.getPhoneLink(hash)).toBe(hh);
    });

    it("reads the whole inbox in one call, with only pending messages", async () => {
      await store.putFriend({ id: "fr1", householdId: hh, name: "Jordan", createdAt: iso("2026-10-01T00:00:00Z") });
      await store.putCards([card("c1", hh), card("c2", hh, { state: "hidden" })]);
      const pending: RawMessage = { id: "m_pending", householdId: hh, receivedAt: iso("2026-10-08T12:00:00Z"), body: "x", status: "pending", provider: "simulator", providerMessageId: "p1" };
      await store.putMessage(pending);
      await store.putMessage({ ...pending, id: "m_done", status: "done" });
      const inbox = await store.getInbox(hh);
      expect(inbox?.household.id).toBe(hh);
      expect(inbox?.friends.map((f) => f.name)).toEqual(["Jordan"]);
      expect(inbox?.cards.map((c) => c.id).sort()).toEqual(["c1", "c2"]);
      expect(inbox?.pendingMessages.map((m) => m.id)).toEqual(["m_pending"]);
      expect(await store.getInbox("hh_missing")).toBeNull();
    });

    it("gets and replaces cards within a household only", async () => {
      await store.putCards([card("c9", hh)]);
      expect(await store.getCard(hh, "c9")).toMatchObject({ title: "Show c9", type: "series" });
      expect(await store.getCard("hh_other", "c9")).toBeNull();
      await store.putCards([card("c9", hh, { state: "starred" })]);
      expect((await store.getCard(hh, "c9"))?.state).toBe("starred");
    });

    it("updates message status", async () => {
      await store.putMessage({ id: "m2", householdId: hh, receivedAt: iso("2026-10-08T12:00:00Z"), body: "x", status: "pending", provider: "simulator", providerMessageId: "p2" });
      await store.updateMessage(hh, "m2", { status: "failed", error: "boom" });
      expect(await store.getMessage(hh, "m2")).toMatchObject({ status: "failed", error: "boom", body: "x" });
      await expect(store.updateMessage(hh, "m_missing", { status: "done" })).rejects.toThrow();
    });

    it("sees a provider message id once", async () => {
      const id = `p_${Math.random()}`;
      expect(await store.markSeen(id)).toBe(true);
      expect(await store.markSeen(id)).toBe(false);
    });

    it("counts drops", async () => {
      await store.countDropped();
    });

    const newDevice = async (householdId?: string) => {
      const id = `dev_${rand()}`;
      await store.createDevice({ id, tokenHash: "h", channelId: `ch_${id}`, createdAt: iso("2026-10-01T00:00:00Z"), pairingCode: "12345", pairingExpiresAt: iso("2026-10-01T00:10:00Z") });
      if (householdId) await store.moveDevice(id, householdId, iso("2026-10-02T00:00:00Z"));
      return id;
    };

    const newHousehold = async () => {
      const id = `hh_${rand()}`;
      await store.createHousehold({ id, country: "ca", phoneLast4: "9876", phoneHash: `ph_${id}`, channelId: `ch_${id}`, createdAt: iso("2026-10-01T00:00:00Z") });
      await store.putPhoneLink(`ph_${id}`, id);
      return id;
    };

    it("pairs a device, and moves it with exactly one household TV item", async () => {
      const other = await newHousehold();
      const d = await newDevice();
      await store.moveDevice(d, hh, iso("2026-10-02T00:00:00Z"));
      expect(await store.getDevice(d)).toMatchObject({ householdId: hh, pairedAt: iso("2026-10-02T00:00:00Z") });
      expect((await store.getDevice(d))?.pairingCode).toBeUndefined();
      expect(await store.listHouseholdDevices(hh)).toContain(d);
      expect((await store.getInbox(hh))?.deviceIds).toContain(d);

      await store.moveDevice(d, other, iso("2026-10-03T00:00:00Z"));
      expect((await store.getDevice(d))?.householdId).toBe(other);
      expect(await store.listHouseholdDevices(hh)).not.toContain(d);
      expect(await store.listHouseholdDevices(other)).toEqual([d]);

      // Pairing again to the same household keeps one item.
      await store.moveDevice(d, other, iso("2026-10-04T00:00:00Z"));
      expect(await store.listHouseholdDevices(other)).toEqual([d]);
    });

    it("never attaches a device to a household that is gone", async () => {
      const d = await newDevice();
      await expect(store.moveDevice(d, `hh_gone_${rand()}`, iso("2026-10-02T00:00:00Z"))).rejects.toThrow();
      expect((await store.getDevice(d))?.householdId).toBeUndefined();
    });

    it("rotates a household's channel id", async () => {
      const id = await newHousehold();
      expect(await store.rotateChannel(id, "ch_new")).toBe(`ch_${id}`);
      expect((await store.getHousehold(id))?.channelId).toBe("ch_new");
      expect(await store.rotateChannel(`hh_gone_${rand()}`, "ch_x")).toBeNull();
    });

    it("deletes a household and leaves no item behind (R11.1)", async () => {
      const id = await newHousehold();
      const keep = await newHousehold();
      const tv1 = await newDevice(id);
      const tv2 = await newDevice(id);
      const movedAway = await newDevice(id);
      await store.moveDevice(movedAway, keep, iso("2026-10-03T00:00:00Z"));
      const keptTv = await newDevice(keep);
      await store.putFriend({ id: `fr_${rand()}`, householdId: id, name: "Jordan", createdAt: iso("2026-10-01T00:00:00Z") });
      await store.putCards(Array.from({ length: 30 }, (_, i) => card(`c_${id}_${i}`, id)));
      await store.putMessage(message(`m_${id}`, id));
      await store.putCards([card(`c_${keep}`, keep)]);

      const deleted = await store.deleteHousehold(id);
      expect(deleted).toMatchObject({ id, channelId: `ch_${id}`, phoneHash: `ph_${id}` });
      expect(await leftovers(store, id)).toEqual([]);
      expect(await store.getHousehold(id)).toBeNull();
      expect(await store.getInbox(id)).toBeNull();
      expect(await store.getPhoneLink(`ph_${id}`)).toBeNull();
      expect(await store.getDevice(tv1)).toBeNull();
      expect(await store.getDevice(tv2)).toBeNull();
      expect(await store.listFriends(id)).toEqual([]);
      expect(await store.listHouseholdDevices(id)).toEqual([]);

      // Nothing of another household is touched, including the TV that moved there.
      expect((await store.getDevice(movedAway))?.householdId).toBe(keep);
      expect((await store.getDevice(keptTv))?.householdId).toBe(keep);
      expect(await store.getPhoneLink(`ph_${keep}`)).toBe(keep);
      expect((await store.getInbox(keep))?.cards).toHaveLength(1);
      expect((await store.getInbox(keep))?.deviceIds.sort()).toEqual([movedAway, keptTv].sort());

      // Idempotent.
      expect(await store.deleteHousehold(id)).toBeNull();
    });

    it("leaves a phone link that now points at another household", async () => {
      const id = await newHousehold();
      const next = await newHousehold();
      await store.putPhoneLink(`ph_${id}`, next);
      await store.deleteHousehold(id);
      expect(await store.getPhoneLink(`ph_${id}`)).toBe(next);
    });

    it("finishes a delete whose META is already gone", async () => {
      const id = await newHousehold();
      await store.putCards([card(`c_${id}`, id)]);
      // A stray write after the delete (a race with save_cards or intake).
      await store.deleteHousehold(id);
      await store.putPhoneLink(`ph_${id}`, id);
      await store.putCards([card(`c2_${id}`, id)]);
      await store.putMessage(message(`m2_${id}`, id));
      expect(await store.deleteHousehold(id, { phoneHash: `ph_${id}` })).toBeNull();
      expect(await leftovers(store, id)).toEqual([]);
    });
  });
}
