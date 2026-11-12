import type { Drop } from './types';

// Drop state is a pure function of the shared clock, so every card stays in sync
// and no component needs its own timer (03-ux-eater-flows.md section 8).

/** A live drop loses one portion about every 45 s, and never drains below 2 by itself. */
const DRAIN_MS = 45_000;
const DRAIN_FLOOR = 2;

export type DropPhase = 'upcoming' | 'live' | 'gone';
export type DropState = { phase: DropPhase; msToStart: number; left: number };

export function dropState(drop: Drop, now: number, appStart: number, claimed: boolean): DropState {
  const msToStart = drop.startsAt - now;
  if (msToStart > 0) return { phase: 'upcoming', msToStart, left: drop.left };
  const drained = Math.floor((now - Math.max(drop.startsAt, appStart)) / DRAIN_MS);
  const floor = Math.min(DRAIN_FLOOR, drop.left);
  const left = Math.max(0, Math.max(floor, drop.left - drained) - (claimed ? 1 : 0));
  return { phase: left > 0 || claimed ? 'live' : 'gone', msToStart: 0, left };
}

/** A short code to show at the truck, for example LOKAL-GUER-417. Stable per drop. */
export function claimCode(drop: Drop): string {
  let hash = 7;
  for (const ch of drop.id) hash = (hash * 31 + ch.charCodeAt(0)) % 100_003;
  const digits = String(100 + (hash % 900));
  return `LOKAL-${drop.spotId.slice(0, 4).toUpperCase()}-${digits}`;
}
