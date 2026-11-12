import { useCallback, useSyncExternalStore } from 'react';

import { isHydrated } from './use-hydrated';

// One shared 1 s ticker for the whole app. Components subscribe; the single
// interval starts with the first subscriber and stops when the last one leaves.

type Listener = () => void;

const listeners = new Set<Listener>();
let timer: ReturnType<typeof setInterval> | null = null;

/**
 * The time every web render uses before hydration, so the server HTML and the first
 * client render agree (a fixed evening, so the auto theme matches its night default).
 */
export const FIXED_NOW = Date.UTC(2026, 0, 7, 21, 0, 0);

let appStart: number | null = null;

/**
 * When the app started, for sample timings such as "closes in N min". Set lazily on the
 * first client call (not at module scope, which also runs during the web pre-render).
 */
export function getAppStart(): number {
  if (typeof window === 'undefined' || !isHydrated()) return FIXED_NOW;
  if (appStart === null) appStart = Date.now();
  return appStart;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => listeners.forEach((l) => l()), 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * The current time, re-rendering at most once per `stepMs` (default every second).
 * Use 60_000 for things that only change by the minute. On web the pre-render and the
 * hydrating render use FIXED_NOW, so they match; the real time follows right after.
 */
export function useClock(stepMs = 1000): number {
  const snapshot = useCallback(() => Math.floor(Date.now() / stepMs) * stepMs, [stepMs]);
  return useSyncExternalStore(subscribe, snapshot, serverNow);
}

const serverNow = () => FIXED_NOW;
