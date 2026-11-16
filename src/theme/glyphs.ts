import type { IconName } from '@/components/ui/Icon';

import {
  avatar,
  food,
  kind,
  mood,
  note,
  report,
  status,
  tab,
  ui,
  type AvatarKey,
  type FoodKey,
  type KindKey,
  type MoodEmojiKey,
  type NoteEmojiKey,
  type ReportEmojiKey,
  type StatusEmojiKey,
  type TabEmojiKey,
  type UiEmojiKey,
} from './emoji';
import type { Palette } from './tokens';

// What each emoji key in src/theme/emoji.ts renders as: a custom food sticker, or a drawn icon
// with an optional semantic color. Moods, reports and statuses carry a tone so they read as
// colored badges; controls (ui, tab, kind) take the color of where they sit. Only avatars
// (people's faces) still render as emoji. <Glyph> in src/components/ui/Glyph.tsx draws these.

/** Semantic colors for drawn glyphs. `brand` is the sun-to-chili gradient. */
export type GlyphTone = 'brand' | 'hot' | 'amber' | 'mint' | 'sky' | 'grape' | 'ink3' | 'ink';

export type IconGlyph = { icon: IconName; tone?: GlyphTone };
export type Glyph = IconGlyph | { food: FoodKey } | { avatar: AvatarKey };

/** An emoji string from src/theme/emoji.ts, or a glyph picked directly (for emoji that mean two things). */
export type GlyphSource = string | Glyph;

const HOT: IconGlyph = { icon: 'flame', tone: 'brand' };
const LINE: IconGlyph = { icon: 'timer', tone: 'amber' };
const DEAL: IconGlyph = { icon: 'cash', tone: 'mint' };
const SOLD_OUT: IconGlyph = { icon: 'stop', tone: 'hot' };
const NEWS: IconGlyph = { icon: 'new', tone: 'grape' };
const PARKED: IconGlyph = { icon: 'truck', tone: 'sky' };
const CLOSING: IconGlyph = { icon: 'alarm', tone: 'amber' };

export const moodGlyph: Record<MoodEmojiKey, IconGlyph> = {
  hot: HOT,
  line: LINE,
  news: NEWS,
  parked: PARKED,
  soldOut: SOLD_OUT,
  deal: DEAL,
  seats: { icon: 'ticket', tone: 'grape' },
  wait: LINE,
  closing: CLOSING,
  closed: { icon: 'sleep', tone: 'ink3' },
};

export const reportGlyph: Record<ReportEmojiKey, IconGlyph> = {
  amazing: HOT,
  line: LINE,
  deal: DEAL,
  soldOut: SOLD_OUT,
  photo: { icon: 'camera', tone: 'sky' },
  newSpot: NEWS,
  news: NEWS,
  parked: PARKED,
};

export const statusGlyph: Record<StatusEmojiKey, IconGlyph> = {
  parked: PARKED,
  wait: LINE,
  closing: CLOSING,
  closingSoon: CLOSING,
  soldOut: SOLD_OUT,
  closed: { icon: 'sleep', tone: 'ink3' },
  live: { icon: 'live', tone: 'mint' },
};

/** Spot types: drawn, because detailed art does not read at 12 pt. */
export const kindGlyph: Record<KindKey, IconGlyph> = {
  truck: { icon: 'truck' },
  trailer: { icon: 'trailer' },
  cart: { icon: 'cart' },
  popup: { icon: 'tent' },
  restaurant: { icon: 'store' },
};

export const tabGlyph: Record<TabEmojiKey, IconGlyph> = {
  map: { icon: 'map' },
  drops: { icon: 'drops' },
  report: { icon: 'plus' },
  ask: { icon: 'ask' },
  you: { icon: 'you' },
  today: { icon: 'today' },
  where: { icon: 'where' },
  golive: { icon: 'golive' },
  menu: { icon: 'menu' },
  promote: { icon: 'promote' },
};

export const noteGlyph: Record<NoteEmojiKey, Glyph> = {
  burger: { food: 'burger' },
  party: { icon: 'party', tone: 'brand' },
  timer: LINE,
  dumpling: { food: 'dumpling' },
  taco: { food: 'taco' },
  live: { icon: 'golive', tone: 'mint' },
};

export const uiGlyph: Record<UiEmojiKey, IconGlyph> = {
  bell: { icon: 'bell' },
  sun: { icon: 'sun' },
  moon: { icon: 'moon' },
  star: { icon: 'star', tone: 'amber' },
  recenter: { icon: 'recenter' },
  sparkles: { icon: 'ask' },
  dice: { icon: 'surprise' },
  plus: { icon: 'plus' },
  minus: { icon: 'minus' },
  check: { icon: 'check' },
  close: { icon: 'close' },
  back: { icon: 'back' },
  chevron: { icon: 'chevron' },
  store: { icon: 'store' },
  construction: { icon: 'cone', tone: 'amber' },
  go: { icon: 'go' },
  pin: { icon: 'where' },
  share: { icon: 'share' },
  thumbUp: { icon: 'confirm' },
  thumbDown: { icon: 'confirm' },
  owner: { icon: 'chef' },
  send: { icon: 'send' },
  bellOn: { icon: 'bell' },
  copy: { icon: 'copy' },
  timer: { icon: 'timer' },
  gift: { icon: 'gift' },
  sparkle: { icon: 'sparkle' },
};

/** Every map entry by its emoji. Earlier maps win where one emoji means two things (the clipboard is copy, not menu). */
const BY_EMOJI = new Map<string, Glyph>();
const add = <K extends string>(emoji: Record<K, string>, glyphs: Record<K, Glyph>) => {
  for (const key of Object.keys(emoji) as K[]) if (!BY_EMOJI.has(emoji[key])) BY_EMOJI.set(emoji[key], glyphs[key]);
};
add(ui, uiGlyph);
add(status, statusGlyph);
add(report, reportGlyph);
add(mood, moodGlyph);
add(tab, tabGlyph);
add(kind, kindGlyph);
add(note, noteGlyph);
for (const key of Object.keys(food) as FoodKey[]) BY_EMOJI.set(food[key], { food: key });
for (const key of Object.keys(avatar) as AvatarKey[]) BY_EMOJI.set(avatar[key], { avatar: key });

/** The glyph for an emoji from src/theme/emoji.ts, or undefined if it is not one of ours. */
export function resolveGlyph(source: GlyphSource | undefined): Glyph | undefined {
  if (!source) return undefined;
  return typeof source === 'string' ? BY_EMOJI.get(source) : source;
}

/** A glyph tone in the given palette; the brand gradient comes back as 'brand' (Icon's BRAND_TINT). */
export function toneColor(tone: GlyphTone, c: Palette): string {
  // Mix: the brand gradient lives only on the Report button, so 'brand' icons draw in solid hot.
  return tone === 'brand' ? c.hot : c[tone];
}
