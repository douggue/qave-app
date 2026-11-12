import { brand } from '@/constants/brand';

// Design tokens from design/night-build/01-ui-design-system.md.
// Night is the hero look; day has the same keys so the auto theme can swap them.

const night = {
  paper: '#0d0e19',
  card: '#171a2c',
  card2: '#1f2338',
  line: 'rgba(255,255,255,0.09)',
  glass: 'rgba(16,18,34,0.86)',
  scrim: 'rgba(5,6,14,0.70)',
  ink: '#f5f2ff',
  ink2: '#9d9abb',
  ink3: '#77748f',
  hot: '#ff5a3c',
  hot2: '#ff2d6f',
  neon: '#ffcc33',
  mint: '#34e0a1',
  grape: '#a585ff',
  sky: '#4aa8ff',
  amber: '#ffb020',
  mintFill: '#34e0a1',
  hotFill: '#ff5a3c',
  onNeon: '#1a1300',
  onMint: '#062a1d',
  onGrape: '#140c33',
  onHot: '#ffffff',
  focus: '#ffcc33',
  pinChip: '#1a1d33',
  pinChipBorder: 'rgba(255,255,255,0.22)',
  bubble: 'rgba(12,13,26,0.90)',
  bubbleInk: '#ffffff',
  toastBg: '#f5f2ff',
  toastInk: '#16172b',
  tintMint: 'rgba(52,224,161,0.14)',
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
  paper: '#f3f4f8',
  card: '#ffffff',
  card2: '#f0f0f6',
  line: 'rgba(22,23,43,0.10)',
  glass: 'rgba(255,255,255,0.92)',
  scrim: 'rgba(22,23,43,0.45)',
  ink: '#16172b',
  ink2: '#5a5876',
  ink3: '#9b99b0',
  hot: '#c23c0a',
  hot2: '#c9174f',
  neon: '#ffcc33',
  mint: '#0b7f56',
  grape: '#6b46d9',
  sky: '#1769c4',
  amber: '#a15c00',
  mintFill: '#34e0a1',
  hotFill: '#ff5a3c',
  onNeon: '#1a1300',
  onMint: '#062a1d',
  onGrape: '#ffffff',
  onHot: '#ffffff',
  focus: '#16172b',
  pinChip: '#ffffff',
  pinChipBorder: 'rgba(22,23,43,0.12)',
  bubble: '#ffffff',
  bubbleInk: '#16172b',
  toastBg: '#16172b',
  toastInk: '#f5f2ff',
  tintMint: 'rgba(11,127,86,0.12)',
  tintNeon: 'rgba(255,204,51,0.22)',
  tintAmber: 'rgba(161,92,0,0.12)',
  tintGrape: 'rgba(107,70,217,0.12)',
  shadow: '#16172b',
  sun: brand.sun,
  grill: brand.grill,
  chili: brand.chili,
  night: brand.night,
  moon: brand.moon,
};

export const palettes = { night, day } as const;
export { brand };

/** Map world colors, used only by the map component. */
const mapNight = {
  bg: '#0d0e19',
  road: '#262a46',
  block: '#151829',
  bldg: '#1b1f36',
  park: '#13291f',
  tree: '#1d4632',
  water: '#0e2546',
  bank: '#133158',
  ave: '#d9a134',
  aveO: '#8f6417',
  hwy: '#ff7a45',
  hwyO: '#9c3f17',
  label: '#68668c',
  wl: '#4e86c4',
};
export type MapPalette = { [K in keyof typeof mapNight]: string };
const mapDay: MapPalette = {
  bg: '#f3f4f8',
  road: '#fdfdfb',
  block: '#eceee4',
  bldg: '#e0e3d4',
  park: '#cfe9b9',
  tree: '#a9d68d',
  water: '#a8dcf5',
  bank: '#d3edf9',
  ave: '#ffd866',
  aveO: '#efbd3c',
  hwy: '#ff9f59',
  hwyO: '#e57f35',
  label: '#86839e',
  wl: '#4f95bf',
};
export const mapPalettes = { night: mapNight, day: mapDay } as const;

export const gradients = {
  brand: ['#ffcc33', '#ff7a45', '#ff2d6f'],
  hotIcon: ['#ff5a3c', '#ff2d6f'],
  hotBtn: ['#d93a26', '#d81b5a'],
  aiCard: ['rgba(165,133,255,0.16)', 'rgba(74,168,255,0.08)'],
  perk: ['rgba(255,204,51,0.16)', 'rgba(255,90,60,0.12)'],
  liveOn: ['rgba(52,224,161,0.28)', 'rgba(52,224,161,0)'],
  artShade: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.18)'],
} as const;

const display = 'Unbounded_800ExtraBold';
const ui = 'Figtree_700Bold';

/** Type scale. Only two families are loaded, so hierarchy comes from size and color. */
export const type = {
  display: { fontFamily: display, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  title: { fontFamily: display, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  heading: { fontFamily: display, fontSize: 18, lineHeight: 24 },
  /** Card titles (Busy times, Top dishes, Live reports). Unbounded stays for display, title and section headers. */
  cardTitle: { fontFamily: ui, fontSize: 17, lineHeight: 22 },
  ui: { fontFamily: ui, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: ui, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: ui, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: ui, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: ui, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
} as const;
export type TypeVariant = keyof typeof type;

export const emojiSize = { xs: 14, sm: 18, md: 24, lg: 32, xl: 48, hero: 72 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
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

/** A #rrggbb color at the given opacity, as rgba(). */
export const withAlpha = (hex: string, a: number) => {
  const v = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
};

/** Soft colored glow (iOS and web). Android needs a halo view behind the element instead. */
export const glow = (color: string, r = 16, o = 0.8) => ({
  shadowColor: color,
  shadowOpacity: o,
  shadowRadius: r,
  shadowOffset: { width: 0, height: 0 },
});
