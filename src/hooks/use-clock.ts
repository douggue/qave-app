import { useEffect, useState } from 'react';

// One shared 1 s ticker for the whole app. Components subscribe; the single
// interval starts with the first subscriber and stops when the last one leaves.

type Listener = (now: number) => void;

const listeners = new Set<Listener>();
let timer: ReturnType<typeof setInterval> | null = null;

/** When the app started, for sample timings such as "closes in N min". */
export const APP_START = Date.now();

function subscribe(listener: Listener) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      const now = Date.now();
      listeners.forEach((l) => l(now));
    }, 1000);
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
 * Use 60_000 for things that only change by the minute.
 */
export function useClock(stepMs = 1000): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / stepMs) * stepMs);
  useEffect(
    () =>
      subscribe((t) => {
        const stepped = Math.floor(t / stepMs) * stepMs;
        setNow((prev) => (prev === stepped ? prev : stepped));
      }),
    [stepMs],
  );
  return now;
}
