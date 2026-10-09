import { describe, expect, it } from "vitest";
import { extractUrls, matchFriend, originWithoutFriend, resolveFriend, toFirstName } from "./friends";
import { friend } from "./test-helpers";

const friends = [friend("f1", "Jordan"), friend("f2", "Steph")];

describe("friend names", () => {
  it("stores first names only", () => {
    expect(toFirstName("jordan smith")).toBe("Jordan");
    expect(toFirstName("  STEPH ")).toBe("Steph");
    expect(toFirstName("Mary-Kate")).toBe("Mary-kate");
    expect(toFirstName("O'Brien")).toBe("O'brien");
    expect(toFirstName("Zoë")).toBe("Zoë");
    expect(toFirstName("!!!")).toBeNull();
  });

  it("match ignoring case", () => {
    expect(matchFriend("JORDAN", friends)?.id).toBe("f1");
    expect(matchFriend("steph", friends)?.id).toBe("f2");
    expect(matchFriend("Priya", friends)).toBeUndefined();
  });

  it("create a new friend for an unseen name", () => {
    expect(resolveFriend("jordan", friends)).toEqual({ kind: "existing", friend: friends[0] });
    expect(resolveFriend("priya k", friends)).toEqual({ kind: "create", name: "Priya" });
    expect(resolveFriend(undefined, friends)).toEqual({ kind: "none" });
    expect(resolveFriend("", friends)).toEqual({ kind: "none" });
  });
});

describe("no name", () => {
  it("a text goes to From me", () => {
    expect(originWithoutFriend("Severance")).toBe("me");
  });

  it("a bare link goes to From the internet", () => {
    expect(originWithoutFriend("https://www.tiktok.com/@a/video/1")).toBe("internet");
    expect(originWithoutFriend("  https://vm.tiktok.com/x  ")).toBe("internet");
  });

  it("a link with her own words goes to From me", () => {
    expect(originWithoutFriend("this looks good https://youtu.be/x")).toBe("me");
  });

  it("finds links", () => {
    expect(extractUrls("a https://x.com/1 b http://y.com/2")).toEqual(["https://x.com/1", "http://y.com/2"]);
  });
});
