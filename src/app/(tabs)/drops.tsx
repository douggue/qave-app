import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { Placeholder, Screen, ScreenTitle, useToast } from '@/components/ui';
import { claimCode, dropState } from '@/data/drops';
import { getDrops } from '@/data/repo';
import type { Drop } from '@/data/types';
import { ClaimModal } from '@/features/drops/ClaimModal';
import { DropCard } from '@/features/drops/DropCard';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useShowOnMap } from '@/hooks/use-show-on-map';
import { useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP } from '@/state/rep';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { tabGlyph } from '@/theme/glyphs';

// Drops: limited specials. Countdowns and the slow drain all run on the shared clock.
export default function DropsScreen() {
  const now = useClock(1000);
  const toast = useToast();
  const { state, actions } = useStore();
  const spots = useSpots();
  const showOnMap = useShowOnMap();
  const [codeFor, setCodeFor] = useState<string | null>(null);
  const drops = getDrops();

  const remind = (drop: Drop) => {
    const on = !state.reminders[drop.id];
    actions.toggleReminder(drop.id);
    toast.show(t(on ? 'toast.remindOn' : 'toast.remindOff'), { emoji: on ? ui.bellOn : undefined });
  };

  const claim = (drop: Drop) => {
    if (!state.claims[drop.id]) {
      const spot = spots.find((s) => s.id === drop.spotId);
      actions.claimDrop(drop.id, claimCode(drop), REP.claimDrop);
      if (spot) AccessibilityInfo.announceForAccessibility(t('toast.claimed', { spot: spot.name }));
    }
    setCodeFor(drop.id);
  };

  const open = codeFor ? drops.find((d) => d.id === codeFor) : undefined;
  const openSpot = open ? spots.find((s) => s.id === open.spotId) : undefined;
  const openCode = open ? state.claims[open.id]?.code : undefined;

  return (
    <Screen scroll>
      <ScreenTitle eyebrow={t('drops.pill')} title={t('drops.title')} sub={t('drops.subtitle')} />

      {drops.length === 0 ? (
        <Placeholder emoji={tabGlyph.drops} title={t('drops.empty')} body={t('drops.emptyBody')} />
      ) : (
        drops.map((drop) => {
          const spot = spots.find((s) => s.id === drop.spotId);
          if (!spot) return null;
          const claimed = !!state.claims[drop.id];
          return (
            <DropCard
              key={drop.id}
              drop={drop}
              spot={spot}
              state={dropState(drop, now, getAppStart(), claimed)}
              reminded={!!state.reminders[drop.id]}
              claimed={claimed}
              onRemind={remind}
              onClaim={claim}
              onShowOnMap={showOnMap}
            />
          );
        })
      )}

      {open && openSpot && openCode ? (
        <ClaimModal code={openCode} spot={openSpot} onClose={() => setCodeFor(null)} />
      ) : null}
    </Screen>
  );
}
