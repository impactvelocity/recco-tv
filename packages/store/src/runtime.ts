import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { AppSyncEventsPublisher, type AppSyncEventsConfig } from "./appsync";
import { DynamoStore } from "./dynamo";

/** Keys kept in the Secrets Manager secret (never in the CloudFormation template). */
export interface ReccoSecrets {
  PHONE_HASH_SALT: string;
  SMS_WEBHOOK_SECRET?: string;
  AI_GATEWAY_API_KEY?: string;
  RECCO_MODEL?: string;
  OMDB_API_KEY?: string;
  STREAMING_AVAILABILITY_API_KEY?: string;
  STREAMING_AVAILABILITY_VIA?: string;
  SCRAPECREATORS_API_KEY?: string;
}

let secrets: Promise<ReccoSecrets> | undefined;

/** AgentCore Runtime does not let us set AWS_REGION, so the stack also passes RECCO_REGION. */
export const awsRegion = () => process.env.AWS_REGION ?? process.env.RECCO_REGION;

/** Read once per container and reused. */
export function loadSecrets(arn = requireEnv("SECRET_ARN")): Promise<ReccoSecrets> {
  secrets ??= new SecretsManagerClient({ region: awsRegion() })
    .send(new GetSecretValueCommand({ SecretId: arn }))
    .then((r) => JSON.parse(r.SecretString ?? "{}") as ReccoSecrets)
    .catch((err) => {
      secrets = undefined;
      throw err;
    });
  return secrets;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export function appSyncConfigFromEnv(): AppSyncEventsConfig {
  return {
    httpDomain: requireEnv("APPSYNC_HTTP_DOMAIN"),
    realtimeDomain: requireEnv("APPSYNC_REALTIME_DOMAIN"),
    apiKey: requireEnv("APPSYNC_API_KEY"),
  };
}

/** The store and publisher every deployed service uses. Created outside handlers for reuse. */
export function awsDeps() {
  return {
    store: new DynamoStore(requireEnv("TABLE_NAME"), { region: awsRegion() }),
    publisher: new AppSyncEventsPublisher(appSyncConfigFromEnv()),
  };
}
