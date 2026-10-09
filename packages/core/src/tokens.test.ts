import { describe, expect, it } from "vitest";
import { deviceIdFromToken, deviceTokenMatches, hashDeviceToken, newDeviceToken } from "./tokens";

describe("device tokens", () => {
  it("carry the device id and match only their own hash", () => {
    const token = newDeviceToken("dev_1");
    expect(deviceIdFromToken(token)).toBe("dev_1");
    expect(deviceTokenMatches(token, hashDeviceToken(token))).toBe(true);
    expect(deviceTokenMatches(newDeviceToken("dev_1"), hashDeviceToken(token))).toBe(false);
  });

  it("reject malformed tokens", () => {
    expect(deviceIdFromToken("nodot")).toBeNull();
    expect(deviceIdFromToken(".x")).toBeNull();
  });
});
