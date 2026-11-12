// The only place (with src/data/sample.ts) where emoji characters live.
// Built-in emoji are placeholders: swap them here for the custom Lokal emoji later.
// Emoji are decorative everywhere: hide them from screen readers and put the meaning in a label.

export const food = {
  taco: '🌮',
  bbq: '🍖',
  croissant: '🥐',
  pho: '🍜',
  burger: '🍔',
  kolache: '🥯',
  jerk: '🍗',
  paleta: '🍦',
  supper: '🍲',
  curry: '🍛',
  dumpling: '🥟',
  coffee: '☕',
  rings: '🧅',
  fries: '🍟',
  shake: '🥤',
} as const;
export type FoodKey = keyof typeof food;

/** Glow color pair per food: [light, glow], from the mockup `col` pairs. */
export const foodGlow: Record<FoodKey, readonly [string, string]> = {
  taco: ['#ffb48f', '#ff6f4f'],
  bbq: ['#d9a77c', '#8a4b2a'],
  croissant: ['#ffe6a3', '#f5b94e'],
  pho: ['#bfe2ff', '#5ea8e8'],
  burger: ['#ffd68a', '#ff9f2e'],
  kolache: ['#ffd9b8', '#f0995a'],
  jerk: ['#b7ec9f', '#3fb36b'],
  paleta: ['#ffc2de', '#ff7fb3'],
  supper: ['#d9c8ff', '#8f6bff'],
  curry: ['#ffe1a1', '#f2a33a'],
  dumpling: ['#ffe3d1', '#ff9f80'],
  coffee: ['#e9d3bd', '#a8774f'],
  rings: ['#ffd68a', '#ff9f2e'],
  fries: ['#ffd68a', '#ff9f2e'],
  shake: ['#ffd68a', '#ff9f2e'],
};
export const glowFallback = ['#ffe0cc', '#ff9f80'] as const;

/** The color a pin glows with at night. Dark glow colors use the light one instead. */
export function pinGlow(key: FoodKey): string {
  const [light, strong] = foodGlow[key] ?? glowFallback;
  return key === 'bbq' || key === 'coffee' ? light : strong;
}

export const kind = {
  truck: '🚚',
  trailer: '🛻',
  cart: '🛒',
  popup: '🎪',
  restaurant: '🏠',
} as const;
export type KindKey = keyof typeof kind;

export const report = {
  amazing: '🔥',
  line: '⏳',
  deal: '💸',
  soldOut: '🛑',
  photo: '📸',
  newSpot: '🆕',
  news: '🆕',
  parked: '🚚',
} as const;
export type ReportEmojiKey = keyof typeof report;

export const status = {
  parked: '🚚',
  wait: '⏳',
  closing: '⏰',
  closingSoon: '⌛',
  soldOut: '🛑',
  closed: '💤',
  live: '🟢',
} as const;
export type StatusEmojiKey = keyof typeof status;

/** Mood bubbles over pins: an emoji key here plus a text key in i18n. */
export const mood = {
  hot: '🔥',
  line: '⏳',
  news: '🆕',
  parked: '🚚',
  soldOut: '🛑',
  deal: '💸',
  seats: '🎟️',
  wait: '⏳',
  closing: '⏰',
  closed: '💤',
} as const;
export type MoodEmojiKey = keyof typeof mood;

export const avatar = {
  me: '😋',
  cowboy: '🤠',
  fox: '🦊',
  panda: '🐼',
  frog: '🐸',
  unicorn: '🦄',
  octopus: '🐙',
  alien: '👽',
  robot: '🤖',
} as const;
export type AvatarKey = keyof typeof avatar;

export const avatarBg: Record<AvatarKey, string> = {
  me: '#ffe7b0',
  cowboy: '#ffe7b0',
  fox: '#ffe0cc',
  panda: '#e7e4ff',
  frog: '#dff5d0',
  unicorn: '#ffd6ec',
  octopus: '#d8f6ea',
  alien: '#d6ecff',
  robot: '#f0f0f0',
};

export const tab = {
  map: '🗺️',
  drops: '🎁',
  report: '+',
  ask: '✨',
  you: '🙂',
  today: '📊',
  where: '📍',
  golive: '📡',
  menu: '📋',
  promote: '📣',
} as const;
export type TabEmojiKey = keyof typeof tab;

export const note = {
  burger: '🍔',
  party: '🎉',
  timer: '⏳',
  dumpling: '🥟',
  taco: '🌮',
  live: '📡',
} as const;
export type NoteEmojiKey = keyof typeof note;

export const ui = {
  bell: '🔔',
  sun: '☀️',
  moon: '🌙',
  star: '⭐',
  recenter: '🎯',
  sparkles: '✨',
  dice: '🎲',
  plus: '+',
  minus: '−',
  check: '✓',
  close: '✕',
  back: '‹',
  chevron: '›',
  store: '🏪',
  construction: '🚧',
} as const;
export type UiEmojiKey = keyof typeof ui;
