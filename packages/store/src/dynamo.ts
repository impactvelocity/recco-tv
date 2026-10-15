import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import type { Card, Device, Friend, Household, PairingCode, RawMessage } from "@recco/core";
import type { Inbox, Store } from "./store";

const SEEN_TTL_S = 7 * 24 * 60 * 60;
/** Phone links and devices outlive pairing codes; codes and caches expire through TTL. */
const epoch = (iso: string) => Math.floor(Date.parse(iso) / 1000);

/**
 * The DynamoDB store: one table, partition key PK and sort key SK, TTL on
 * `ttl` (design.md, "Data model"). Card and message ids are time-sortable, so
 * `CARD#<cardId>` sorts like `CARD#<time>#<cardId>` and can be read directly.
 */
export class DynamoStore implements Store {
  private readonly db: DynamoDBDocumentClient;

  constructor(
    private readonly table: string,
    config: DynamoDBClientConfig = {},
    private readonly now: () => Date = () => new Date(),
  ) {
    this.db = DynamoDBDocumentClient.from(new DynamoDBClient(config), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  private get(PK: string, SK: string) {
    return this.db.send(new GetCommand({ TableName: this.table, Key: { PK, SK } })).then((r) => r.Item);
  }

  private put(item: Record<string, unknown>, condition?: { expression: string; values?: Record<string, unknown>; names?: Record<string, string> }) {
    return this.db.send(
      new PutCommand({
        TableName: this.table,
        Item: item,
        ConditionExpression: condition?.expression,
        ExpressionAttributeValues: condition?.values,
        ExpressionAttributeNames: condition?.names,
      }),
    );
  }

  async createDevice(device: Device) {
    await this.put({ PK: `DEVICE#${device.id}`, SK: "META", ...device }, { expression: "attribute_not_exists(PK)" });
  }

  async getDevice(deviceId: string) {
    return strip<Device>(await this.get(`DEVICE#${deviceId}`, "META"));
  }

  async updateDevice(deviceId: string, changes: Partial<Omit<Device, "id">>) {
    const current = await this.getDevice(deviceId);
    if (!current) throw new Error(`No device ${deviceId}`);
    const merged: Record<string, unknown> = { ...current, ...changes };
    for (const [k, v] of Object.entries(changes)) if (v === undefined) delete merged[k];
    await this.put({ PK: `DEVICE#${deviceId}`, SK: "META", ...merged });
  }

  async moveDevice(deviceId: string, householdId: string, pairedAt: string) {
    const current = await this.getDevice(deviceId);
    if (!current) throw new Error(`No device ${deviceId}`);
    const { pairingCode: _c, pairingExpiresAt: _e, ...rest } = current;
    const from = current.householdId && current.householdId !== householdId ? current.householdId : null;
    try {
      await this.db.send(
        new TransactWriteCommand({
          TransactItems: [
            // The household must still exist: a TV is never attached to a forgotten one.
            { ConditionCheck: { TableName: this.table, Key: { PK: `HH#${householdId}`, SK: "META" }, ConditionExpression: "attribute_exists(PK)" } },
            { Put: { TableName: this.table, Item: { PK: `DEVICE#${deviceId}`, SK: "META", ...rest, householdId, pairedAt } } },
            { Put: { TableName: this.table, Item: { PK: `HH#${householdId}`, SK: `DEVICE#${deviceId}`, entity: "tv", pairedAt } } },
            ...(from ? [{ Delete: { TableName: this.table, Key: { PK: `HH#${from}`, SK: `DEVICE#${deviceId}` } } }] : []),
          ],
        }),
      );
    } catch (err) {
      if ((err as { name?: string })?.name === "TransactionCanceledException") throw new Error(`No household ${householdId}`);
      throw err;
    }
  }

  async listHouseholdDevices(householdId: string) {
    const items = await this.queryAll(`HH#${householdId}`, "DEVICE#");
    return items.map((i) => String(i.SK).slice("DEVICE#".length));
  }

  async putPairingCode(code: PairingCode) {
    try {
      // A code is free if it never existed or has expired (TTL deletion can lag by hours).
      await this.put(
        { PK: `PAIR#${code.code}`, SK: "META", ...code, ttl: epoch(code.expiresAt) },
        { expression: "attribute_not_exists(PK) OR #ttl < :now", names: { "#ttl": "ttl" }, values: { ":now": epoch(this.now().toISOString()) } },
      );
      return true;
    } catch (err) {
      if (isConditionFailure(err)) return false;
      throw err;
    }
  }

  async getPairingCode(code: string) {
    return strip<PairingCode>(await this.get(`PAIR#${code}`, "META"));
  }

  async deletePairingCode(code: string) {
    await this.db.send(new DeleteCommand({ TableName: this.table, Key: { PK: `PAIR#${code}`, SK: "META" } }));
  }

  async getPhoneLink(phoneHash: string) {
    const item = await this.get(`PHONE#${phoneHash}`, "META");
    return (item?.householdId as string | undefined) ?? null;
  }

  async putPhoneLink(phoneHash: string, householdId: string) {
    await this.put({ PK: `PHONE#${phoneHash}`, SK: "META", householdId });
  }

  async createHousehold(household: Household) {
    await this.put({ PK: `HH#${household.id}`, SK: "META", entity: "household", ...household });
  }

  async getHousehold(householdId: string) {
    return strip<Household>(await this.get(`HH#${householdId}`, "META"));
  }

  /** One query on the household partition: the household, friends, cards, messages and TVs. */
  async getInbox(householdId: string): Promise<Inbox | null> {
    const items = await this.queryAll(`HH#${householdId}`);
    const meta = items.find((i) => i.SK === "META");
    if (!meta) return null;
    const of = <T>(prefix: string) => items.filter((i) => String(i.SK).startsWith(prefix)).map((i) => strip<T>(i)!);
    return {
      household: strip<Household>(meta)!,
      friends: of<Friend>("FRIEND#"),
      cards: of<Card>("CARD#"),
      pendingMessages: of<RawMessage>("MSG#").filter((m) => m.status === "pending"),
      deviceIds: items.filter((i) => String(i.SK).startsWith("DEVICE#")).map((i) => String(i.SK).slice("DEVICE#".length)),
    };
  }

  async rotateChannel(householdId: string, channelId: string) {
    try {
      const res = await this.db.send(
        new UpdateCommand({
          TableName: this.table,
          Key: { PK: `HH#${householdId}`, SK: "META" },
          UpdateExpression: "SET channelId = :c",
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeValues: { ":c": channelId },
          ReturnValues: "UPDATED_OLD",
        }),
      );
      return (res.Attributes?.channelId as string | undefined) ?? null;
    } catch (err) {
      if (isConditionFailure(err)) return null;
      throw err;
    }
  }

  /**
   * See Store.deleteHousehold. META goes first, so readers stop at once; the
   * device items and phone link go last, so a TV or a text that finds one can
   * call this again and finish a delete that stopped partway.
   */
  async deleteHousehold(householdId: string, options: { phoneHash?: string } = {}) {
    const PK = `HH#${householdId}`;
    const items = await this.queryAll(PK);
    const meta = items.find((i) => i.SK === "META");
    const tvs = items.filter((i) => String(i.SK).startsWith("DEVICE#"));

    if (meta) await this.db.send(new DeleteCommand({ TableName: this.table, Key: { PK, SK: "META" } }));
    await this.batchDelete(items.filter((i) => i.SK !== "META" && !tvs.includes(i)).map((i) => ({ PK, SK: String(i.SK) })));
    for (const tv of tvs) {
      await this.deleteIfOwned({ PK: String(tv.SK), SK: "META" }, householdId);
    }
    await this.batchDelete(tvs.map((i) => ({ PK, SK: String(i.SK) })));
    const phoneHash = (meta?.phoneHash as string | undefined) ?? options.phoneHash;
    if (phoneHash) await this.deleteIfOwned({ PK: `PHONE#${phoneHash}`, SK: "META" }, householdId);
    return strip<Household>(meta);
  }

  /** Deletes an item that points at this household. One that now points elsewhere (a TV that moved, a phone that paired again) is left. */
  private async deleteIfOwned(Key: { PK: string; SK: string }, householdId: string) {
    try {
      await this.db.send(
        new DeleteCommand({ TableName: this.table, Key, ConditionExpression: "householdId = :hh", ExpressionAttributeValues: { ":hh": householdId } }),
      );
    } catch (err) {
      if (!isConditionFailure(err)) throw err;
    }
  }

  private async batchDelete(keys: { PK: string; SK: string }[]) {
    for (let i = 0; i < keys.length; i += 25) {
      let requests: { DeleteRequest: { Key: Record<string, unknown> } }[] = keys.slice(i, i + 25).map((Key) => ({ DeleteRequest: { Key } }));
      for (let attempt = 0; requests.length > 0; attempt++) {
        if (attempt === 5) throw new Error(`Could not delete ${requests.length} items`);
        if (attempt > 0) await new Promise((r) => setTimeout(r, 100 * 2 ** attempt));
        const res = await this.db.send(new BatchWriteCommand({ RequestItems: { [this.table]: requests } }));
        requests = (res.UnprocessedItems?.[this.table] ?? []) as typeof requests;
      }
    }
  }

  /** Every item in a partition, optionally under a sort key prefix, across pages. */
  private async queryAll(PK: string, skPrefix?: string) {
    const items: Record<string, unknown>[] = [];
    let start: QueryCommandOutput["LastEvaluatedKey"];
    do {
      const page = await this.db.send(
        new QueryCommand({
          TableName: this.table,
          KeyConditionExpression: skPrefix ? "PK = :pk AND begins_with(SK, :sk)" : "PK = :pk",
          ExpressionAttributeValues: skPrefix ? { ":pk": PK, ":sk": skPrefix } : { ":pk": PK },
          ExclusiveStartKey: start,
        }),
      );
      items.push(...(page.Items ?? []));
      start = page.LastEvaluatedKey;
    } while (start);
    return items;
  }

  async listFriends(householdId: string) {
    const page = await this.db.send(
      new QueryCommand({
        TableName: this.table,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `HH#${householdId}`, ":sk": "FRIEND#" },
      }),
    );
    return (page.Items ?? []).map((i) => strip<Friend>(i)!);
  }

  async putFriend(friend: Friend) {
    await this.put({ PK: `HH#${friend.householdId}`, SK: `FRIEND#${friend.id}`, entity: "friend", ...friend });
  }

  async getCard(householdId: string, cardId: string) {
    return strip<Card>(await this.get(`HH#${householdId}`, `CARD#${cardId}`));
  }

  async putCards(cards: Card[]) {
    await Promise.all(cards.map((c) => this.put({ PK: `HH#${c.householdId}`, SK: `CARD#${c.id}`, entity: "card", ...c })));
  }

  async putMessage(message: RawMessage) {
    await this.put({ PK: `HH#${message.householdId}`, SK: `MSG#${message.id}`, entity: "message", ...message });
  }

  async getMessage(householdId: string, messageId: string) {
    return strip<RawMessage>(await this.get(`HH#${householdId}`, `MSG#${messageId}`));
  }

  async updateMessage(householdId: string, messageId: string, changes: Partial<Pick<RawMessage, "status" | "error" | "mergedInto">>) {
    const sets = Object.entries(changes).filter(([, v]) => v !== undefined);
    if (sets.length === 0) return;
    try {
      await this.db.send(
        new UpdateCommand({
          TableName: this.table,
          Key: { PK: `HH#${householdId}`, SK: `MSG#${messageId}` },
          UpdateExpression: `SET ${sets.map(([k]) => `#${k} = :${k}`).join(", ")}`,
          ExpressionAttributeNames: Object.fromEntries(sets.map(([k]) => [`#${k}`, k])),
          ExpressionAttributeValues: Object.fromEntries(sets.map(([k, v]) => [`:${k}`, v])),
          ConditionExpression: "attribute_exists(PK)",
        }),
      );
    } catch (err) {
      if (isConditionFailure(err)) throw new Error(`No message ${messageId}`);
      throw err;
    }
  }

  async markSeen(providerMessageId: string) {
    try {
      await this.put(
        { PK: `SEEN#${providerMessageId}`, SK: "META", ttl: epoch(this.now().toISOString()) + SEEN_TTL_S },
        { expression: "attribute_not_exists(PK)" },
      );
      return true;
    } catch (err) {
      if (isConditionFailure(err)) return false;
      throw err;
    }
  }

  async countDropped() {
    await this.db.send(
      new UpdateCommand({
        TableName: this.table,
        Key: { PK: "STATS", SK: "DROPPED" },
        UpdateExpression: "ADD #n :one",
        ExpressionAttributeNames: { "#n": "count" },
        ExpressionAttributeValues: { ":one": 1 },
      }),
    );
  }

  /** Title data cache (R5.2), stored in the same table with a TTL. */
  cache() {
    return {
      get: async <T>(key: string): Promise<T | undefined> => {
        const item = await this.get(`CACHE#${key}`, "META");
        if (!item || (item.ttl as number) <= epoch(this.now().toISOString())) return undefined;
        return item.value as T;
      },
      set: async <T>(key: string, value: T, ttlMs: number) => {
        await this.put({ PK: `CACHE#${key}`, SK: "META", value, ttl: epoch(this.now().toISOString()) + Math.ceil(ttlMs / 1000) });
      },
    };
  }
}

function strip<T>(item: Record<string, unknown> | undefined): T | null {
  if (!item) return null;
  const { PK: _pk, SK: _sk, entity: _entity, ttl: _ttl, ...rest } = item;
  return rest as T;
}

function isConditionFailure(err: unknown): boolean {
  return (err as { name?: string })?.name === "ConditionalCheckFailedException";
}

/** Table definition shared by the CDK stack and the local DynamoDB tests. */
export const TABLE_KEYS = { partitionKey: "PK", sortKey: "SK", ttlAttribute: "ttl" } as const;
