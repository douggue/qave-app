import type { AvatarKey } from '@/theme/emoji';

import { getPeople } from './repo';
import type { Report, Spot } from './types';

// Who is at a spot tonight: sample check-ins plus yours, and every "still true" confirmation.

export type CrowdInput = {
  reports: Report[];
  /** Your vote per report id (store). */
  votes: Record<string, 1 | -1>;
  /** Your last "Yep, still here" per spot id (store). */
  stillHere: Record<string, number>;
  /** When you checked in per spot id this session (store). */
  hereAt: Record<string, number>;
};

/** People who confirmed the spot's reports tonight (sample votes plus yours) and your "still here". */
export function confirmedTonight(spotId: string, input: CrowdInput): number {
  let n = input.stillHere[spotId] ? 1 : 0;
  for (const r of input.reports) if (r.spotId === spotId) n += Math.max(0, r.votes) + (input.votes[r.id] === 1 ? 1 : 0);
  return n;
}

/** People checked in here tonight: the sample count plus you. */
export const hereTonight = (spot: Spot, input: CrowdInput) => (spot.hereTonight ?? 0) + (input.hereAt[spot.id] ? 1 : 0);

/** Recent check-ins plus confirmations: 15 or more draws the crowd halo on the map. */
export const crowdActivity = (spot: Spot, input: CrowdInput) =>
  hereTonight(spot, input) + confirmedTonight(spot.id, input);

const FALLBACK: AvatarKey[] = ['fox', 'panda', 'frog', 'unicorn', 'cowboy'];

/** Three avatar stickers for the crowd: who reported here, then friends, then sample faces. */
export function crowdFaces(spot: Spot, reports: Report[]): AvatarKey[] {
  const people = getPeople();
  const out: AvatarKey[] = [];
  const add = (k: AvatarKey | undefined) => {
    if (k && k !== 'me' && !out.includes(k)) out.push(k);
  };
  for (const r of reports) if (r.spotId === spot.id && typeof r.by === 'number') add(people[r.by]?.avatar);
  spot.friends?.forEach((f) => add(f.avatar));
  FALLBACK.forEach(add);
  return out.slice(0, 3);
}
