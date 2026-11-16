import { closingLeft, milesFromMe, reportAt } from './format';
import type { Report, Spot } from './types';

// "Top 10 near you tonight": a deterministic score per open spot, from what eaters are doing
// right now. Same inputs, same order: ties go to the nearer spot, then to the id.

/** Reports older than this no longer count as live. */
export const LIVE_WINDOW_MIN = 180;

export type RankInput = {
  reports: Report[];
  /** Your check-ins per spot id (store). */
  checkIns: Record<string, number>;
  /** Your vote per report id (store): +1 is a "still true" confirmation. */
  votes: Record<string, 1 | -1>;
  /** Last "Yep, still here" per spot id (store). */
  stillHere: Record<string, number>;
  now: number;
  appStart: number;
};

/**
 * The tonight score of one spot (higher is better). Closed spots score -Infinity.
 *
 *   live reports   4 × (1 − age / 180 min) for each report in the last 3 hours (newer counts more)
 * + confirms       1.5 × log2(1 + confirmations), where confirmations are the report votes,
 *                  your own "still true" votes and a "still here" in the last hour
 * + check-ins      2 × your check-ins there, at most 3 counted
 * + hot            6 when the spot is marked hot
 * + rating         10 × (rating − 4), so 4.8 adds 8 and 4.4 adds 4
 * + open now       5, minus 3 when it closes within 30 minutes (less time to get there)
 */
export function tonightScore(spot: Spot, input: RankInput): number {
  if (!spot.open) return -Infinity;
  const { reports, checkIns, votes, stillHere, now, appStart } = input;
  let live = 0;
  let confirms = 0;
  for (const r of reports) {
    if (r.spotId !== spot.id) continue;
    const age = (now - reportAt(r, appStart)) / 60_000;
    if (age >= 0 && age < LIVE_WINDOW_MIN) live += 4 * (1 - age / LIVE_WINDOW_MIN);
    confirms += Math.max(0, r.votes) + (votes[r.id] === 1 ? 1 : 0);
  }
  const here = stillHere[spot.id];
  if (here && now - here < 60 * 60_000) confirms += 1;
  const left = closingLeft(spot, now, appStart);
  return (
    live +
    1.5 * Math.log2(1 + confirms) +
    2 * Math.min(3, checkIns[spot.id] ?? 0) +
    (spot.hot ? 6 : 0) +
    10 * (spot.rating - 4) +
    5 -
    (left !== null && left <= 30 ? 3 : 0)
  );
}

/** Open spots ranked by tonightScore, best first, at most `limit`. */
export function rankTonight(spots: Spot[], input: RankInput, limit = 10): Spot[] {
  return spots
    .filter((s) => s.open)
    .map((spot) => ({ spot, score: tonightScore(spot, input), miles: milesFromMe(spot) }))
    .sort((a, b) => b.score - a.score || a.miles - b.miles || a.spot.id.localeCompare(b.spot.id))
    .slice(0, limit)
    .map((r) => r.spot);
}
