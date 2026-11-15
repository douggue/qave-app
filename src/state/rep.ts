import type { StringKey } from '@/i18n';

// All rep values and levels live here. Rep is quiet: earned only by helping other eaters.
export const REP = {
  report: 5,
  checkIn: 10,
  stillHere: 2,
  /** Confirming a report ("Still true") or saying "Not anymore", once per report. */
  vote: 1,
  claimDrop: 0,
} as const;

export const LEVELS: readonly { key: StringKey; min: number }[] = [
  { key: 'level.newcomer', min: 0 },
  { key: 'level.regular', min: 100 },
  { key: 'level.local', min: 300 },
  { key: 'level.legend', min: 1000 },
];

export const STILL_HERE_COOLDOWN_MS = 30 * 60_000;
export const REPORT_DEDUPE_MS = 10 * 60_000;

/** The current level and the next one (null at the top level). */
export function levelFor(rep: number) {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (rep >= level.min) index = i;
  });
  return { level: LEVELS[index], next: LEVELS[index + 1] ?? null };
}
