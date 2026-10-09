import {
  extractPairingCode,
  hashPhone,
  isPairingCodeLive,
  newId,
  newSecret,
  normalizePhone,
  phoneLast4,
  type AgentJob,
  type Household,
} from "@recco/core";
import type { InboundText } from "@recco/sms";
import type { Publisher, Store } from "@recco/store";

export interface IntakeDeps {
  store: Store;
  publisher: Publisher;
  phoneSalt: string;
  /** Country for new households, e.g. "ca". */
  defaultCountry: string;
  /** Must not wait for the agent to finish. */
  startAgent: (job: AgentJob) => Promise<void>;
  now?: () => Date;
}

export type IntakeResult =
  | { kind: "duplicate" }
  | { kind: "dropped"; reason: "bad-number" | "unknown-phone" | "dead-code" }
  | { kind: "paired"; householdId: string; deviceId: string; newHousehold: boolean }
  | { kind: "queued"; householdId: string; messageId: string };

/**
 * One inbound text: pair a TV, or save the message and start the agent.
 * Texts from unknown phones are dropped and only counted. Nothing is ever
 * sent back to the phone.
 */
export async function handleInboundText(text: InboundText, deps: IntakeDeps): Promise<IntakeResult> {
  const { store, publisher } = deps;
  const now = deps.now?.() ?? new Date();

  if (!(await store.markSeen(`${text.provider}:${text.providerMessageId}`))) return { kind: "duplicate" };

  const phone = normalizePhone(text.from);
  if (!phone) return drop(store, "bad-number");
  const phoneHash = hashPhone(phone, deps.phoneSalt);

  const code = extractPairingCode(text.body);
  if (code) {
    const pairing = await store.getPairingCode(code);
    if (!pairing || !isPairingCodeLive(pairing.expiresAt, now)) {
      if (pairing) await store.deletePairingCode(code);
      return drop(store, "dead-code");
    }
    const device = await store.getDevice(pairing.deviceId);
    if (!device) {
      await store.deletePairingCode(code);
      return drop(store, "dead-code");
    }

    let householdId = await store.getPhoneLink(phoneHash);
    const newHousehold = !householdId;
    if (!householdId) {
      const household: Household = {
        id: `hh_${newId(now)}`,
        country: deps.defaultCountry,
        phoneLast4: phoneLast4(phone),
        channelId: `ch_${newSecret()}`,
        createdAt: now.toISOString(),
      };
      await store.createHousehold(household);
      await store.putPhoneLink(phoneHash, household.id);
      householdId = household.id;
    }

    await store.updateDevice(device.id, {
      householdId,
      pairedAt: now.toISOString(),
      pairingCode: undefined,
      pairingExpiresAt: undefined,
    });
    await store.deletePairingCode(code);
    await publisher.publish(device.channelId, { type: "paired", phoneLast4: phoneLast4(phone), householdId });
    return { kind: "paired", householdId, deviceId: device.id, newHousehold };
  }

  const householdId = await store.getPhoneLink(phoneHash);
  if (!householdId) return drop(store, "unknown-phone");
  const household = await store.getHousehold(householdId);
  if (!household) return drop(store, "unknown-phone");

  const messageId = `msg_${newId(now)}`;
  const receivedAt = now.toISOString();
  await store.putMessage({
    id: messageId,
    householdId,
    receivedAt,
    body: text.body,
    status: "pending",
    provider: text.provider,
    providerMessageId: text.providerMessageId,
  });
  await publisher.publish(household.channelId, { type: "card.pending", messageId, receivedAt });
  await deps.startAgent({ householdId, messageId, body: text.body });
  return { kind: "queued", householdId, messageId };
}

async function drop(store: Store, reason: "bad-number" | "unknown-phone" | "dead-code"): Promise<IntakeResult> {
  await store.countDropped();
  return { kind: "dropped", reason };
}
