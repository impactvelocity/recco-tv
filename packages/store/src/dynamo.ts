import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
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

  /** One query on the household partition: the household, friends, cards and messages. */
  async getInbox(householdId: string): Promise<Inbox | null> {
    const items: Record<string, unknown>[] = [];
    let start: QueryCommandOutput["LastEvaluatedKey"];
    do {
      const page = await this.db.send(
        new QueryCommand({
          TableName: this.table,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": `HH#${householdId}` },
          ExclusiveStartKey: start,
        }),
      );
      items.push(...(page.Items ?? []));
      start = page.LastEvaluatedKey;
    } while (start);

    const meta = items.find((i) => i.SK === "META");
    if (!meta) return null;
    const of = <T>(prefix: string) => items.filter((i) => String(i.SK).startsWith(prefix)).map((i) => strip<T>(i)!);
    return {
      household: strip<Household>(meta)!,
      friends: of<Friend>("FRIEND#"),
      cards: of<Card>("CARD#"),
      pendingMessages: of<RawMessage>("MSG#").filter((m) => m.status === "pending"),
    };
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

  async updateMessage(householdId: string, messageId: string, changes: Partial<Pick<RawMessage, "status" | "error">>) {
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

  /** Title data and availability cache (R5.2), stored in the same table with a TTL. */
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
