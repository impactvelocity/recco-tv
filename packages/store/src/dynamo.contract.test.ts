import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
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

if (endpoint) {
  storeContract("dynamo", async () => {
    await ensureTable();
    return new DynamoStore(table, config);
  });
} else {
  describe.skip("dynamo store contract (set DYNAMODB_ENDPOINT, or run pnpm test:dynamo)", () => it("skipped", () => {}));
}
