import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Emoji, Text, useToast } from '@/components/ui';
import { getPeople, getTicks } from '@/data/repo';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { useScreenReader } from '@/hooks/use-screen-reader';
import { reportAt } from '@/data/format';
import type { Report, Spot } from '@/data/types';
import { matchesFilter, useAllReports, useSpots } from '@/hooks/use-spots';
import { t, type StringKey } from '@/i18n';
import { useNotes, useStore, type FilterKey } from '@/state/store';
import { avatar, avatarBg, filterIcon, ui, type AvatarKey } from '@/theme/emoji';
import { dur, ease, native, spring } from '@/theme/motion';
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

/** The top of the map: Ask pill, day/night toggle, bell, filter chips and the live ticker. */
export function MapTopBar({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const insets = useSafeAreaInsets();
  const { c, isNight } = useTheme();
  const toast = useToast();
  const { actions } = useStore();
  const unread = useNotes().filter((n) => n.unread).length;

  const toggleTheme = () => {
    actions.setThemeMode(isNight ? 'day' : 'night');
    toast.show(t(isNight ? 'map.themeDay' : 'map.themeNight'), { emoji: isNight ? ui.sun : ui.moon });
  };

  return (
    <View pointerEvents="box-none" onLayout={onLayout} style={[styles.top, { paddingTop: insets.top + 8 }]}>
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
          icon={isNight ? ui.sun : ui.moon}
          label={t(isNight ? 'map.toDay' : 'map.toNight')}
          onPress={toggleTheme}
        />
        <IconButton
          icon={ui.bell}
          label={t('map.bell', { n: unread })}
          hint={t('map.bellHint')}
          onPress={() => router.push('/inbox')}
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
            compact
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

/** Text glyphs (not emoji) that need the ink color to show on the night map. */
const GLYPHS = new Set<string>([ui.plus, ui.minus]);

/** A 44 pt glass icon button used over the map. */
export function IconButton({
  icon,
  label,
  onPress,
  badge,
  hint,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  hint?: string;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [
        styles.icon,
        { backgroundColor: c.glass, borderColor: c.line },
        elevation.e1,
        pressed && styles.pressed,
      ]}
    >
      {GLYPHS.has(icon) ? (
        <Text
          variant="heading"
          accessible={false}
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={{ color: c.ink, fontSize: 22, lineHeight: 24 }}
        >
          {icon}
        </Text>
      ) : (
        <Emoji size={19}>{icon}</Emoji>
      )}
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

/** One glass capsule: zoom in over zoom out. Each half is a full 44 pt button. */
export function ZoomPill({ onIn, onOut }: { onIn: () => void; onOut: () => void }) {
  const { c } = useTheme();
  const half = (glyph: string, label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.zoomHalf, pressed && styles.pressed]}
    >
      <Text
        variant="heading"
        accessible={false}
        importantForAccessibility="no"
        accessibilityElementsHidden
        style={{ color: c.ink, fontSize: 22, lineHeight: 24 }}
      >
        {glyph}
      </Text>
    </Pressable>
  );
  return (
    <View
      accessibilityLabel={t('map.zoomA11y')}
      style={[styles.zoom, { backgroundColor: c.glass, borderColor: c.line }, elevation.e1]}
    >
      {half(ui.plus, t('map.zoomIn'), onIn)}
      <View style={[styles.zoomRule, { backgroundColor: c.line }]} />
      {half(ui.minus, t('map.zoomOut'), onOut)}
    </View>
  );
}

type Face = { key: string; icon: string; bg: string };

/** Who made a report, as a small avatar. */
function faceFor(report: Report): Face {
  if (report.by === 'you') return { key: 'you', icon: avatar.me, bg: avatarBg.me };
  if (report.by === 'owner') return { key: `owner-${report.spotId}`, icon: ui.owner, bg: '#ffe7b0' };
  const person = getPeople()[report.by];
  const key: AvatarKey = person?.avatar ?? 'me';
  return { key: person?.handle ?? String(report.by), icon: avatar[key], bg: person?.tint ?? avatarBg.me };
}

/**
 * "34 reports near you tonight": a glass pill above the sheet peek with the three newest
 * reporters. The count is the real number of reports (sample plus this session). Tapping it
 * shows the spot with the newest report. It pulses once when a report is added.
 */
export function ActivityPill({ spots, onOpen }: { spots: Spot[]; onOpen: (spot: Spot) => void }) {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const reports = useAllReports();
  const count = reports.length;
  const appStart = getAppStart();
  const sorted = [...reports].sort((a, b) => reportAt(b, appStart) - reportAt(a, appStart));
  const newest = sorted.map((r) => spots.find((s) => s.id === r.spotId)).find((s): s is Spot => !!s);
  const faces: Face[] = [];
  for (const r of sorted) {
    const face = faceFor(r);
    if (!faces.some((f) => f.key === face.key)) faces.push(face);
    if (faces.length === 3) break;
  }

  const [pulse] = useState(() => new Animated.Value(1));
  const lastCount = useRef(count);
  useEffect(() => {
    const grew = count > lastCount.current;
    lastCount.current = count;
    if (!grew || reduceMotion) return;
    pulse.setValue(1.12);
    Animated.spring(pulse, { toValue: 1, ...spring.pop, useNativeDriver: native }).start();
  }, [count, pulse, reduceMotion]);

  if (!count || !newest) return null;
  const text = count === 1 ? t('map.activity1') : t('map.activity', { n: count });

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable
        onPress={() => onOpen(newest)}
        accessibilityRole="button"
        accessibilityLabel={t('map.activityA11y', { text, spot: newest.name })}
        accessibilityHint={t('map.activityHint')}
        style={({ pressed }) => [
          styles.activity,
          { backgroundColor: c.glass, borderColor: c.line },
          elevation.e1,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.faces}>
          {faces.map((f, i) => (
            <View
              key={f.key}
              style={[
                styles.face,
                { backgroundColor: f.bg, borderColor: c.paper, marginLeft: i ? -8 : 0, zIndex: 3 - i },
              ]}
            >
              <Emoji size={13}>{f.icon}</Emoji>
            </View>
          ))}
        </View>
        <View style={[styles.liveDot, { backgroundColor: c.mintFill }]} />
        <Text variant="label" numberOfLines={2} style={styles.shrink}>
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  zoom: { width: minTap, borderRadius: radius.pill, borderWidth: 1, overflow: 'hidden' },
  zoomHalf: { width: minTap, height: minTap, alignItems: 'center', justifyContent: 'center' },
  zoomRule: { height: 1, marginHorizontal: 10 },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: minTap,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  faces: { flexDirection: 'row' },
  face: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
