import {
  extractPairingCode,
  hashPhone,
  isForgetCommand,
  isPairingCodeLive,
  newId,
  newSecret,
  normalizePhone,
  phoneLast4,
  planMove,
  type AgentJob,
  type Household,
  type MovePlan,
} from "@recco/core";
import type { InboundText } from "@recco/sms";
import { forgetHousehold, type Publisher, type Store } from "@recco/store";

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
  | { kind: "paired"; householdId: string; deviceId: string; newHousehold: boolean; plan: MovePlan }
  | { kind: "queued"; householdId: string; messageId: string }
  | { kind: "forgotten"; householdId: string };

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

    let householdId = (await linkedHousehold(phoneHash, store))?.id;
    const newHousehold = !householdId;
    if (!householdId) {
      const household: Household = {
        id: `hh_${newId(now)}`,
        country: deps.defaultCountry,
        phoneLast4: phoneLast4(phone),
        phoneHash,
        channelId: `ch_${newSecret()}`,
        createdAt: now.toISOString(),
      };
      await store.createHousehold(household);
      await store.putPhoneLink(phoneHash, household.id);
      householdId = household.id;
    }

    // Moving a TV (R1.7 to R1.9): read the old household's TVs before the move.
    const oldTvs = device.householdId ? await store.listHouseholdDevices(device.householdId) : [];
    const plan = planMove(device.id, device.householdId, householdId, oldTvs);
    await store.moveDevice(device.id, householdId, now.toISOString());
    await store.deletePairingCode(code);
    await publisher.publish(device.channelId, { type: "paired", phoneLast4: phoneLast4(phone), householdId });

    if (plan.kind === "move" && plan.leaving === "forget") {
      await forgetHousehold(store, publisher, plan.from);
    } else if (plan.kind === "move") {
      // The TV that left knew the old channel id; give the others a new one (R1.9).
      const oldChannel = await store.rotateChannel(plan.from, `ch_${newSecret()}`);
      if (oldChannel) await publisher.publish(oldChannel, { type: "channel.changed" });
    }
    return { kind: "paired", householdId, deviceId: device.id, newHousehold, plan };
  }

  const household = await linkedHousehold(phoneHash, store);
  if (!household) return drop(store, "unknown-phone");
  const householdId = household.id;

  // "FORGET ME" (R11.4): delete the household. The text is not saved and the agent never starts.
  if (isForgetCommand(text.body)) {
    await forgetHousehold(store, publisher, householdId, { phoneHash });
    return { kind: "forgotten", householdId };
  }

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
  // A delete that ran between the read above and this write would leave the message behind.
  if (!(await store.getHousehold(householdId))) {
    await store.deleteHousehold(householdId, { phoneHash });
    return drop(store, "unknown-phone");
  }
  await publisher.publish(household.channelId, { type: "card.pending", messageId, receivedAt });
  await deps.startAgent({ householdId, messageId, body: text.body });
  return { kind: "queued", householdId, messageId };
}

/**
 * The household a phone is linked to. A link to a household that is gone is
 * what a delete that stopped partway leaves behind: finish it, and treat the
 * phone as unknown (R11.8).
 */
async function linkedHousehold(phoneHash: string, store: Store): Promise<Household | null> {
  const householdId = await store.getPhoneLink(phoneHash);
  if (!householdId) return null;
  const household = await store.getHousehold(householdId);
  if (!household) await store.deleteHousehold(householdId, { phoneHash });
  return household;
}

async function drop(store: Store, reason: "bad-number" | "unknown-phone" | "dead-code"): Promise<IntakeResult> {
  await store.countDropped();
  return { kind: "dropped", reason };
}
