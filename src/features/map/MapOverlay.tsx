import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Emoji, Text, useToast } from '@/components/ui';
import { getNotes, getPeople, getTicks } from '@/data/repo';
import { useClock } from '@/hooks/use-clock';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { useScreenReader } from '@/hooks/use-screen-reader';
import { matchesFilter, useSpots } from '@/hooks/use-spots';
import { t, type StringKey } from '@/i18n';
import { useStore, type FilterKey } from '@/state/store';
import { avatar, avatarBg, filterIcon, ui } from '@/theme/emoji';
import { dur, ease, native } from '@/theme/motion';
import { elevation, minTap, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const FILTERS: { key: FilterKey; label: StringKey }[] = [
  { key: 'all', label: 'filter.all' },
  { key: 'open', label: 'filter.open' },
  { key: 'mobile', label: 'filter.mobile' },
  { key: 'tacos', label: 'filter.tacos' },
  { key: 'bbq', label: 'filter.bbq' },
  { key: 'sweets', label: 'filter.sweets' },
  { key: 'asian', label: 'filter.asian' },
  { key: 'popup', label: 'filter.popup' },
  { key: 'cheap', label: 'filter.cheap' },
];

/** The top of the map: Ask pill, bell, filter chips and the live ticker. */
export function MapTopBar() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const toast = useToast();
  const unread = getNotes().filter((n) => n.unread).length;

  return (
    <View pointerEvents="box-none" style={[styles.top, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row} pointerEvents="box-none">
        <Pressable
          onPress={() => router.navigate('/ask')}
          accessibilityRole="button"
          accessibilityLabel={t('map.askA11y')}
          accessibilityHint={t('map.askHint')}
          style={({ pressed }) => [styles.ask, { backgroundColor: c.glass, borderColor: c.line }, pressed && styles.pressed]}
        >
          <Emoji size={18}>{ui.sparkles}</Emoji>
          <Text variant="ui" tone="ink2" numberOfLines={1} style={styles.shrink}>
            {t('map.askPill')}
          </Text>
        </Pressable>
        <IconButton
          icon={ui.bell}
          label={t('map.bell', { n: unread })}
          onPress={() => toast.show(t('common.comingNext'), { emoji: ui.bell })}
          badge={unread}
        />
      </View>
      <FilterChips />
      <Ticker />
    </View>
  );
}

function FilterChips() {
  const { state, actions } = useStore();
  const spots = useSpots();
  const pick = (key: FilterKey, label: string) => {
    actions.setFilter(key);
    const n = spots.filter((s) => matchesFilter(s, key)).length;
    AccessibilityInfo.announceForAccessibility(t('filter.announce', { n, filter: label }));
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chips}
      contentContainerStyle={styles.chipsContent}
      accessibilityLabel={t('map.filters')}
    >
      {FILTERS.map((f) => {
        const label = t(f.label);
        return (
          <Chip
            key={f.key}
            tone="glass"
            label={label}
            icon={filterIcon[f.key]}
            selected={state.filter === f.key}
            onPress={() => pick(f.key, label)}
          />
        );
      })}
    </ScrollView>
  );
}

/** One line of what other eaters just did. Rotates every 4 s on the shared clock. */
function Ticker() {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const screenReader = useScreenReader();
  // Nearly hold still while a screen reader is on, so it does not interrupt.
  const step = screenReader ? 3_600_000 : 4000;
  const now = useClock(step);
  const ticks = getTicks();
  const people = getPeople();
  const index = Math.floor(now / step) % ticks.length;
  const tick = ticks[index];
  const person = people[tick.by];

  const [fade] = useState(() => new Animated.Value(1));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) return;
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: native }).start();
  }, [index, fade, reduceMotion]);

  return (
    <Animated.View
      accessibilityLiveRegion="none"
      style={[
        styles.ticker,
        { backgroundColor: c.glass, borderColor: c.line },
        { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarBg[person.avatar] }]}>
        <Emoji size={14}>{avatar[person.avatar]}</Emoji>
      </View>
      <Text variant="caption" numberOfLines={2} style={styles.shrink}>
        {t('map.ticker', { handle: person.handle, text: tick.text })}
      </Text>
    </Animated.View>
  );
}

/** A 44 pt glass icon button used over the map. */
export function IconButton({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.icon,
        { backgroundColor: c.glass, borderColor: c.line },
        elevation.e1,
        pressed && styles.pressed,
      ]}
    >
      <Emoji size={19}>{icon}</Emoji>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: c.hotFill }]}>
          <Text variant="micro" style={styles.badgeText}>
            {String(badge)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ask: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    ...elevation.e2,
  },
  shrink: { flexShrink: 1 },
  pressed: { opacity: 0.85 },
  chips: { marginHorizontal: -12, flexGrow: 0 },
  chipsContent: { paddingHorizontal: 12, gap: 8 },
  ticker: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
  },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: {
    width: minTap,
    height: minTap,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', letterSpacing: 0 },
});
