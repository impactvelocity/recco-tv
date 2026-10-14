import type {ImageSourcePropType} from 'react-native';

/**
 * The seven looks from the design handoff (Recco Style Guide). Sizes are for the
 * 1920×1080 canvas. A theme is colours, a still and a vignette; the vignette is
 * a separate layer so the looping video sits under it.
 */
export type ThemeKey =
  | 'fallDay'
  | 'fallNight'
  | 'winterDay'
  | 'winterNight'
  | 'summerDay'
  | 'summerNight'
  | 'default';

export interface Theme {
  key: ThemeKey;
  label: string;
  /** Solid app background, and the vignette colour. */
  canvas: string;
  /** Resting cards, tab track, gear (80% alpha). */
  surface: string;
  /** Focused card fill (72% alpha). */
  surfaceSolid: string;
  /** Drawer and settings panels (96% alpha). */
  surface2: string;
  /** Focused buttons: surface2 at full alpha. */
  surface2Solid: string;
  border: string;
  accent: string;
  /** The highlight: badges, gear stroke, active dot, check, Watched pill. */
  accent2: string;
  onAccent: string;
  text: string;
  textB: string;
  text2: string;
  textBubble: string;
  /** Message bubble gradient, 135°. */
  tint: [string, string];
  chipBg: string;
  chipBorder: string;
  focus: string;
  segOn: string;
  segOnFg: string;
  segOff: string;
  still: ImageSourcePropType;
  /**
   * A muted 10 s loop drawn over the still, read from the package
   * (apps/tv/assets/raw is copied to /pkg/assets/raw). None for Midnight blue.
   */
  video: string | null;
  /**
   * radial-gradient(ellipse 90% 90% at 50% 40%, transparent 30%, canvas), as its
   * own layer over the still. None for Midnight blue, a flat colour with its glow baked in.
   */
  vignette: ImageSourcePropType | null;
}

const surfaces = (rgb: string) => ({
  surface: `rgba(${rgb},.8)`,
  surfaceSolid: `rgba(${rgb},.72)`,
  surface2: `rgba(${rgb},.96)`,
  surface2Solid: `rgb(${rgb})`,
});

export const THEMES: Record<ThemeKey, Theme> = {
  fallDay: {
    key: 'fallDay',
    label: 'Fall · Day',
    canvas: '#555740',
    ...surfaces('41,54,45'),
    border: 'rgba(255,247,232,.22)',
    accent: '#D3632D',
    accent2: '#F0B667',
    onAccent: '#2A1A10',
    text: '#FFF7E8',
    textB: '#FFF7E8',
    text2: '#D5CFB9',
    textBubble: '#FFF7E8',
    tint: ['rgba(211,99,45,.42)', 'rgba(240,182,103,.22)'],
    chipBg: 'rgba(211,99,45,.25)',
    chipBorder: 'rgba(240,182,103,.45)',
    focus: '#F0B667',
    segOn: '#F0B667',
    segOnFg: '#2A1A10',
    segOff: 'rgba(255,247,232,.8)',
    still: require('../assets/backgrounds/fallDay.jpg'),
    video: '/pkg/assets/raw/fallDay.mp4',
    vignette: require('../assets/backgrounds/vignette-fallDay.png'),
  },
  fallNight: {
    key: 'fallNight',
    label: 'Fall · Night',
    canvas: '#1D2929',
    ...surfaces('18,28,30'),
    border: 'rgba(255,246,232,.2)',
    accent: '#C8572F',
    accent2: '#E28A3B',
    onAccent: '#1D1410',
    text: '#FFF6E8',
    textB: '#FFF6E8',
    text2: '#C4CAC0',
    textBubble: '#FFF6E8',
    tint: ['rgba(200,87,47,.42)', 'rgba(226,138,59,.22)'],
    chipBg: 'rgba(200,87,47,.25)',
    chipBorder: 'rgba(226,138,59,.45)',
    focus: '#E28A3B',
    segOn: '#E28A3B',
    segOnFg: '#1D1410',
    segOff: 'rgba(255,246,232,.8)',
    still: require('../assets/backgrounds/fallNight.jpg'),
    video: '/pkg/assets/raw/fallNight.mp4',
    vignette: require('../assets/backgrounds/vignette-fallNight.png'),
  },
  winterDay: {
    key: 'winterDay',
    label: 'Winter · Day',
    canvas: '#71889B',
    ...surfaces('38,54,66'),
    border: 'rgba(244,246,243,.25)',
    accent: '#516B7B',
    accent2: '#8CC8D8',
    onAccent: '#263642',
    text: '#FFFDF8',
    textB: '#FFFDF8',
    text2: '#D9E1E4',
    textBubble: '#FFFDF8',
    tint: ['rgba(94,117,108,.55)', 'rgba(175,200,216,.3)'],
    chipBg: 'rgba(81,107,123,.35)',
    chipBorder: 'rgba(175,200,216,.5)',
    focus: '#8CC8D8',
    segOn: '#8CC8D8',
    segOnFg: '#263642',
    segOff: 'rgba(255,253,248,.85)',
    still: require('../assets/backgrounds/winterDay.jpg'),
    video: '/pkg/assets/raw/winterDay.mp4',
    vignette: require('../assets/backgrounds/vignette-winterDay.png'),
  },
  winterNight: {
    key: 'winterNight',
    label: 'Winter · Night',
    canvas: '#152A43',
    ...surfaces('13,28,43'),
    border: 'rgba(175,201,232,.25)',
    accent: '#789ECC',
    accent2: '#8FBDE8',
    onAccent: '#10233A',
    text: '#F8FBFD',
    textB: '#F8FBFD',
    text2: '#BBCAD6',
    textBubble: '#F8FBFD',
    tint: ['rgba(120,158,204,.4)', 'rgba(175,201,232,.2)'],
    chipBg: 'rgba(120,158,204,.25)',
    chipBorder: 'rgba(175,201,232,.45)',
    focus: '#8FBDE8',
    segOn: '#8FBDE8',
    segOnFg: '#10233A',
    segOff: 'rgba(248,251,253,.8)',
    still: require('../assets/backgrounds/winterNight.jpg'),
    video: '/pkg/assets/raw/winterNight.mp4',
    vignette: require('../assets/backgrounds/vignette-winterNight.png'),
  },
  summerDay: {
    key: 'summerDay',
    label: 'Summer · Day',
    canvas: '#5EA7B6',
    ...surfaces('25,76,86'),
    border: 'rgba(255,253,247,.25)',
    accent: '#D7683D',
    accent2: '#F2D34F',
    onAccent: '#194C56',
    text: '#FFFDF7',
    textB: '#FFFDF7',
    text2: '#D5ECEA',
    textBubble: '#FFFDF7',
    tint: ['rgba(215,104,61,.5)', 'rgba(231,211,174,.25)'],
    chipBg: 'rgba(215,104,61,.3)',
    chipBorder: 'rgba(242,211,79,.5)',
    focus: '#F2D34F',
    segOn: '#D7683D',
    segOnFg: '#FFFDF7',
    segOff: 'rgba(255,253,247,.85)',
    still: require('../assets/backgrounds/summerDay.jpg'),
    video: '/pkg/assets/raw/summerDay.mp4',
    vignette: require('../assets/backgrounds/vignette-summerDay.png'),
  },
  summerNight: {
    key: 'summerNight',
    label: 'Summer · Night',
    canvas: '#174D68',
    ...surfaces('11,41,56'),
    border: 'rgba(131,188,212,.28)',
    accent: '#83BCD4',
    accent2: '#F0A64B',
    onAccent: '#0B2938',
    text: '#F8FCFC',
    textB: '#F8FCFC',
    text2: '#BDD9DF',
    textBubble: '#F8FCFC',
    tint: ['rgba(131,188,212,.4)', 'rgba(31,91,114,.35)'],
    chipBg: 'rgba(131,188,212,.25)',
    chipBorder: 'rgba(131,188,212,.5)',
    focus: '#F0A64B',
    segOn: '#83BCD4',
    segOnFg: '#0B2938',
    segOff: 'rgba(248,252,252,.85)',
    still: require('../assets/backgrounds/summerNight.jpg'),
    video: '/pkg/assets/raw/summerNight.mp4',
    vignette: require('../assets/backgrounds/vignette-summerNight.png'),
  },
  default: {
    key: 'default',
    label: 'Midnight blue',
    canvas: '#0E1218',
    ...surfaces('14,18,24'),
    border: 'rgba(255,255,255,.18)',
    accent: '#1A8CFF',
    accent2: '#3CC7F5',
    onAccent: '#06080C',
    text: '#FFFFFF',
    textB: '#D0D4DA',
    text2: '#9AA0A8',
    textBubble: '#E6F4FF',
    tint: ['rgba(30,140,255,.22)', 'rgba(60,199,245,.1)'],
    chipBg: 'rgba(30,140,255,.2)',
    chipBorder: 'rgba(60,199,245,.45)',
    focus: '#3CC7F5',
    segOn: '#FFFFFF',
    segOnFg: '#101114',
    segOff: 'rgba(255,255,255,.75)',
    still: require('../assets/backgrounds/default.jpg'),
    video: null,
    vignette: null,
  },
};

/** A saved choice: one theme, or Auto (the scene for the local date and time). */
export type ThemeChoice = 'auto' | ThemeKey;

/** The order Settings cycles through. */
export const THEME_ORDER: ThemeChoice[] = [
  'auto',
  'fallDay',
  'fallNight',
  'winterDay',
  'winterNight',
  'summerDay',
  'summerNight',
  'default',
];

export const DEFAULT_THEME: ThemeChoice = 'auto';

/** The type scale from the handoff. */
export const type = {
  pairingDigit: 150,
  onboarding: 128,
  empty: 84,
  featured: 68,
  drawer: 46,
  card: 30,
  tab: 26,
  synopsis: 26,
  bubble: 24,
  button: 23,
  meta: 19,
  chip: 15,
} as const;

export const radius = {
  pill: 999,
  panel: 28,
  card: 20,
  button: 14,
  poster: 14,
} as const;

/** Bubble with its tail at bottom left. */
export const bubbleCorners = {
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  borderBottomRightRadius: 18,
  borderBottomLeftRadius: 4,
} as const;

/** Side margins and the inbox grid. */
export const layout = {
  side: 96,
  gridGap: 28,
  cardWidth: 557,
  cardHeight: 414,
  cardPad: 18,
} as const;

/** Drop shadows (where the platform draws them). */
export const shadow = {
  poster: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.45,
    shadowRadius: 40,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 40},
    shadowOpacity: 0.6,
    shadowRadius: 90,
  },
  panel: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 40},
    shadowOpacity: 0.6,
    shadowRadius: 120,
  },
} as const;

/** Poster fill when there is no artwork, from the design's palette. */
export const POSTER_TINTS = [
  '#7A4E3A',
  '#3F5A6B',
  '#4E6A5A',
  '#6B5A3F',
  '#8A5A4E',
  '#8A6E3F',
  '#5A6B7A',
  '#3A3A4E',
  '#5A4E6B',
  '#2E3F4D',
];
