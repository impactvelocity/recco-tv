import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { expect } from "vitest";
import { backfillHouseholds } from "./backfill";
import { describe, it } from "vitest";
import { storeContract } from "./contract";
import { DynamoStore } from "./dynamo";

/**
 * Runs against DynamoDB Local when DYNAMODB_ENDPOINT is set (`pnpm test:dynamo`
 * starts one in Docker). Skipped otherwise, so `pnpm test` needs no Docker.
 */
const endpoint = process.env.DYNAMODB_ENDPOINT;
const config = { endpoint, region: "us-east-2", credentials: { accessKeyId: "local", secretAccessKey: "local" } };
const table = "recco-test";

async function ensureTable() {
  const client = new DynamoDBClient(config);
  try {
    await client.send(new DescribeTableCommand({ TableName: table }));
  } catch {
    await client.send(
      new CreateTableCommand({
        TableName: table,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
      }),
    );
  }
}

/** Scans the test table for any item in the household's partition or pointing at it. */
async function leftovers(_store: unknown, householdId: string) {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient(config));
  const res = await db.send(
    new ScanCommand({
      TableName: table,
      FilterExpression: "PK = :pk OR householdId = :hh",
      ExpressionAttributeValues: { ":pk": `HH#${householdId}`, ":hh": householdId },
    }),
  );
  return (res.Items ?? []).map((i) => `${i.PK} ${i.SK}`);
}

if (endpoint) {
  storeContract("dynamo", async () => {
    await ensureTable();
    return new DynamoStore(table, config);
  }, leftovers);

  describe("backfill for tables written before forget-me", () => {
    it("adds phoneHash and household TV items, then deleteHousehold reaches everything", async () => {
      await ensureTable();
      const db = DynamoDBDocumentClient.from(new DynamoDBClient(config));
      const id = `hh_old_${Math.random().toString(36).slice(2)}`;
      const put = (Item: Record<string, unknown>) => db.send(new PutCommand({ TableName: table, Item }));
      // The shape the deployed table had: no phoneHash, no household TV item.
      await put({ PK: `HH#${id}`, SK: "META", entity: "household", id, country: "ca", phoneLast4: "1234", channelId: `ch_${id}`, createdAt: "x" });
      await put({ PK: `PHONE#ph_${id}`, SK: "META", householdId: id });
      await put({ PK: `DEVICE#dev_${id}`, SK: "META", id: `dev_${id}`, tokenHash: "h", channelId: "c", createdAt: "x", householdId: id, pairedAt: "y" });
      await put({ PK: `HH#${id}`, SK: "CARD#c1", entity: "card", id: "c1", householdId: id });

      const dry = await backfillHouseholds(table, config, { apply: false });
      expect(dry.phoneHashes).toBeGreaterThanOrEqual(1);
      const store = new DynamoStore(table, config);
      expect((await store.getHousehold(id))?.phoneHash).toBeUndefined();

      await backfillHouseholds(table, config, { apply: true });
      expect((await store.getHousehold(id))?.phoneHash).toBe(`ph_${id}`);
      expect(await store.listHouseholdDevices(id)).toEqual([`dev_${id}`]);
      const again = await backfillHouseholds(table, config, { apply: false });
      expect(again).toMatchObject({ phoneHashes: 0, tvItems: 0 });

      await store.deleteHousehold(id);
      expect(await leftovers(store, id)).toEqual([]);
    });
  });
} else {
  describe.skip("dynamo store contract (set DYNAMODB_ENDPOINT, or run pnpm test:dynamo)", () => it("skipped", () => {}));
}
