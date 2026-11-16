import { brand } from '@/constants/brand';

// Design tokens from design/night-build/01-ui-design-system.md.
// Night is the hero look; day has the same keys so the auto theme can swap them.

// The "Mix" identity (design/identity/mix-night.html, mix-day.html; DESIGN_LOG "Identity: Mix").
// Night is the hero look; day has the same keys so the auto theme can swap them.
// ink3 is for icons, rules and dimmed art only: as text it is below 4.5:1, so text uses ink or ink2.

const night = {
  paper: '#0f0c14',
  /** The bottom panel and sheets. */
  sheet: '#17131f',
  card: '#1f1928',
  /** Chips, tiles and inner wells on a card. */
  card2: '#2a2333',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.14)',
  glass: 'rgba(28,23,36,0.86)',
  scrim: 'rgba(8,6,12,0.70)',
  ink: '#f7f2ff',
  ink2: '#a9a1bb',
  ink3: '#6e6782',
  hot: '#ff5a3c',
  hot2: '#ff2d6f',
  neon: '#ffcc33',
  mint: '#3ee0a1',
  grape: '#a585ff',
  sky: '#4aa8ff',
  amber: '#ffb020',
  mintFill: '#3ee0a1',
  hotFill: '#ff5a3c',
  onNeon: '#17131a',
  onMint: '#062a1d',
  onGrape: '#140c33',
  onHot: '#ffffff',
  focus: '#ffcc33',
  /** The small accent: unread dot, star. */
  accent: '#ffcc33',
  /** Category tiles: resting and selected fill, and the selected ring. */
  tile: '#221c2b',
  tileOn: '#3a2f1a',
  tileRing: '#ffcc33',
  /** Pin tags under stickers. */
  tagBg: 'rgba(15,12,20,0.86)',
  tagInk: '#e9e2f5',
  /** The tab bar. */
  bar: '#0f0c14',
  /** Sticker anatomy: outline and the hard offset drop under cards and buttons. */
  stickerLine: 'rgba(255,255,255,0.14)',
  stickerDrop: 'rgba(0,0,0,0.65)',
  /** The yellow button's own outline (a dark keyline at night, ink by day) and drop. */
  ctaLine: '#0b0910',
  ctaDrop: '#000000',
  /** Rank numbers: sun fill with this stroke. */
  rankStroke: '#0f0c14',
  /** The 7-day strip's today cell. */
  dayOn: '#ffcc33',
  dayOnInk: '#17131a',
  /** The selected pin's warm halo and its distance ring text. */
  halo: '#ffcc33',
  haloAlpha: '0.45',
  ringInk: '#ffd970',
  /** Crowd halo pill. */
  crowdPill: '#f7f2ff',
  crowdInk: '#17131f',
  pinShadow: 'rgba(0,0,0,0.55)',
  toastBg: '#f7f2ff',
  toastInk: '#17131f',
  tintMint: 'rgba(62,224,161,0.14)',
  tintNeon: 'rgba(255,204,51,0.14)',
  tintAmber: 'rgba(255,176,32,0.14)',
  tintGrape: 'rgba(165,133,255,0.16)',
  shadow: '#000000',
  // Brand colors, the same in both palettes.
  sun: brand.sun,
  grill: brand.grill,
  chili: brand.chili,
  night: brand.night,
  moon: brand.moon,
};

export type Palette = { [K in keyof typeof night]: string };
export type PaletteKey = keyof Palette;

const day: Palette = {
  paper: '#f7f1e6',
  sheet: '#fffaf1',
  card: '#ffffff',
  card2: '#f3ead9',
  line: 'rgba(23,19,26,0.08)',
  line2: 'rgba(23,19,26,0.18)',
  glass: '#ffffff',
  scrim: 'rgba(23,19,26,0.45)',
  ink: '#17131a',
  ink2: '#5f5664',
  ink3: '#9a8f9c',
  hot: '#c23c0a',
  hot2: '#c9174f',
  neon: '#ffcc33',
  mint: '#08744d',
  grape: '#6b46d9',
  sky: '#1769c4',
  amber: '#a15c00',
  mintFill: '#3ee0a1',
  hotFill: '#ff5a3c',
  onNeon: '#17131a',
  onMint: '#062a1d',
  onGrape: '#ffffff',
  onHot: '#ffffff',
  focus: '#17131a',
  accent: '#ff5a3c',
  tile: '#f3ead9',
  tileOn: '#ffe9a6',
  tileRing: '#17131a',
  tagBg: '#17131a',
  tagInk: '#fff6e0',
  bar: '#fffaf1',
  stickerLine: '#17131a',
  stickerDrop: '#17131a',
  ctaLine: '#17131a',
  ctaDrop: '#17131a',
  rankStroke: '#17131a',
  dayOn: '#17131a',
  dayOnInk: '#fff6e0',
  halo: '#ffcc33',
  haloAlpha: '0.75',
  ringInk: '#17131a',
  crowdPill: '#17131a',
  crowdInk: '#fff6e0',
  pinShadow: 'rgba(80,50,20,0.35)',
  toastBg: '#17131a',
  toastInk: '#fff6e0',
  tintMint: 'rgba(8,116,77,0.12)',
  tintNeon: 'rgba(255,204,51,0.30)',
  tintAmber: 'rgba(161,92,0,0.12)',
  tintGrape: 'rgba(107,70,217,0.12)',
  shadow: '#17131a',
  sun: brand.sun,
  grill: brand.grill,
  chili: brand.chili,
  night: brand.night,
  moon: brand.moon,
};

export const palettes = { night, day } as const;
export { brand };

/** Map world colors, used only by the map component: muted, so the stickers carry the color. */
const mapNight = {
  bg: '#14111b',
  road: '#1f1a28',
  block: '#16121d',
  bldg: '#1a1622',
  park: '#122019',
  tree: '#16291f',
  water: '#0f1a2a',
  bank: '#121f30',
  ave: '#2d2433',
  aveO: '#352b3d',
  hwy: '#3a2d3f',
  hwyO: '#45364a',
  label: '#5d5570',
  wl: '#3f5f88',
};
export type MapPalette = { [K in keyof typeof mapNight]: string };
const mapDay: MapPalette = {
  bg: '#f1e9db',
  road: '#ffffff',
  block: '#f1e9db',
  bldg: '#e8dcc7',
  park: '#cfe5b6',
  tree: '#b6d79a',
  water: '#bfe0ee',
  bank: '#d8edf3',
  ave: '#ffd98a',
  aveO: '#f2c66a',
  hwy: '#ffc56e',
  hwyO: '#eea952',
  label: '#a0937d',
  wl: '#5d95b5',
};
export const mapPalettes = { night: mapNight, day: mapDay } as const;

export const gradients = {
  /** Sun to grill to chili: the Report button only. */
  brand: ['#ffb23d', '#ff5a3c', '#ff2d6f'],
  aiCard: ['rgba(165,133,255,0.16)', 'rgba(74,168,255,0.08)'],
} as const;

const display = 'Unbounded_800ExtraBold';
const ui = 'Figtree_700Bold';
const uiHeavy = 'Figtree_800ExtraBold';
const uiSemi = 'Figtree_600SemiBold';
const uiMedium = 'Figtree_500Medium';

/** Type scale: Unbounded 800 for display, Figtree for everything else. */
export const type = {
  /** The map home headline ("Tacos are out."). */
  hero: { fontFamily: display, fontSize: 30, lineHeight: 35, letterSpacing: -0.8 },
  /** The spot page name. */
  name: { fontFamily: display, fontSize: 31, lineHeight: 36, letterSpacing: -0.8 },
  display: { fontFamily: display, fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  title: { fontFamily: display, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  heading: { fontFamily: display, fontSize: 18, lineHeight: 24, letterSpacing: -0.3 },
  /** Card titles (Busy times, Top dishes, Live reports). */
  cardTitle: { fontFamily: uiHeavy, fontSize: 16, lineHeight: 21 },
  ui: { fontFamily: ui, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: uiMedium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: uiSemi, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: uiSemi, fontSize: 12.5, lineHeight: 16 },
  micro: { fontFamily: uiSemi, fontSize: 11, lineHeight: 14, letterSpacing: 0.2 },
  /** Eyebrow labels: 11 pt caps tracked 1.8 (pass the text upper-cased). */
  eyebrow: { fontFamily: ui, fontSize: 11, lineHeight: 15, letterSpacing: 1.8 },
} as const;
export type TypeVariant = keyof typeof type;

export const emojiSize = { xs: 14, sm: 18, md: 24, lg: 32, xl: 48, hero: 72 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 } as const;

/**
 * Sticker anatomy (cards, buttons, tiles): an outline plus a hard drop offset straight down.
 * Drawn as a sibling view behind the face, so it is identical on iOS, Android and the web.
 */
export const sticker = {
  night: { line: 1.5, drop: 5 },
  day: { line: 2, drop: 5 },
} as const;
export const minTap = 44;
/** Comfortable tap target for chips and small controls. */
export const tapComfort = 48;
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const screenPad = 16;

export const elevation = {
  e0: {},
  e1: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  e2: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  e3: { shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: -10 }, elevation: 16 },
} as const;

/** Blend two #rrggbb colors: 0 gives `a`, 1 gives `b`. */
export const mix = (a: string, b: string, amount: number) => {
  const pa = parseInt(a.replace('#', '').slice(0, 6), 16);
  const pb = parseInt(b.replace('#', '').slice(0, 6), 16);
  const ch = (shift: number) => {
    const va = (pa >> shift) & 255;
    const vb = (pb >> shift) & 255;
    return Math.round(va + (vb - va) * amount);
  };
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
};

/** A #rrggbb color at the given opacity, as rgba(). */
export const withAlpha = (hex: string, a: number) => {
  const v = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
};

/** Soft colored glow (iOS and web). Mix rule: only the selected pin and the Report button glow. */
export const glow = (color: string, r = 16, o = 0.8) => ({
  shadowColor: color,
  shadowOpacity: o,
  shadowRadius: r,
  shadowOffset: { width: 0, height: 0 },
});
