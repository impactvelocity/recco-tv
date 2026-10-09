### What the submission must contain

- A GitHub repo with all source, assets, and clear setup and run instructions in the README.
- An app that runs on Fire OS or Vega OS. Any framework is allowed.
- A demo video under three minutes that shows the app running on a real Fire TV or the Vega Virtual Device.
- An MIT `LICENSE` file at the repo root.
- Product feedback for every tool, API, and SDK used.
- No third-party trademarks or copyrighted music, images, or text in the video without permission.

### Keep these documents current as you work

**`docs/friction-log.md`.** Friction log entries can add up to 10% to the score. Every time a tool, SDK, or document gets in the way, add an entry in this format:

```
### <short title>
- Tool / doc:
- Task attempted:
- Steps taken:
- Expected:
- Actual:
- Severity: blocker | major | minor
- Workaround:
- Suggestion:
```

**`docs/product-feedback.md`.** For each tool: what it was used for, what worked, what needs work, how onboarding went, and whether we would use it again. Cover the Vega SDK, Vega Studio, the Vega Virtual Device, the Builder Tools MCP, and Kiro.

**`docs/aws-integrations.md`.** One row per AWS service: what it does here and the file paths that use it. This is the evidence for the AWS Builder mini challenge.

### What the judges reward

- Fire TV track: voice, remote and screen working together in one flow, and viewing that adapts to the household. A basic streaming screen or a simple remote-controlled list is rated "obvious".
- AWS Builder: a multi-service pipeline and agent orchestration with Bedrock, AgentCore and Strands. A single Bedrock call is rated "obvious".
- All tracks: a complete product experience that fits the device, and a specific customer need.

### Platform rule to respect

Do not link from Recco directly to video inside another streaming app. Amazon's developer docs allow that only between associated apps, and Plex said Amazon asked it to remove the feature from its Fire TV app. Use the Alexa line instead.
