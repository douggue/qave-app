import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow, Icon, Sticker, Text, type IconName } from '@/components/ui';
import { rankTonight } from '@/data/rank';
import { getArea } from '@/data/repo';
import type { Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useHydrated } from '@/hooks/use-hydrated';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { useScreenReader } from '@/hooks/use-screen-reader';
import { useAllReports } from '@/hooks/use-spots';
import { t, type StringKey } from '@/i18n';
import { useNotes, useStore } from '@/state/store';
import type { FoodKey } from '@/theme/emoji';
import { dur, ease, native } from '@/theme/motion';
import { minTap } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Playful lines the Ask pill cycles through, every ASK_STEP ms. */
const ASK_LINES: StringKey[] = [
  'map.askLine1',
  'map.askLine2',
  'map.askLine3',
  'map.askLine4',
  'map.askLine5',
  'map.askLine6',
  'map.askLine7',
  'map.askLine8',
];
const ASK_STEP = 3500;

/** The time-of-day word for the eyebrow, from the clock. */
export function dayPartKey(hour: number): StringKey {
  if (hour >= 5 && hour < 11) return 'daypart.morning';
  if (hour >= 11 && hour < 14) return 'daypart.lunch';
  if (hour >= 14 && hour < 17) return 'daypart.afternoon';
  if (hour >= 17 && hour < 22) return 'daypart.tonight';
  return 'daypart.late';
}

/** One headline per food: what the top-ranked open spot serves ("Tacos are out."). */
const HEADLINE: Record<FoodKey, StringKey> = {
  taco: 'headline.taco',
  bbq: 'headline.bbq',
  croissant: 'headline.croissant',
  pho: 'headline.pho',
  burger: 'headline.burger',
  kolache: 'headline.kolache',
  jerk: 'headline.jerk',
  paleta: 'headline.paleta',
  supper: 'headline.supper',
  curry: 'headline.curry',
  dumpling: 'headline.dumpling',
  coffee: 'headline.coffee',
  rings: 'headline.rings',
  fries: 'headline.fries',
  shake: 'headline.shake',
};

/** The map's headline: built from the best open spot right now, or a quiet line when none is open. */
function useHeadline(spots: Spot[]): string {
  const { checkIns, votes, stillHere } = useStore().state;
  const reports = useAllReports();
  const now = useClock(60_000);
  return useMemo(() => {
    const [top] = rankTonight(spots, { reports, checkIns, votes, stillHere, now, appStart: getAppStart() }, 1);
    return t(top ? HEADLINE[top.food] : 'headline.none');
  }, [spots, reports, checkIns, votes, stillHere, now]);
}

/**
 * The top of the map (Mix): an eyebrow ("EAST AUSTIN · TONIGHT"), a big headline that says
 * what is live, then one row: the talking Ask pill and the bell. Nothing else over the map.
 */
export function MapHeader({ spots, onLayout }: { spots: Spot[]; onLayout?: (e: LayoutChangeEvent) => void }) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const unread = useNotes().filter((n) => n.unread).length;
  const now = useClock(60_000);
  const hydrated = useHydrated();
  const headline = useHeadline(spots);
  const part = t(dayPartKey(new Date(now).getHours()));

  return (
    <View pointerEvents="box-none" onLayout={onLayout} style={[styles.top, { paddingTop: insets.top + 10 }]}>
      <View accessible accessibilityRole="header" accessibilityLabel={`${getArea()}, ${part}. ${headline}`}>
        <Eyebrow style={[styles.eyebrow, !hydrated && styles.hidden]}>{`${getArea()} · ${part}`}</Eyebrow>
        <Text variant="hero" style={!hydrated && styles.hidden}>
          {headline}
        </Text>
      </View>
      <View style={styles.row} pointerEvents="box-none">
        <Pressable
          onPress={() => router.navigate('/ask')}
          accessibilityRole="button"
          accessibilityLabel={t('map.askA11y')}
          accessibilityHint={t('map.askHint')}
          style={styles.askPress}
        >
          {({ pressed }) => (
            <Sticker radius={16} bg={c.glass} drop={4} pressed={pressed} faceStyle={styles.ask}>
              <Icon name="search" size={20} color={c.ink2} strokeWidth={2.3} />
              <AskLine />
            </Sticker>
          )}
        </Pressable>
        <MapButton
          icon="bell"
          label={t('map.bell', { n: unread })}
          hint={t('map.bellHint')}
          onPress={() => router.push('/inbox')}
          dot={unread > 0}
          size={48}
        />
      </View>
    </View>
  );
}

/**
 * The Ask pill's placeholder: a playful food line that changes every 3.5 s on the shared clock
 * with a soft fade. No fade under reduce motion; it holds still while a screen reader is on.
 * Decorative: the pill's label stays "Ask Lokal".
 */
function AskLine() {
  const reduceMotion = useReduceMotion();
  const screenReader = useScreenReader();
  const step = screenReader ? 3_600_000 : ASK_STEP;
  const now = useClock(step);
  const index = Math.floor(now / step) % ASK_LINES.length;

  const [fade] = useState(() => new Animated.Value(1));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) return;
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: native }).start();
  }, [index, fade, reduceMotion]);

  return (
    <Animated.View
      style={[styles.askLine, { opacity: fade }]}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text variant="label" tone="ink2" numberOfLines={2} style={styles.askText}>
        {t(ASK_LINES[index])}
      </Text>
    </Animated.View>
  );
}

/** A square sticker button over the map (bell, recenter): 44 pt or larger. */
export function MapButton({
  icon,
  label,
  onPress,
  hint,
  dot,
  size = minTap,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  hint?: string;
  dot?: boolean;
  size?: number;
}) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint}>
      {({ pressed }) => (
        <Sticker
          radius={size >= 48 ? 16 : 14}
          bg={c.glass}
          drop={4}
          pressed={pressed}
          style={{ width: size }}
          faceStyle={[styles.iconFace, { height: size }]}
        >
          <Icon name={icon} size={21} color={c.ink} strokeWidth={2.2} />
          {dot ? <View style={[styles.dot, { backgroundColor: c.accent, borderColor: c.glass }]} /> : null}
        </Sticker>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, gap: 14 },
  eyebrow: { marginBottom: 6 },
  hidden: { opacity: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  askPress: { flex: 1 },
  ask: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  askLine: { flex: 1, minWidth: 0 },
  askText: { fontSize: 14.5, lineHeight: 19 },
  iconFace: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
});
