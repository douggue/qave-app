import { locale, t, type StringKey } from '@/i18n';

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

const useKm = /-CA$/i.test(locale) || /^fr/i.test(locale);

/** Miles from you on the 1400x1800 world (600 units per mile, as in the mockup). */
export const milesFromMe = (spot: Pick<Spot, 'x' | 'y'>) => Math.hypot(spot.x - ME.x, spot.y - ME.y) / 600;

export function formatDistance(spot: Pick<Spot, 'x' | 'y'>): string {
  const miles = milesFromMe(spot);
  if (miles < 0.25) return t('dist.walk', { n: Math.max(1, Math.round(miles * 20)) });
  const value = useKm ? miles * 1.609 : miles;
  const d = value.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return t(useKm ? 'dist.km' : 'dist.mi', { d });
}

export function formatClock(time: ClockTime): string {
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
    distance: formatDistance(spot),
  });
  const mood = moodText(spot);
  return mood ? t('pin.a11yMood', { label, mood }) : label;
}
