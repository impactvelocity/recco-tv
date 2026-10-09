import {
  applyCardUpdate,
  CardUpdateError,
  deviceIdFromToken,
  deviceTokenMatches,
  generatePairingCode,
  hashDeviceToken,
  isPairingCodeLive,
  newDeviceToken,
  newId,
  newSecret,
  pairingExpiry,
  withTrackRecords,
  type Card,
  type Device,
} from "@recco/core";
import { verifyWebhook, SIGNATURE_HEADER, type InboundText, type SmsProvider } from "@recco/sms";
import type { Publisher, Store } from "@recco/store";
import { Hono } from "hono";
import { z } from "zod";

export type RealtimeConfig =
  | { mode: "polling"; pollIntervalMs: number }
  | { mode: "appsync-events"; realtimeUrl: string; httpDomain: string; apiKey: string; channel: string; pollIntervalMs: number };

export interface ApiDeps {
  store: Store;
  publisher: Publisher;
  /** The number shown on the pairing screen, E.164. */
  reccoNumber: string;
  realtime: (channelId: string) => RealtimeConfig;
  now?: () => Date;
  /**
   * Inbound texts from an SMS provider's webhook. Signed with HMAC-SHA256.
   * Locally this calls intake directly; on AWS it hands off to the queue.
   */
  webhook?: {
    secret: string;
    provider: SmsProvider;
    accept: (text: InboundText) => Promise<unknown>;
  };
  /** Local and demo only: feed a fake text into intake. */
  dev?: {
    sendText: (input: { from?: string; body: string; providerMessageId?: string }) => Promise<InboundText>;
    handleText: (text: InboundText) => Promise<unknown>;
  };
}

type Env = { Variables: { device: Device } };

const cardUpdateSchema = z
  .object({
    state: z.enum(["new", "starred", "hidden", "watched"]).optional(),
    rating: z.enum(["up", "down"]).optional(),
    candidateTitleId: z.string().min(1).optional(),
    origin: z.enum(["friend", "me", "internet"]).optional(),
    friendId: z.string().min(1).optional(),
  })
  .strict()
  .refine((u) => Object.keys(u).length > 0, "Nothing to change");

const devTextSchema = z.object({
  from: z.string().optional(),
  body: z.string().min(1).max(1600),
  providerMessageId: z.string().optional(),
});

/** The inbox API. Makes no model calls. Every route but POST /devices needs a device token. */
export function createApp(deps: ApiDeps) {
  const { store, publisher } = deps;
  const now = () => deps.now?.() ?? new Date();
  const app = new Hono<Env>();

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Something went wrong" }, 500);
  });

  app.get("/health", (c) => c.json({ ok: true }));

  app.post("/devices", async (c) => {
    const createdAt = now();
    const deviceId = `dev_${newId(createdAt)}`;
    const deviceToken = newDeviceToken(deviceId);
    await store.createDevice({
      id: deviceId,
      tokenHash: hashDeviceToken(deviceToken),
      channelId: `ch_${newSecret()}`,
      createdAt: createdAt.toISOString(),
    });
    const pairing = await issueCode(deviceId);
    return c.json({ deviceId, deviceToken, pairing }, 201);
  });

  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/dev/") || c.req.path.startsWith("/webhooks/")) return next();
    const header = c.req.header("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    const deviceId = token ? deviceIdFromToken(token) : null;
    const device = deviceId ? await store.getDevice(deviceId) : null;
    if (!device || !deviceTokenMatches(token, device.tokenHash)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("device", device);
    return next();
  });

  if (deps.webhook) {
    const webhook = deps.webhook;
    app.post("/webhooks/sms", async (c) => {
      const raw = await c.req.text();
      if (!verifyWebhook(raw, c.req.header(SIGNATURE_HEADER), webhook.secret, now())) {
        return c.json({ error: "Bad signature" }, 401);
      }
      let payload: unknown;
      try {
        payload = JSON.parse(raw);
      } catch {
        return c.json({ error: "Body is not JSON" }, 400);
      }
      const text = webhook.provider.parseInbound(payload);
      if (!text) return c.json({ error: "Not an inbound text" }, 400);
      await webhook.accept(text);
      // Same answer whatever happened, so callers cannot probe which phones are linked.
      return c.json({ accepted: true }, 202);
    });
  }

  app.post("/devices/code", async (c) => {
    return c.json({ pairing: await issueCode(c.get("device").id) });
  });

  app.get("/inbox", async (c) => {
    const device = c.get("device");
    const serverTime = now().toISOString();
    if (!device.householdId) {
      const live = device.pairingCode && device.pairingExpiresAt && isPairingCodeLive(device.pairingExpiresAt, now());
      return c.json({
        serverTime,
        pairing: {
          paired: false,
          code: live ? device.pairingCode : null,
          expiresAt: live ? device.pairingExpiresAt : null,
          phoneNumber: deps.reccoNumber,
        },
        friends: [],
        cards: [],
        pending: [],
      });
    }
    const inbox = await store.getInbox(device.householdId);
    if (!inbox) return c.json({ error: "Household not found" }, 404);
    return c.json({
      serverTime,
      pairing: { paired: true, phoneLast4: inbox.household.phoneLast4, phoneNumber: deps.reccoNumber },
      household: { country: inbox.household.country },
      friends: withTrackRecords(inbox.friends, inbox.cards).map(({ householdId: _, ...f }) => f),
      cards: inbox.cards.filter((card) => card.state !== "hidden").map(publicCard),
      pending: inbox.pendingMessages.map((m) => ({ messageId: m.id, receivedAt: m.receivedAt })),
    });
  });

  app.patch("/cards/:id", async (c) => {
    const householdId = c.get("device").householdId;
    if (!householdId) return c.json({ error: "Not paired" }, 409);
    const parsed = cardUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Invalid update", issues: parsed.error.issues }, 400);
    const update = parsed.data;

    const card = await store.getCard(householdId, c.req.param("id"));
    if (!card) return c.json({ error: "Card not found" }, 404);

    if (update.friendId) {
      const friends = await store.listFriends(householdId);
      if (!friends.some((f) => f.id === update.friendId)) return c.json({ error: "Friend not found" }, 400);
    }

    let next: Card;
    try {
      next = applyCardUpdate(card, update.friendId && !update.origin ? { ...update, origin: "friend" } : update);
    } catch (err) {
      if (err instanceof CardUpdateError) return c.json({ error: err.message }, 400);
      throw err;
    }
    await store.putCards([next]);
    const household = await store.getHousehold(householdId);
    if (household) await publisher.publish(household.channelId, { type: "card.updated", card: next });
    return c.json({ card: publicCard(next) });
  });

  app.get("/realtime", async (c) => {
    const device = c.get("device");
    if (!device.householdId) return c.json(deps.realtime(device.channelId));
    const household = await store.getHousehold(device.householdId);
    return c.json(deps.realtime(household?.channelId ?? device.channelId));
  });

  if (deps.dev) {
    const dev = deps.dev;
    app.post("/dev/text", async (c) => {
      const parsed = devTextSchema.safeParse(await c.req.json().catch(() => null));
      if (!parsed.success) return c.json({ error: "Invalid text", issues: parsed.error.issues }, 400);
      const text = await dev.sendText(parsed.data);
      const result = await dev.handleText(text);
      return c.json({ text, result });
    });
  }

  async function issueCode(deviceId: string) {
    const issuedAt = now();
    const expiresAt = pairingExpiry(issuedAt);
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = generatePairingCode();
      if (await store.putPairingCode({ code, deviceId, expiresAt })) {
        await store.updateDevice(deviceId, { pairingCode: code, pairingExpiresAt: expiresAt });
        return { code, expiresAt, phoneNumber: deps.reccoNumber };
      }
    }
    throw new Error("Could not find a free pairing code");
  }

  return app;
}

function publicCard({ householdId: _h, messageId: _m, ...card }: Card) {
  return card;
}
