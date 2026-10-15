import { handleInboundText } from "@recco/intake";
import { AwsEumProvider, signWebhook, signZernio, SimulatorProvider } from "@recco/sms";
import { DEMO, MemoryPublisher, MemoryStore, seedDemo } from "@recco/store";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app";

const SALT = "test-salt";
let store: MemoryStore;
let publisher: MemoryPublisher;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  store = new MemoryStore();
  publisher = new MemoryPublisher();
  await seedDemo(store, SALT);
  const sim = new SimulatorProvider("+16045550142");
  app = createApp({
    store,
    publisher,
    reccoNumber: "+16045550142",
    realtime: () => ({ mode: "polling", pollIntervalMs: 5000 }),
    webhook: {
      secret: "hook-secret",
      zernioSecret: "zernio-secret",
      provider: new AwsEumProvider(),
      accept: (text) =>
        handleInboundText(text, { store, publisher, phoneSalt: SALT, defaultCountry: "ca", startAgent: async () => {} }),
    },
    dev: {
      sendText: async ({ from = DEMO.phone, body, providerMessageId }) => sim.text({ from, body, providerMessageId }),
      handleText: (text) =>
        handleInboundText(text, { store, publisher, phoneSalt: SALT, defaultCountry: "ca", startAgent: async () => {} }),
    },
  });
});

const auth = (token: string) => ({ authorization: `Bearer ${token}` });
const demo = auth(DEMO.deviceToken);

describe("auth", () => {
  it.each(["/inbox", "/realtime"])("%s needs a device token", async (path) => {
    expect((await app.request(path)).status).toBe(401);
    expect((await app.request(path, { headers: auth("dev_demo.wrong") })).status).toBe(401);
    expect((await app.request(path, { headers: auth("garbage") })).status).toBe(401);
  });
});

describe("pairing", () => {
  it("creates a device with a token and a five-digit code, then pairs by text", async () => {
    const res = await app.request("/devices", { method: "POST" });
    expect(res.status).toBe(201);
    const { deviceToken, pairing } = (await res.json()) as any;
    expect(pairing.code).toMatch(/^\d{5}$/);
    expect(pairing.phoneNumber).toBe("+16045550142");

    const before = (await (await app.request("/inbox", { headers: auth(deviceToken) })).json()) as any;
    expect(before.pairing).toMatchObject({ paired: false, code: pairing.code });

    await app.request("/dev/text", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: "+16045559876", body: pairing.code }),
    });

    const after = (await (await app.request("/inbox", { headers: auth(deviceToken) })).json()) as any;
    expect(after.pairing).toEqual({ paired: true, householdId: expect.any(String), phoneLast4: "9876", phoneNumber: "+16045550142", otherTvs: 0 });
    expect(JSON.stringify(after)).not.toContain("6045559876");
  });

  it("issues a fresh code on request", async () => {
    const { deviceToken, pairing } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    const res = await app.request("/devices/code", { method: "POST", headers: auth(deviceToken) });
    const fresh = ((await res.json()) as any).pairing;
    expect(fresh.code).toMatch(/^\d{5}$/);
    expect(fresh.code).not.toBe(pairing.code);
  });
});

describe("inbox", () => {
  it("returns pairing state, friends with track records, and visible cards in one response", async () => {
    const body = (await (await app.request("/inbox", { headers: demo })).json()) as any;
    expect(body.pairing).toMatchObject({ paired: true, phoneLast4: "1234" });
    expect(body.cards).toHaveLength(13);
    expect(body.friends.find((f: any) => f.name === "Jordan")).toMatchObject({ ratedUp: 3, rated: 4 });
    expect(body.cards[0].householdId).toBeUndefined();
  });

  it("hides hidden cards and shows pending texts", async () => {
    await app.request("/cards/card_demo_10", { method: "PATCH", headers: { ...demo, "content-type": "application/json" }, body: JSON.stringify({ state: "hidden" }) });
    await app.request("/dev/text", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body: "Beef" }) });
    const body = (await (await app.request("/inbox", { headers: demo })).json()) as any;
    expect(body.cards).toHaveLength(12);
    expect(body.pending).toHaveLength(1);
  });

  it("only returns the caller's household", async () => {
    const { deviceToken } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    const body = (await (await app.request("/inbox", { headers: auth(deviceToken) })).json()) as any;
    expect(body.cards).toEqual([]);
    const res = await app.request("/cards/card_demo_01", {
      method: "PATCH",
      headers: { ...auth(deviceToken), "content-type": "application/json" },
      body: JSON.stringify({ state: "starred" }),
    });
    expect(res.status).toBe(409);
  });
});

describe("PATCH /cards/:id", () => {
  const patch = (id: string, body: unknown) =>
    app.request(`/cards/${id}`, { method: "PATCH", headers: { ...demo, "content-type": "application/json" }, body: JSON.stringify(body) });

  it("rating marks watched and publishes card.updated", async () => {
    const res = await patch("card_demo_12", { rating: "up" });
    expect(((await res.json()) as any).card).toMatchObject({ rating: "up", state: "watched" });
    expect(publisher.sent.at(-1)?.event.type).toBe("card.updated");
    const inbox = (await (await app.request("/inbox", { headers: demo })).json()) as any;
    expect(inbox.friends.find((f: any) => f.name === "Jordan")).toMatchObject({ ratedUp: 4, rated: 5 });
  });

  it("picks a candidate", async () => {
    const res = await patch("card_demo_11", { candidateTitleId: "tt0290978" });
    expect(((await res.json()) as any).card).toMatchObject({ titleId: "tt0290978", needsCheck: false });
  });

  it("moves a card to another friend", async () => {
    const res = await patch("card_demo_10", { friendId: DEMO.friendIds.steph });
    expect(((await res.json()) as any).card).toMatchObject({ origin: "friend", friendId: DEMO.friendIds.steph });
  });

  it("takes a card out of its post's stack", async () => {
    const res = await patch("card_demo_08", { ungroup: true });
    expect(((await res.json()) as any).card).not.toHaveProperty("groupId");
  });

  it("rejects bad input", async () => {
    expect((await patch("card_demo_10", {})).status).toBe(400);
    expect((await patch("card_demo_10", { ungroup: false })).status).toBe(400);
    expect((await patch("card_demo_10", { state: "deleted" })).status).toBe(400);
    expect((await patch("card_demo_10", { friendId: "fr_nobody" })).status).toBe(400);
    expect((await patch("card_demo_10", { candidateTitleId: "tt1" })).status).toBe(400);
    expect((await patch("card_nope", { state: "starred" })).status).toBe(404);
  });
});

describe("POST /webhooks/sms", () => {
  const eum = (body: string, from: string = DEMO.phone, id = `in-${Math.random()}`) =>
    JSON.stringify({ originationNumber: from, destinationNumber: "+16045550142", messageBody: body, inboundMessageId: id });
  const post = (raw: string, signature?: string) =>
    app.request("/webhooks/sms", {
      method: "POST",
      headers: { "content-type": "application/json", ...(signature ? { "x-recco-signature": signature } : {}) },
      body: raw,
    });

  it("accepts a signed AWS End User Messaging payload and queues the text", async () => {
    const raw = eum("Severance");
    const res = await post(raw, signWebhook(raw, "hook-secret"));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: true });
    expect([...store.messages.values()].map((m) => [m.body, m.provider])).toEqual([["Severance", "aws"]]);
    expect(publisher.sent.at(-1)?.event.type).toBe("card.pending");
  });

  it("refuses unsigned or wrongly signed calls", async () => {
    const raw = eum("Severance");
    expect((await post(raw)).status).toBe(401);
    expect((await post(raw, signWebhook(raw, "wrong"))).status).toBe(401);
    expect(store.messages.size).toBe(0);
  });

  it("refuses payloads that are not inbound texts", async () => {
    const raw = JSON.stringify({ hello: "world" });
    expect((await post(raw, signWebhook(raw, "hook-secret"))).status).toBe(400);
  });

  it("answers the same for an unknown phone, and stores nothing", async () => {
    const raw = eum("Severance", "+16045550000");
    const res = await post(raw, signWebhook(raw, "hook-secret"));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: true });
    expect(store.messages.size).toBe(0);
    expect(store.dropped).toBe(1);
  });

  it("processes a resent message once", async () => {
    const raw = eum("Severance", DEMO.phone, "same-id");
    await post(raw, signWebhook(raw, "hook-secret"));
    await post(raw, signWebhook(raw, "hook-secret"));
    expect(store.messages.size).toBe(1);
  });

  it("can pair a TV", async () => {
    const { deviceToken, pairing } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    const raw = eum(pairing.code, "+17785553333");
    await post(raw, signWebhook(raw, "hook-secret"));
    const inbox = (await (await app.request("/inbox", { headers: auth(deviceToken) })).json()) as any;
    expect(inbox.pairing).toMatchObject({ paired: true, phoneLast4: "3333" });
  });
});

describe("POST /webhooks/zernio", () => {
  const received = (text: string, from: string = DEMO.phone, id = `zm-${Math.random()}`) =>
    JSON.stringify({
      id: `ev-${id}`,
      event: "message.received",
      message: { id, platform: "sms", direction: "incoming", text, sender: { id: from, phoneNumber: from }, sentAt: "2026-10-14T00:07:58.787Z" },
      account: { platform: "sms", username: "+13322201535" },
      timestamp: "2026-10-14T00:07:58.793Z",
    });
  const post = (raw: string, signature?: string) =>
    app.request("/webhooks/zernio", {
      method: "POST",
      headers: { "content-type": "application/json", ...(signature ? { "x-zernio-signature": signature } : {}) },
      body: raw,
    });

  it("accepts a signed message.received and queues the text", async () => {
    const raw = received("King of queens - classic and funny");
    const res = await post(raw, signZernio(raw, "zernio-secret"));
    expect(res.status).toBe(202);
    expect([...store.messages.values()].map((m) => [m.body, m.provider])).toEqual([["King of queens - classic and funny", "zernio"]]);
  });

  it("refuses unsigned or wrongly signed calls", async () => {
    const raw = received("Severance");
    expect((await post(raw)).status).toBe(401);
    expect((await post(raw, signZernio(raw, "wrong"))).status).toBe(401);
    expect(store.messages.size).toBe(0);
  });

  it("answers 2xx to other Zernio events so they are not retried, and stores nothing", async () => {
    const raw = JSON.stringify({ id: "ev-test", event: "webhook.test" });
    expect((await post(raw, signZernio(raw, "zernio-secret"))).status).toBe(202);
    expect(store.messages.size).toBe(0);
  });

  it("processes a retried delivery once", async () => {
    const raw = received("Severance", DEMO.phone, "same-id");
    await post(raw, signZernio(raw, "zernio-secret"));
    await post(raw, signZernio(raw, "zernio-secret"));
    expect(store.messages.size).toBe(1);
  });

  it("can pair a TV", async () => {
    const { deviceToken, pairing } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    const raw = received(pairing.code, "+17057189390");
    await post(raw, signZernio(raw, "zernio-secret"));
    const inbox = (await (await app.request("/inbox", { headers: auth(deviceToken) })).json()) as any;
    expect(inbox.pairing).toMatchObject({ paired: true, phoneLast4: "9390" });
  });
});

describe("forget me and other TVs", () => {
  const pairNewTv = async (phone = DEMO.phone) => {
    const { deviceToken, pairing } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    await app.request("/dev/text", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ from: phone, body: pairing.code }) });
    return auth(deviceToken);
  };
  const inbox = async (headers: Record<string, string>) => (await (await app.request("/inbox", { headers })).json()) as any;

  it("tells each TV how many other TVs share its list (R1.11)", async () => {
    expect((await inbox(demo)).pairing).toMatchObject({ householdId: DEMO.householdId, otherTvs: 0 });
    const second = await pairNewTv();
    expect((await inbox(demo)).pairing.otherTvs).toBe(1);
    expect((await inbox(second)).pairing.otherTvs).toBe(1);
  });

  it("DELETE /household forgets everything, answers 204, and every TV gets 401 after (R11.2, R11.6)", async () => {
    const second = await pairNewTv();
    publisher.sent.length = 0;
    const res = await app.request("/household", { method: "DELETE", headers: demo });
    expect(res.status).toBe(204);
    expect(store.households.size).toBe(0);
    expect(store.cards.size + store.friends.size + store.messages.size + store.phoneLinks.size + store.devices.size).toBe(0);
    expect(publisher.sent).toEqual([{ channelId: "ch_demo_household", event: { type: "household.deleted" } }]);
    for (const headers of [demo, second]) {
      expect((await app.request("/inbox", { headers })).status).toBe(401);
      expect((await app.request("/household", { method: "DELETE", headers })).status).toBe(401);
    }
  });

  it("an unpaired TV has nothing to forget", async () => {
    const { deviceToken } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    expect((await app.request("/household", { method: "DELETE", headers: auth(deviceToken) })).status).toBe(409);
    expect(store.households.size).toBe(1);
  });

  it("a TV of a household that is gone gets 401, and finishes the delete (R11.6)", async () => {
    store.households.delete(DEMO.householdId);
    expect((await app.request("/inbox", { headers: demo })).status).toBe(401);
    expect(await store.getDevice(DEMO.deviceId)).toBeNull();
    expect(store.cards.size).toBe(0);
  });

  it("a card written while the household is deleted is swept up", async () => {
    const put = store.putCards.bind(store);
    store.putCards = async (cards) => {
      await put(cards);
      await store.deleteHousehold(DEMO.householdId);
    };
    const res = await app.request("/cards/card_demo_10", { method: "PATCH", headers: { ...demo, "content-type": "application/json" }, body: JSON.stringify({ state: "starred" }) });
    expect(res.status).toBe(401);
    expect(store.cards.size).toBe(0);
    expect(publisher.sent.filter((s) => s.event.type === "card.updated")).toEqual([]);
  });

  it("a TV moved to another phone sees only the new household", async () => {
    const { deviceToken } = (await (await app.request("/devices", { method: "POST" })).json()) as any;
    const tv = auth(deviceToken);
    const code = async () => ((await (await app.request("/devices/code", { method: "POST", headers: tv })).json()) as any).pairing.code;
    const text = (from: string, body: string) =>
      app.request("/dev/text", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ from, body }) });
    await text(DEMO.phone, await code());
    expect((await inbox(tv)).cards).toHaveLength(13);
    await text("+17785552222", await code());
    const moved = await inbox(tv);
    expect(moved.pairing).toMatchObject({ phoneLast4: "2222", otherTvs: 0 });
    expect(moved.pairing.householdId).not.toBe(DEMO.householdId);
    expect(moved.cards).toEqual([]);
    expect((await inbox(demo)).pairing.otherTvs).toBe(0);
  });
});
