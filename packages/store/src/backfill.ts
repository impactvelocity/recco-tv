import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";

export interface BackfillReport {
  /** Households given the `phoneHash` of the phone linked to them. */
  phoneHashes: number;
  /** Household TV items written for paired devices. */
  tvItems: number;
  /** Households no phone links to. Nothing can text them, and forget-by-text cannot reach them. */
  householdsWithoutPhone: string[];
  /** Devices paired to a household that is gone. They get 401 from the API, which finishes the delete. */
  devicesOfMissingHouseholds: string[];
}

/**
 * One-off for tables written before forget-me (task 5.9): adds `phoneHash` to
 * each household's META and a household TV item for each paired device, so
 * `deleteHousehold` can reach everything. Scans the whole table; safe to run
 * twice. With `apply: false` it only reports.
 */
export async function backfillHouseholds(table: string, config: DynamoDBClientConfig, { apply }: { apply: boolean }): Promise<BackfillReport> {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient(config));
  const items: Record<string, unknown>[] = [];
  let start: ScanCommandOutput["LastEvaluatedKey"];
  do {
    const page = await db.send(
      new ScanCommand({
        TableName: table,
        FilterExpression: "SK = :meta OR begins_with(SK, :tv)",
        ExpressionAttributeValues: { ":meta": "META", ":tv": "DEVICE#" },
        ExclusiveStartKey: start,
      }),
    );
    items.push(...(page.Items ?? []));
    start = page.LastEvaluatedKey;
  } while (start);

  const pk = (i: Record<string, unknown>) => String(i.PK);
  const households = new Map(items.filter((i) => pk(i).startsWith("HH#") && i.SK === "META").map((i) => [pk(i).slice(3), i]));
  const tvItems = new Set(items.filter((i) => String(i.SK).startsWith("DEVICE#")).map((i) => `${pk(i)}|${i.SK}`));
  const report: BackfillReport = { phoneHashes: 0, tvItems: 0, householdsWithoutPhone: [], devicesOfMissingHouseholds: [] };

  const linked = new Set<string>();
  for (const link of items.filter((i) => pk(i).startsWith("PHONE#"))) {
    const householdId = String(link.householdId);
    const household = households.get(householdId);
    if (!household) continue;
    linked.add(householdId);
    if (household.phoneHash) continue;
    report.phoneHashes += 1;
    if (apply) {
      await db.send(
        new UpdateCommand({
          TableName: table,
          Key: { PK: `HH#${householdId}`, SK: "META" },
          UpdateExpression: "SET phoneHash = :h",
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeValues: { ":h": pk(link).slice("PHONE#".length) },
        }),
      );
    }
  }
  report.householdsWithoutPhone = [...households.keys()].filter((id) => !linked.has(id));

  for (const device of items.filter((i) => pk(i).startsWith("DEVICE#") && i.SK === "META" && i.householdId)) {
    const deviceId = pk(device).slice("DEVICE#".length);
    const householdId = String(device.householdId);
    if (!households.has(householdId)) {
      report.devicesOfMissingHouseholds.push(deviceId);
      continue;
    }
    if (tvItems.has(`HH#${householdId}|DEVICE#${deviceId}`)) continue;
    report.tvItems += 1;
    if (apply) {
      await db.send(
        new PutCommand({
          TableName: table,
          Item: { PK: `HH#${householdId}`, SK: `DEVICE#${deviceId}`, entity: "tv", pairedAt: device.pairedAt ?? device.createdAt },
        }),
      );
    }
  }
  return report;
}
