import { describe, expect, it } from "vitest";
import { isDaytime, sceneFor, seasonFor } from "./scene";

/** A local-time date, so tests pass in any time zone. */
const at = (month: number, day: number, hour: number, minute = 0) =>
  new Date(2026, month, day, hour, minute);

describe("seasonFor", () => {
  it("maps every month, with March as winter and April–May as summer", () => {
    const seasons = Array.from({ length: 12 }, (_, m) => seasonFor(m));
    expect(seasons).toEqual([
      "winter", "winter", "winter",
      "summer", "summer", "summer", "summer", "summer",
      "fall", "fall", "fall",
      "winter",
    ]);
  });
});

describe("isDaytime", () => {
  it("is day from 7:00 up to 19:00", () => {
    expect(isDaytime(6)).toBe(false);
    expect(isDaytime(7)).toBe(true);
    expect(isDaytime(18)).toBe(true);
    expect(isDaytime(19)).toBe(false);
    expect(isDaytime(0)).toBe(false);
  });
});

describe("sceneFor", () => {
  it("combines season and time of day", () => {
    expect(sceneFor(at(9, 13, 12))).toBe("fallDay");
    expect(sceneFor(at(9, 13, 21))).toBe("fallNight");
    expect(sceneFor(at(0, 5, 8))).toBe("winterDay");
    expect(sceneFor(at(6, 1, 23))).toBe("summerNight");
  });

  it("changes at the boundaries", () => {
    expect(sceneFor(at(9, 13, 18, 59))).toBe("fallDay");
    expect(sceneFor(at(9, 13, 19, 0))).toBe("fallNight");
    expect(sceneFor(at(10, 30, 23, 59))).toBe("fallNight");
    expect(sceneFor(at(11, 1, 0, 0))).toBe("winterNight");
  });
});
