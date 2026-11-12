import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { markClientReady } from '@/i18n';

// Web pages are pre-rendered (static output). The first client render must match that
// HTML exactly, so anything that depends on the clock, the time zone or the locale waits
// until after hydration. Native has no pre-rendered HTML and is "hydrated" from the start.

let hydratedOnce = Platform.OS !== 'web';

/** True once the app has hydrated on web (always true on native). */
export const isHydrated = () => hydratedOnce;

// React subscribes after the hydrating render commits, so this marks the client as ready
// before the follow-up render that reads the client snapshot.
const subscribe = () => {
  if (!hydratedOnce) {
    hydratedOnce = true;
    markClientReady();
  }
  return () => {};
};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** False during the server render and the hydrating client render on web, then true. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
