/**
 * The Auto theme: which seasonal scene fits the TV's local date and time. There
 * is no spring scene, so March stays winter and April and May are summer. Day
 * and night use fixed hours, because the TV's location (for real sunrise and
 * sunset) is not known. Northern-hemisphere seasons; every household so far is
 * in Canada or the US.
 */
export type Season = "winter" | "summer" | "fall";
export type SceneKey = `${Season}${"Day" | "Night"}`;

/** Day runs from 7:00 to 18:59 local time. */
export const DAY_START_HOUR = 7;
export const NIGHT_START_HOUR = 19;

/** Season for a month, 0 (January) to 11 (December). */
export function seasonFor(month: number): Season {
  if (month === 11 || month <= 2) return "winter";
  if (month <= 7) return "summer";
  return "fall";
}

export function isDaytime(hour: number): boolean {
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR;
}

/** The scene for a moment, read in the device's local time zone. */
export function sceneFor(now: Date): SceneKey {
  const time = isDaytime(now.getHours()) ? "Day" : "Night";
  return `${seasonFor(now.getMonth())}${time}`;
}
