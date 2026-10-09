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
  services: ["Netflix"],
  origin: "me",
  source: "text",
  state: "new",
  needsCheck: false,
  candidates: [],
  messageId: "m1",
  ...extra,
});

/** The same behaviour from every Store implementation. */
export function storeContract(name: string, make: () => Promise<Store>) {
  describe(`${name} store contract`, () => {
    let store: Store;
    const hh = `hh_${Math.random().toString(36).slice(2)}`;

    beforeEach(async () => {
      store = await make();
      await store.createHousehold({ id: hh, country: "ca", phoneLast4: "1234", channelId: "ch", createdAt: iso("2026-10-01T00:00:00Z") });
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
      expect(await store.getCard(hh, "c9")).toMatchObject({ title: "Show c9", type: "series", services: ["Netflix"] });
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
  });
}
