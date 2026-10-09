import { join } from "node:path";
import { CfnOutput, Duration, Expiration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as agentcore from "aws-cdk-lib/aws-bedrockagentcore";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction, OutputFormat, type NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sns from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import { agentBundling } from "./agent-bundle";

const repoRoot = join(__dirname, "..", "..");

/**
 * Recco on AWS (design.md, "Overview"):
 * texts → SNS → SQS → intake → agent-worker → Recco agent on AgentCore Runtime
 * → DynamoDB → AppSync Events → TV. The TV calls the API Lambda's function URL.
 * Everything is removed by `pnpm infra:destroy` (R10.5).
 */
export class ReccoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // One table for everything (design.md, "Data model").
    const table = new dynamodb.TableV2(this, "Table", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Outside API keys, the webhook secret and the phone hash salt. Values are set by
    // `pnpm infra:secrets` from .env; only the salt is generated here.
    const secret = new secretsmanager.Secret(this, "Keys", {
      description: "Recco: outside API keys, webhook secret, phone hash salt",
      generateSecretString: {
        secretStringTemplate: "{}",
        generateStringKey: "PHONE_HASH_SALT",
        excludePunctuation: true,
        passwordLength: 48,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Live updates. API key auth for the demo; production needs a Lambda authoriser
    // tied to the device token (decisions.md).
    const events = new appsync.EventApi(this, "Events", {
      apiName: "recco-events",
      authorizationConfig: {
        authProviders: [
          {
            authorizationType: appsync.AppSyncAuthorizationType.API_KEY,
            apiKeyConfig: { name: "recco-tv", expires: Expiration.after(Duration.days(365)) },
          },
        ],
      },
    });
    events.addChannelNamespace("recco");
    const apiKey = events.apiKeys["recco-tv"]!.attrApiKey;
    const appSyncEnv = {
      APPSYNC_HTTP_DOMAIN: events.httpDns,
      APPSYNC_REALTIME_DOMAIN: events.realtimeDns,
      APPSYNC_API_KEY: apiKey,
    };

    // Text intake: AWS End User Messaging (later) and the webhook both publish here.
    const topic = new sns.Topic(this, "InboundTexts", { displayName: "Recco inbound texts" });
    const deadLetters = new sqs.Queue(this, "InboundTextsDLQ", { retentionPeriod: Duration.days(14) });
    const queue = new sqs.Queue(this, "InboundTextsQueue", {
      visibilityTimeout: Duration.seconds(60),
      deadLetterQueue: { queue: deadLetters, maxReceiveCount: 3 },
    });
    topic.addSubscription(new SqsSubscription(queue));

    const fn = (name: string, entry: string, extra: Partial<NodejsFunctionProps>) =>
      new NodejsFunction(this, name, {
        entry: join(repoRoot, entry),
        handler: "lambdaHandler",
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 512,
        timeout: Duration.seconds(30),
        projectRoot: repoRoot,
        depsLockFilePath: join(repoRoot, "pnpm-lock.yaml"),
        bundling: {
          format: OutputFormat.CJS,
          target: "node22",
          // Bundle the AWS SDK too: the AgentCore client may be newer than the runtime's copy.
          externalModules: [],
          sourceMap: true,
          minify: true,
        },
        logGroup: new logs.LogGroup(this, `${name}Logs`, {
          retention: logs.RetentionDays.TWO_WEEKS,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        ...extra,
        environment: { NODE_OPTIONS: "--enable-source-maps", SECRET_ARN: secret.secretArn, TABLE_NAME: table.tableName, ...appSyncEnv, ...extra.environment },
      });

    // The Recco agent on AgentCore Runtime (direct code deployment, Node.js 22).
    const agentCode = new Asset(this, "AgentCode", {
      path: join(repoRoot, "services/recco-agent"),
      bundling: agentBundling(repoRoot),
    });
    const agentRole = new iam.Role(this, "AgentRole", {
      assumedBy: new iam.ServicePrincipal("bedrock-agentcore.amazonaws.com", {
        conditions: {
          StringEquals: { "aws:SourceAccount": this.account },
          ArnLike: { "aws:SourceArn": `arn:aws:bedrock-agentcore:${this.region}:${this.account}:*` },
        },
      }),
      description: "Recco agent on AgentCore Runtime",
    });
    agentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"],
        resources: [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/bedrock-agentcore/runtimes/*`],
      }),
    );
    agentRole.addToPolicy(new iam.PolicyStatement({ actions: ["logs:DescribeLogGroups"], resources: ["*"] }));
    agentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["xray:PutTraceSegments", "xray:PutTelemetryRecords", "cloudwatch:PutMetricData"],
        resources: ["*"],
      }),
    );
    agentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock-agentcore:GetWorkloadAccessToken", "bedrock-agentcore:GetWorkloadAccessTokenForJWT", "bedrock-agentcore:GetWorkloadAccessTokenForUserId"],
        resources: [`arn:aws:bedrock-agentcore:${this.region}:${this.account}:workload-identity-directory/default/*`],
      }),
    );
    table.grantReadWriteData(agentRole);
    secret.grantRead(agentRole);
    agentCode.grantRead(agentRole);

    const runtime = new agentcore.CfnRuntime(this, "AgentRuntime", {
      agentRuntimeName: "recco_agent",
      description: "Reads a text or post and saves Recco cards",
      roleArn: agentRole.roleArn,
      agentRuntimeArtifact: {
        codeConfiguration: {
          code: { s3: { bucket: agentCode.s3BucketName, prefix: agentCode.s3ObjectKey } },
          runtime: "NODE_22",
          entryPoint: ["agent.js"],
        },
      },
      networkConfiguration: { networkMode: "PUBLIC" },
      protocolConfiguration: "HTTP",
      environmentVariables: {
        RECCO_REGION: this.region,
        SECRET_ARN: secret.secretArn,
        TABLE_NAME: table.tableName,
        ...appSyncEnv,
      },
    });
    runtime.node.addDependency(agentRole);

    // Starts the agent without blocking intake. Failures are handled, so no async retries.
    const worker = fn("AgentWorker", "services/agent-worker/src/lambda.ts", {
      timeout: Duration.seconds(90),
      environment: { AGENT_RUNTIME_ARN: runtime.attrAgentRuntimeArn },
    });
    worker.configureAsyncInvoke({ retryAttempts: 0 });
    worker.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock-agentcore:InvokeAgentRuntime"],
        resources: [runtime.attrAgentRuntimeArn, `${runtime.attrAgentRuntimeArn}/*`],
      }),
    );
    table.grantReadWriteData(worker);
    secret.grantRead(worker);

    const intake = fn("Intake", "services/intake/src/lambda.ts", {
      environment: { AGENT_WORKER_FUNCTION: worker.functionName, DEFAULT_COUNTRY: "ca" },
    });
    intake.addEventSource(new SqsEventSource(queue, { batchSize: 10, reportBatchItemFailures: true }));
    worker.grantInvoke(intake);
    table.grantReadWriteData(intake);
    secret.grantRead(intake);

    // The inbox API. The TV app talks only to this (structure.md).
    const api = fn("Api", "services/api/src/lambda.ts", {
      environment: {
        TOPIC_ARN: topic.topicArn,
        // The number shown on the pairing screen. Placeholder until a real number is live (task 4.4).
        RECCO_PHONE_NUMBER: this.node.tryGetContext("reccoPhoneNumber") ?? "+16045550142",
      },
    });
    table.grantReadWriteData(api);
    secret.grantRead(api);
    topic.grantPublish(api);
    const apiUrl = api.addFunctionUrl({ authType: lambda.FunctionUrlAuthType.NONE });

    new CfnOutput(this, "ApiUrl", { value: apiUrl.url });
    new CfnOutput(this, "TopicArn", { value: topic.topicArn });
    new CfnOutput(this, "TableName", { value: table.tableName });
    new CfnOutput(this, "SecretArn", { value: secret.secretArn });
    new CfnOutput(this, "AgentRuntimeArn", { value: runtime.attrAgentRuntimeArn });
    new CfnOutput(this, "EventsHttpDomain", { value: events.httpDns });
    new CfnOutput(this, "EventsRealtimeDomain", { value: events.realtimeDns });
  }
}
