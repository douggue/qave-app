import { useEffect } from 'react';
import * as Updates from 'expo-updates';

// On launch, fetch the newest published update and restart into it,
// so a change shows up after a single close-and-reopen of the app.
export function useLiveUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable) return;
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch {
        // Offline or the update server is unreachable: keep running the current version.
      }
    })();
  }, []);
}
