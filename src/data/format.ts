import { getLocale, t, type StringKey } from '@/i18n';

import { ME } from './repo';
import type { ClockTime, Report, Spot, Until } from './types';

// Display helpers shared by the map, sheet and spot page (03-ux-eater-flows.md 1.2).

const KIND_KEY: Record<Spot['kind'], StringKey> = {
  truck: 'kind.truck',
  trailer: 'kind.trailer',
  cart: 'kind.cart',
  popup: 'kind.popup',
  restaurant: 'kind.restaurant',
};

export const kindLabel = (spot: Spot) => t(KIND_KEY[spot.kind]);
export const isMobile = (spot: Spot) => spot.kind === 'truck' || spot.kind === 'cart' || spot.kind === 'trailer';

const metricLocale = () => {
  const locale = getLocale();
  return /-CA$/i.test(locale) || /^fr/i.test(locale);
};

/** Miles from you on the 1400x1800 world (600 units per mile, as in the mockup). */
export const milesFromMe = (spot: Pick<Spot, 'x' | 'y'>) => Math.hypot(spot.x - ME.x, spot.y - ME.y) / 600;

/**
 * "0.4 mi", "6 min walk", or with `long` the spoken form for screen readers:
 * "0.4 miles away", "650 meters away", "1.2 kilometers away".
 */
export function formatDistance(spot: Pick<Spot, 'x' | 'y'>, opts?: { long?: boolean }): string {
  const locale = getLocale();
  const km = metricLocale();
  const miles = milesFromMe(spot);
  if (opts?.long) {
    if (km && miles * 1.609 < 1) return t('dist.mLong', { n: Math.max(50, Math.round((miles * 1609) / 50) * 50) });
    const value = km ? miles * 1.609 : miles;
    const d = value.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    return t(km ? 'dist.kmLong' : 'dist.miLong', { d });
  }
  if (miles < 0.25) return t('dist.walk', { n: Math.max(1, Math.round(miles * 20)) });
  const value = km ? miles * 1.609 : miles;
  const d = value.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return t(km ? 'dist.km' : 'dist.mi', { d });
}

export function formatClock(time: ClockTime): string {
  const locale = getLocale();
  const date = new Date(2024, 0, 7 + (time.day ?? 0), time.h, time.m);
  let clock: string;
  try {
    clock = date.toLocaleTimeString(locale, time.m ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' });
  } catch {
    clock = `${time.h}:${String(time.m).padStart(2, '0')}`;
  }
  if (time.day === undefined) return clock;
  let day: string;
  try {
    day = date.toLocaleDateString(locale, { weekday: 'short' });
  } catch {
    day = String(time.day);
  }
  return t('time.dayAt', { day, time: clock });
}

export const formatUntil = (until: Until) => ('key' in until ? t(until.key) : formatClock(until));

/** "Here now · until 10 PM", "Open · until 3 PM" or "Next: Sat 9 AM". The open flag is static tonight. */
export function statusText(spot: Spot): string {
  const until = formatUntil(spot.until);
  if (!spot.open) return t('status.next', { until });
  return t(isMobile(spot) ? 'status.hereNow' : 'status.open', { until });
}

export const priceText = (spot: Spot) => '$'.repeat(spot.price);

/** Minutes left before a closing-soon spot closes, or null when it is not closing soon (idea B). */
export function closingLeft(spot: Spot, now: number, appStart: number): number | null {
  if (!spot.open || spot.closesInMin === undefined) return null;
  const left = spot.closesInMin - Math.floor((now - appStart) / 60_000);
  return left <= 60 ? left : null;
}

export const closingText = (left: number) => (left > 0 ? t('status.closesIn', { min: left }) : t('status.closingNow'));

export type Freshness = { label: string; tone: 'mint' | 'ink2' | 'amber' };

/** The "Still there?" label, from the newest report or confirmation for the spot (idea A). */
export function freshness(
  spotId: string,
  reports: Report[],
  stillHereAt: number | undefined,
  now: number,
  appStart: number,
): Freshness {
  if (stillHereAt && now - stillHereAt < 2 * 60_000) return { label: t('fresh.you'), tone: 'mint' };
  let newest = stillHereAt ?? 0;
  for (const r of reports) {
    if (r.spotId !== spotId) continue;
    const at = r.createdAt ?? appStart - (r.ageMin ?? 0) * 60_000;
    if (at > newest) newest = at;
  }
  if (!newest) return { label: t('fresh.none'), tone: 'ink2' };
  const min = Math.max(0, Math.floor((now - newest) / 60_000));
  if (min < 15) return { label: t('fresh.min', { min }), tone: 'mint' };
  if (min <= 60) return { label: t('fresh.min', { min }), tone: 'ink2' };
  return { label: t('fresh.hr', { hr: Math.floor(min / 60) }), tone: 'amber' };
}

export const moodText = (spot: Spot) => (spot.mood ? t(spot.mood.key, spot.mood.params) : null);

/** The pin label: "name, kind, status, distance", plus the reported mood. */
export function pinLabel(spot: Spot): string {
  const label = t('pin.a11y', {
    name: spot.name,
    kind: kindLabel(spot),
    status: statusText(spot),
    distance: formatDistance(spot, { long: true }),
  });
  const mood = moodText(spot);
  return mood ? t('pin.a11yMood', { label, mood }) : label;
}

/** Short weekday name, Monday first (0 = Monday). */
export function weekdayShort(mondayIndex: number, style: 'short' | 'long' = 'short'): string {
  const locale = getLocale();
  const date = new Date(2024, 0, 1 + mondayIndex); // 1 Jan 2024 was a Monday.
  try {
    return date.toLocaleDateString(locale, { weekday: style });
  } catch {
    return String(mondayIndex + 1);
  }
}

/** Today as a Monday-first index. */
export const todayIndex = (now: number) => (new Date(now).getDay() + 6) % 7;

/** "just now", "4 min ago", "2 hr ago" for a report. */
export function reportAgo(report: Report, now: number, appStart: number): string {
  const at = report.createdAt ?? appStart - (report.ageMin ?? 0) * 60_000;
  const min = Math.max(0, Math.floor((now - at) / 60_000));
  if (min < 1) return t('spot.justNow');
  if (min < 60) return t('spot.minAgo', { min });
  return t('spot.hrAgo', { hr: Math.floor(min / 60) });
}

const BUSY_WORDS: { min: number; key: StringKey }[] = [
  { min: 9, key: 'busy.peak' },
  { min: 6, key: 'busy.busy' },
  { min: 3, key: 'busy.little' },
  { min: 1, key: 'busy.quiet' },
  { min: 0, key: 'busy.closed' },
];
export const busyWord = (v: number) => t((BUSY_WORDS.find((w) => v >= w.min) ?? BUSY_WORDS[4]).key);

export function formatPrice(price: number): string {
  const locale = getLocale();
  try {
    return price.toLocaleString(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price % 1 ? 2 : 0,
    });
  } catch {
    return `$${price}`;
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Ticking countdown text: "m:ss" under an hour, "h:mm:ss" under a day, else "1d 3h". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return t('time.countDH', { d, h });
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${m}:${pad2(s)}`;
}

/** The same countdown in words, by the minute, for screen readers (never read every tick). */
export function countdownWords(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const days = d === 1 ? t('time.day1') : t('time.days', { n: d });
  const hours = h === 1 ? t('time.hour1') : t('time.hours', { n: h });
  const mins = m <= 1 ? t('time.min1') : t('time.mins', { n: m });
  if (d > 0) return h > 0 ? t('time.words2', { a: days, b: hours }) : days;
  if (h > 0) return m > 0 ? t('time.words2', { a: hours, b: mins }) : hours;
  return mins;
}
