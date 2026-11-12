import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { getSpot } from '@/data/repo';
import { useStore } from '@/state/store';
import { report as reportEmoji, ui } from '@/theme/emoji';

import { EmojiRain } from './EmojiRain';
import { RepBurst } from './RepBurst';

// Plays the current celebration from the store over every screen (below the toast).
// Everything is keyed by the celebration id and unmounts when it is cleared: nothing is left behind.

export function FxHost() {
  const { state, actions } = useStore();
  const fx = state.fx;
  const id = fx?.id;
  const done = useCallback(() => {
    if (id !== undefined) actions.clearFx(id);
  }, [actions, id]);
  const noop = useCallback(() => {}, []);

  if (!fx) return null;
  const spot = getSpot(fx.spotId);
  const isCheckIn = fx.kind === 'checkIn';

  // Go live (C5): a small rain of the truck's food, no rep (owners do not earn eater rep).
  if (fx.kind === 'goLive') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {spot ? <EmojiRain key={`live-${fx.id}`} food={spot.food} seed={fx.id} count={12} onDone={done} /> : null}
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {isCheckIn && spot ? <EmojiRain key={`rain-${fx.id}`} food={spot.food} seed={fx.id} onDone={done} /> : null}
      <RepBurst
        key={`burst-${fx.id}`}
        emoji={isCheckIn ? ui.pin : reportEmoji[fx.report ?? 'amazing']}
        amount={fx.rep}
        // A report has no rain: the burst ends the celebration, after the pin float has risen.
        holdMs={isCheckIn ? 0 : 600}
        onDone={isCheckIn && spot ? noop : done}
      />
    </View>
  );
}
