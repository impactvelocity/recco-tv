import { App } from "aws-cdk-lib";
import { ReccoStack } from "../lib/recco-stack";

const app = new App();

/**
 * One region for everything. The plan said us-east-1, but this account's
 * organization only allows us-east-2 (docs/decisions.md).
 */
new ReccoStack(app, "Recco", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-2" },
  description: "Recco: an inbox of things to watch, on Fire TV",
});
