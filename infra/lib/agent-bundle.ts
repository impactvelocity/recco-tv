import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DockerImage, type BundlingOptions } from "aws-cdk-lib";
import { buildSync } from "esbuild";

/**
 * Bundles the Recco agent into one CommonJS file for AgentCore Runtime direct
 * code deployment (NODE_22, arm64). Pure JavaScript dependencies only, so the
 * bundle runs on arm64 as built here. Done locally with esbuild; no Docker.
 */
export function agentBundling(repoRoot: string): BundlingOptions {
  return {
    image: DockerImage.fromRegistry("public.ecr.aws/docker/library/node:22"),
    local: {
      tryBundle(outputDir: string) {
        buildSync({
          entryPoints: [join(repoRoot, "services/recco-agent/src/server.ts")],
          outfile: join(outputDir, "agent.js"),
          bundle: true,
          platform: "node",
          target: "node22",
          format: "cjs",
          sourcemap: "inline",
          legalComments: "none",
          logLevel: "warning",
        });
        writeFileSync(join(outputDir, "package.json"), JSON.stringify({ name: "recco-agent", private: true, type: "commonjs" }));
        // AgentCore needs 644 files and 755 directories.
        for (const f of ["agent.js", "package.json"]) chmodSync(join(outputDir, f), 0o644);
        chmodSync(outputDir, 0o755);
        return true;
      },
    },
  };
}
