/**
 * `pnpm backfill:households [--apply]`: prepares the deployed table for
 * forget-me (task 5.9). Adds `phoneHash` to each household and a household TV
 * item for each paired device. Reports only, unless `--apply` is given.
 * Prints counts and ids, never phone numbers or hashes.
 */
import { backfillHouseholds } from "@recco/store";
import { stackOutputs } from "./outputs";

const apply = process.argv.includes("--apply");
const table = stackOutputs().TableName;
if (!table) throw new Error("No TableName in .recco-outputs.json");

const report = await backfillHouseholds(table, { region: "us-east-2" }, { apply });
console.log(apply ? "Applied:" : "Dry run (pass --apply to write):");
console.log(`  households given a phoneHash:  ${report.phoneHashes}`);
console.log(`  household TV items written:    ${report.tvItems}`);
console.log(`  households with no phone link: ${report.householdsWithoutPhone.length ? report.householdsWithoutPhone.join(", ") : "none"}`);
console.log(`  devices of missing households: ${report.devicesOfMissingHouseholds.length ? report.devicesOfMissingHouseholds.join(", ") : "none"}`);
