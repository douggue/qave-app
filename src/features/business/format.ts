import { formatClock } from '@/data/format';
import type { ClockTime } from '@/data/types';
import { t } from '@/i18n';

/** "11 PM" or "sold out". */
export const liveUntilText = (until: ClockTime | 'soldOut') =>
  until === 'soldOut' ? t('until.soldOut') : formatClock(until);

/** "7 min" or "1 h 12 min", by the minute. */
export function liveDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60_000));
  if (total < 60) return t('time.minShort', { n: total });
  return t('time.hm', { h: Math.floor(total / 60), m: total % 60 });
}
