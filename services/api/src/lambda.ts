import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { awsDeps, channelPath, loadSecrets, requireEnv } from "@recco/store";
import { AwsEumProvider } from "@recco/sms";
import { handle } from "hono/aws-lambda";
import { createApp } from "./app";

const sns = new SNSClient({});
const deps = awsDeps();
const topicArn = requireEnv("TOPIC_ARN");

let handler: ReturnType<typeof handle> | undefined;

async function build() {
  const secrets = await loadSecrets();
  if (!secrets.SMS_WEBHOOK_SECRET) throw new Error("SMS_WEBHOOK_SECRET is not set in the secret");
  const app = createApp({
    ...deps,
    reccoNumber: requireEnv("RECCO_PHONE_NUMBER"),
    realtime: (channelId) => ({
      mode: "appsync-events",
      realtimeUrl: `wss://${requireEnv("APPSYNC_REALTIME_DOMAIN")}/event/realtime`,
      httpDomain: requireEnv("APPSYNC_HTTP_DOMAIN"),
      apiKey: requireEnv("APPSYNC_API_KEY"),
      channel: channelPath(channelId),
      pollIntervalMs: 5000,
    }),
    webhook: {
      secret: secrets.SMS_WEBHOOK_SECRET,
      zernioSecret: secrets.ZERNIO_WEBHOOK_SECRET,
      provider: new AwsEumProvider(),
      // Same path as a real number: the AWS End User Messaging payload goes to the SNS topic,
      // then SQS, then intake. Nothing downstream knows it came from the webhook.
      accept: async (text) => {
        await sns.send(
          new PublishCommand({
            TopicArn: topicArn,
            Message: JSON.stringify({
              originationNumber: text.from,
              destinationNumber: text.to,
              messageBody: text.body,
              inboundMessageId: text.providerMessageId,
            }),
          }),
        );
      },
    },
  });
  return handle(app);
}

/** API Lambda behind a function URL. */
export const lambdaHandler: ReturnType<typeof handle> = async (event, context) => {
  handler ??= await build();
  return handler(event, context);
};
