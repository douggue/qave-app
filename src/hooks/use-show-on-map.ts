import { router } from 'expo-router';
import { useCallback } from 'react';

import { useStore } from '@/state/store';

/**
 * Focus a spot on the Map tab from anywhere (Ask, Drops, inbox). The map watches
 * selectedSpot, centers the pin and opens the preview at half.
 */
export function useShowOnMap() {
  const { actions } = useStore();
  return useCallback(
    (spotId: string) => {
      actions.focusSpot(spotId);
      router.navigate('/');
    },
    [actions],
  );
}
