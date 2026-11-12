import { useCallback } from 'react';

import { useToast } from '@/components/ui';
import type { Spot } from '@/data/types';
import { t } from '@/i18n';
import { REP } from '@/state/rep';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';

/**
 * The one check-in handler for the sheet preview and the spot page
 * (03-ux-eater-flows.md section 6): once per spot per session, rain plus burst plus toast.
 */
export function useCheckIn(spot: Spot | undefined) {
  const { state, actions } = useStore();
  const toast = useToast();
  const here = !!spot && !!state.hereAt[spot.id];

  const checkIn = useCallback(() => {
    if (!spot || here) return;
    if (!spot.open) {
      toast.show(t('toast.checkInClosed', { spot: spot.name }), { emoji: ui.pin });
      return;
    }
    actions.checkIn(spot.id, REP.checkIn);
    actions.celebrate({ kind: 'checkIn', spotId: spot.id, rep: REP.checkIn });
    toast.show(t('toast.checkedIn', { spot: spot.name, rep: REP.checkIn }), { emoji: ui.pin });
  }, [spot, here, actions, toast]);

  return { here, checkIn };
}
