/**
 * The 10-foot look: dark, warm, calm. Sizes are for the 1920×1080 canvas.
 * No text below 28 px (R7.8).
 */
export const colors = {
  bg: '#14120f',
  surface: '#211e1a',
  surfaceRaised: '#2c2823',
  rule: '#3a352e',
  text: '#f4efe6',
  textMuted: '#c2b8a8',
  textFaint: '#958b7d',
  accent: '#e3a948',
  focus: '#f7f2e8',
  up: '#8cc196',
  down: '#d98b7a',
  warn: '#e0b25a',
} as const;

export const type = {
  display: 96,
  hero: 64,
  title: 44,
  heading: 36,
  body: 32,
  small: 28,
} as const;

export const space = {xs: 8, s: 16, m: 24, l: 40, xl: 64} as const;

/** Keep everything inside the TV-safe area. */
export const safe = {h: 96, v: 54} as const;

export const card = {width: 380, height: 214, gap: 28} as const;

/** Focus must change size and outline, not just colour. */
export const focusRing = {borderWidth: 5, scale: 1.07} as const;
