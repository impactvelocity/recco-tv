import { describe, expect, it } from "vitest";
import { isForgetCommand, planMove } from "./forget";

describe("isForgetCommand", () => {
  it.each(["forget me", "FORGET ME", "Forget me", "  forget me  ", "forget me.", "Forget me!", "forget me?!", "forget  me", "forget me\n"])(
    "deletes on %j",
    (body) => {
      expect(isForgetCommand(body)).toBe(true);
    },
  );

  it.each(["Forget Me Not", "forget", "me", "please forget me", "forget me - Jordan", "forgetme", "STOP", "", "forget me https://x.com"])(
    "is a normal text: %j",
    (body) => {
      expect(isForgetCommand(body)).toBe(false);
    },
  );
});

describe("planMove", () => {
  it("joins when the TV has no household", () => {
    expect(planMove("d1", undefined, "hh_new", [])).toEqual({ kind: "join" });
  });

  it("stays when the phone's household is already the TV's", () => {
    expect(planMove("d1", "hh1", "hh1", ["d1", "d2"])).toEqual({ kind: "stay" });
  });

  it("forgets the old household when this was its only TV", () => {
    expect(planMove("d1", "hh1", "hh2", ["d1"])).toEqual({ kind: "move", from: "hh1", leaving: "forget" });
  });

  it("forgets the old household when it lists no TVs at all (already gone)", () => {
    expect(planMove("d1", "hh1", "hh2", [])).toEqual({ kind: "move", from: "hh1", leaving: "forget" });
  });

  it("keeps the old household for its other TVs, on a new channel", () => {
    expect(planMove("d1", "hh1", "hh2", ["d1", "d2"])).toEqual({ kind: "move", from: "hh1", leaving: "rotate" });
  });
});
