import { afterEach, describe, expect, it, vi } from "vitest";
import { AppSyncEventsPublisher, channelPath } from "./appsync";

describe("AppSync Events", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps channel ids to valid channel paths", () => {
    expect(channelPath("ch_abc123")).toBe("/recco/ch-abc123");
    expect(channelPath("ch_demo_household")).toBe("/recco/ch-demo-household");
    expect(channelPath("x".repeat(80)).length).toBe("/recco/".length + 50);
  });

  it("publishes one stringified event to the household channel with the API key", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await new AppSyncEventsPublisher({ httpDomain: "abc.appsync-api.us-east-2.amazonaws.com", realtimeDomain: "r", apiKey: "da2-key" }).publish("ch_1", {
      type: "card.pending",
      messageId: "m1",
      receivedAt: "t",
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://abc.appsync-api.us-east-2.amazonaws.com/event");
    expect(init.headers).toMatchObject({ "x-api-key": "da2-key" });
    expect(JSON.parse(init.body as string)).toEqual({
      channel: "/recco/ch-1",
      events: [JSON.stringify({ type: "card.pending", messageId: "m1", receivedAt: "t" })],
    });
  });

  it("does not throw when publishing fails (TVs fall back to polling)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 401 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(new AppSyncEventsPublisher({ httpDomain: "h", realtimeDomain: "r", apiKey: "k" }).publish("ch", { type: "card.failed", messageId: "m" })).resolves.toBeUndefined();
  });
});
