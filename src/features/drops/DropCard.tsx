import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { Button, Card, Emoji, LiveText, Text } from '@/components/ui';
import type { DropState } from '@/data/drops';
import { countdownWords, formatCountdown, formatDistance } from '@/data/format';
import type { Drop, Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import { ui } from '@/theme/emoji';
import { ease } from '@/theme/motion';
import { hitSlop, minTap, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Props = {
  drop: Drop;
  spot: Spot;
  state: DropState;
  reminded: boolean;
  claimed: boolean;
  onRemind: (drop: Drop) => void;
  onClaim: (drop: Drop) => void;
  onShowOnMap: (spotId: string) => void;
};

/** One drop: upcoming (countdown + Remind me), live (draining bar + Claim) or gone. */
export function DropCard({ drop, spot, state, reminded, claimed, onRemind, onClaim, onShowOnMap }: Props) {
  const { c } = useTheme();
  const { phase, left } = state;
  const distance = formatDistance(spot);
  const base = { title: drop.title, spot: spot.name, distance, left, of: drop.of };
  const a11y =
    phase === 'upcoming'
      ? t('drops.cardA11yUpcoming', { ...base, when: countdownWords(state.msToStart) })
      : phase === 'live'
        ? t('drops.cardA11yLive', base)
        : t('drops.cardA11yGone', base);

  return (
    <Card variant={phase === 'live' ? 'hot' : 'default'} style={phase === 'gone' && styles.gone}>
      {/* The summary is one screen-reader stop, worded by the minute so it never reads every tick. */}
      <View accessible accessibilityLabel={a11y} style={styles.top}>
        <FoodArt food={spot.food} width={64} height={64} radius={16} />
        <View style={styles.topText}>
          <Text variant="heading">{drop.title}</Text>
          <LiveText variant="caption" tone="ink2" placeholderWidth="70%">
            {t('drops.where', { spot: spot.name, distance })}
          </LiveText>
        </View>
      </View>
      <Text tone="ink2" importantForAccessibility="no" accessibilityElementsHidden>
        {drop.body}
      </Text>

      <View style={styles.timerRow} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {phase === 'upcoming' ? (
          <View style={styles.inline}>
            <Text variant="ui" tone="ink2">
              {t('drops.startsIn')}
            </Text>
            <LiveText tabular style={styles.timer} placeholderWidth={64}>
              {formatCountdown(state.msToStart)}
            </LiveText>
          </View>
        ) : phase === 'live' ? (
          <LivePill />
        ) : (
          <Text variant="ui" tone="ink2">
            {t('drops.gone')}
          </Text>
        )}
        {phase !== 'gone' ? (
          <Text variant="label" tone="ink2" tabular>
            {t('drops.left', { left, of: drop.of })}
          </Text>
        ) : null}
      </View>

      <PortionsBar left={left} of={drop.of} />

      <View style={styles.actions}>
        <View style={styles.main}>
          {phase === 'upcoming' ? (
            <Button
              variant={reminded ? 'ghost' : 'soft'}
              icon={reminded ? ui.check : ui.bellOn}
              label={t(reminded ? 'drops.reminderOn' : 'drops.remind')}
              accessibilityLabel={t('drops.remind')}
              role="switch"
              checked={reminded}
              onPress={() => onRemind(drop)}
            />
          ) : phase === 'live' ? (
            <Button
              icon={claimed ? ui.copy : ui.gift}
              label={t(claimed ? 'drops.showCode' : 'drops.claim')}
              accessibilityHint={claimed ? undefined : t('drops.claimHint')}
              onPress={() => onClaim(drop)}
            />
          ) : (
            <Button variant="soft" label={t('drops.goneBtn')} disabled />
          )}
        </View>
        <Pressable
          onPress={() => onShowOnMap(spot.id)}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={t('common.showOnMapA11y', { name: spot.name })}
          style={({ pressed }) => [
            styles.mapBtn,
            { backgroundColor: c.card2, borderColor: c.line },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Emoji size={20}>{ui.pin}</Emoji>
        </Pressable>
      </View>
    </Card>
  );
}

/** "LIVE NOW" with a blinking dot (static under reduce motion). */
function LivePill() {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const [blink] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduceMotion) {
      blink.setValue(1);
      return;
    }
    // Opacity on the JS driver: cheap, and the same on web and native.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 500, useNativeDriver: false }),
        Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink, reduceMotion]);
  return (
    <View style={[styles.livePill, { backgroundColor: c.chili }]}>
      <Animated.View style={[styles.liveDot, { opacity: blink }]} />
      <Text variant="micro" tone="onHot">
        {t('drops.liveNow').toUpperCase()}
      </Text>
    </View>
  );
}

/** Portions left. Tweens to each new value (600 ms), or jumps under reduce motion. */
function PortionsBar({ left, of }: { left: number; of: number }) {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const ratio = of > 0 ? left / of : 0;
  const [width] = useState(() => new Animated.Value(ratio));
  useEffect(() => {
    if (reduceMotion) {
      width.setValue(ratio);
      return;
    }
    const anim = Animated.timing(width, { toValue: ratio, duration: 600, easing: ease.soft, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [ratio, reduceMotion, width]);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('drops.barA11y', { left, of })}
      accessibilityValue={{ min: 0, max: of, now: left }}
      style={[styles.track, { backgroundColor: c.card2 }]}
    >
      <Animated.View
        style={[styles.fill, { width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
      >
        <LinearGradient colors={[c.grill, c.sun]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  gone: { opacity: 0.7 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  topText: { flex: 1, gap: 2 },
  timerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: space.md,
    rowGap: space.xs,
  },
  inline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: space.sm },
  timer: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 20, lineHeight: 26 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ffffff' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, overflow: 'hidden' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  main: { flex: 1 },
  mapBtn: {
    width: minTap + 6,
    height: minTap + 6,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
