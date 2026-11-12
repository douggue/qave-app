import { milesFromMe } from '@/data/format';
import type { Mood, Report, ReportType, Spot } from '@/data/types';
import { t, type StringKey } from '@/i18n';
import { REPORT_DEDUPE_MS } from '@/state/rep';

// The six radial options, left to right on the arc (03-ux-eater-flows.md section 7).
export type ReportOption = {
  type: ReportType;
  label: StringKey;
  /** What this report says on the spot page; absent for "coming next" options. */
  line?: StringKey;
  mood?: Mood;
};

export const REPORT_OPTIONS: ReportOption[] = [
  { type: 'amazing', label: 'report.opt.amazing', line: 'report.line.amazing', mood: { emoji: 'hot', key: 'mood.amazing' } },
  { type: 'line', label: 'report.opt.line', line: 'report.line.line', mood: { emoji: 'line', key: 'mood.line' } },
  { type: 'deal', label: 'report.opt.deal', line: 'report.line.deal', mood: { emoji: 'deal', key: 'mood.deal' } },
  {
    type: 'soldOut',
    label: 'report.opt.soldOut',
    line: 'report.line.soldOut',
    mood: { emoji: 'soldOut', key: 'mood.soldOutReport' },
  },
  { type: 'photo', label: 'report.opt.photo' },
  { type: 'newSpot', label: 'report.opt.newSpot' },
];

/** The report target: the selected spot, else the one nearest to you. */
export function reportTarget(spots: Spot[], selectedId: string | null): Spot | undefined {
  const selected = selectedId ? spots.find((s) => s.id === selectedId) : undefined;
  if (selected) return selected;
  return [...spots].sort((a, b) => milesFromMe(a) - milesFromMe(b))[0];
}

/** True when you already made this report at this spot in the last 10 minutes. */
export function isDuplicate(reports: Report[], spotId: string, type: ReportType): boolean {
  const now = Date.now();
  return reports.some(
    (r) => r.by === 'you' && r.spotId === spotId && r.type === type && now - (r.createdAt ?? 0) < REPORT_DEDUPE_MS,
  );
}

/** A new report by you, stamped now. */
export function newReport(spotId: string, option: ReportOption): Report {
  const now = Date.now();
  return {
    id: `you-${now}`,
    spotId,
    type: option.type,
    text: t(option.line ?? option.label),
    by: 'you',
    createdAt: now,
    votes: 0,
  };
}
