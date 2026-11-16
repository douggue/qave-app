import { LinearGradient } from 'expo-linear-gradient';
import { useId, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';

import { MapWorld } from '@/components/map/MapWorld';
import { Card, Chip, Eyebrow, Glyph, Screen, Sticker, Text, useToast } from '@/components/ui';
import { getArea, getBusiness, ME, WORLD } from '@/data/repo';
import type { Spot } from '@/data/types';
import { useClock } from '@/hooks/use-clock';
import { useSpots } from '@/hooks/use-spots';
import { getLocale, t, type StringKey } from '@/i18n';
import { levelFor } from '@/state/rep';
import { nightStreak, useStore, type ThemeMode } from '@/state/store';
import { avatar, food as foodEmoji, ui, type FoodKey } from '@/theme/emoji';
import { minTap, space, withAlpha } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const MODES: { mode: ThemeMode; label: StringKey }[] = [
  { mode: 'auto', label: 'theme.auto' },
  { mode: 'night', label: 'theme.night' },
  { mode: 'day', label: 'theme.day' },
];

const FOOD_NAME: Record<FoodKey, StringKey> = {
  taco: 'food.taco',
  bbq: 'food.bbq',
  croissant: 'food.croissant',
  pho: 'food.pho',
  burger: 'food.burger',
  kolache: 'food.kolache',
  jerk: 'food.jerk',
  paleta: 'food.paleta',
  supper: 'food.supper',
  curry: 'food.curry',
  dumpling: 'food.dumpling',
  coffee: 'food.coffee',
  rings: 'food.rings',
  fries: 'food.fries',
  shake: 'food.shake',
};

// You tab (Mix): who you are, your food passport, two collectible stats, the map look and Business.
export default function YouScreen() {
  const { c } = useTheme();
  const toast = useToast();
  const { state, actions } = useStore();
  const spots = useSpots();
  const now = useClock(60_000);
  const { level, next } = levelFor(state.rep);
  const levelName = t(level.key);
  const progress = next ? (state.rep - level.min) / (next.min - level.min) : 1;
  const fillPct = Math.max(4, Math.round(progress * 100));

  const visited = useMemo(() => spots.filter((s) => (state.checkIns[s.id] ?? 0) > 0), [spots, state.checkIns]);
  const topFood = useMemo(() => {
    const byFood = new Map<FoodKey, number>();
    for (const s of visited) byFood.set(s.food, (byFood.get(s.food) ?? 0) + (state.checkIns[s.id] ?? 0));
    return [...byFood.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [visited, state.checkIns]);
  const streak = nightStreak(state.nights, now);
  const title = state.nights.length ? t('you.nightOwl') : levelName;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Glyph of={avatar.me} size={55} />
        <View style={styles.headerText}>
          <Text variant="title" accessibilityRole="header">
            {t('you.handle')}
          </Text>
          <Text variant="label" tone="ink2">
            {t('you.subtitle', { area: getArea(), title })}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Eyebrow tone="ink2">{t('you.passport')}</Eyebrow>
        <Passport spots={spots} visited={visited} />
      </View>

      <View style={styles.stats}>
        <StatCard
          tone="taste"
          value={topFood ? t(FOOD_NAME[topFood]) : null}
          label={t('you.topTaste')}
          empty={t('you.topTasteEmpty')}
          art={foodEmoji[topFood ?? 'taco']}
          dimArt={!topFood}
          tilt={-1.2}
        />
        <StatCard
          tone="streak"
          value={streak ? String(streak) : null}
          label={t('you.nightStreak')}
          empty={t('you.nightStreakEmpty')}
          art={avatar.owl}
          dimArt={!streak}
          tilt={1}
        />
      </View>

      <Card>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`${t('you.levelA11y', { level: levelName, rep: state.rep })}. ${
            next ? t('you.progressA11y', { n: next.min - state.rep, level: t(next.key) }) : t('you.maxLevel')
          }`}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          style={styles.progressWrap}
        >
          <View style={styles.repRow}>
            <Text variant="cardTitle">{t('you.rep', { level: levelName, rep: state.rep })}</Text>
            <Text variant="label" tone="ink2" style={styles.shrink}>
              {next ? t('you.toNext', { n: next.min - state.rep, level: t(next.key) }) : t('you.maxLevel')}
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: c.card2 }]}>
            <View style={[styles.fill, { width: `${fillPct}%`, backgroundColor: c.neon }]} />
          </View>
        </View>
        <Text variant="caption" tone="ink2">
          {t('you.repHow')}
        </Text>
      </Card>

      <Card>
        <Text variant="cardTitle" accessibilityRole="header">
          {t('you.theme')}
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel={t('theme.groupA11y')} style={styles.chips}>
          {MODES.map(({ mode, label }) => (
            <Chip
              key={mode}
              role="radio"
              label={t(label)}
              selected={state.themeMode === mode}
              onPress={() => actions.setThemeMode(mode)}
              accessibilityLabel={t('theme.a11y', { mode: t(label) })}
            />
          ))}
        </View>
        <Text variant="caption" tone="ink2">
          {t('theme.autoNote')}
        </Text>
      </Card>

      <Pressable
        onPress={() => {
          // The tab bar sees bizMode and lands on Today.
          actions.setBizMode(true);
          toast.show(t('biz.switchedIn'), { emoji: ui.store });
        }}
        accessibilityRole="button"
        accessibilityLabel={t('you.toBizA11y', { name: getBusiness().name })}
        accessibilityHint={t('you.toBizHint')}
      >
        {({ pressed }) => (
          <Sticker radius={22} pressed={pressed} faceStyle={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: c.card2 }]}>
              <Glyph of={ui.store} size={20} tone="grape" />
            </View>
            <View style={styles.rowText}>
              <Text variant="ui">{t('you.toBiz')}</Text>
              <Text variant="caption" tone="ink2">
                {getBusiness().name}
              </Text>
            </View>
            <Glyph of={ui.chevron} size={16} color={c.ink2} strokeWidth={2.4} />
          </Sticker>
        )}
      </Pressable>
    </Screen>
  );
}

/** World units to card points: the card shows this much of the world around you. */
const PASS_SCALE = 0.42;
const PASS_H = 190;

/**
 * The food passport: a mini map of the neighborhoods with fog over everywhere you have not
 * checked in, the count of distinct spots you tried, neighborhoods unlocked, and an area pill.
 */
function Passport({ spots, visited }: { spots: Spot[]; visited: Spot[] }) {
  const { c, map, isNight } = useTheme();
  const [w, setW] = useState(0);
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, '');
  const hoods = new Set(spots.map((s) => s.hood));
  const unlocked = new Set(visited.map((s) => s.hood));
  const pct = spots.length ? Math.round((visited.length / spots.length) * 100) : 0;
  const n = visited.length;
  const tried = n === 1 ? t('you.tried1') : t('you.tried');
  const hoodsText = t('you.hoods', { h: unlocked.size, total: hoods.size });
  const area = getArea();
  const pill = t('you.areaPct', { area, pct }).toLocaleUpperCase(getLocale());

  // Center the mini map on you: RN scales around the world view's center.
  const s = PASS_SCALE;
  const tx = w / 2 - WORLD.width / 2 - s * (ME.x - WORLD.width / 2);
  const ty = PASS_H / 2 - WORLD.height / 2 - s * (ME.y - WORLD.height / 2);
  const toCard = (p: { x: number; y: number }) => ({ x: w / 2 + s * (p.x - ME.x), y: PASS_H / 2 + s * (p.y - ME.y) });
  const fog = isNight ? c.paper : '#efe7d8';

  return (
    <Sticker radius={26} clip style={styles.passport}>
      <View
        style={styles.passportFace}
        onLayout={(e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width))}
        accessible
        accessibilityLabel={
          n ? t('you.passportA11y', { n, tried, hoods: hoodsText, pct, area }) : t('you.passportEmpty')
        }
      >
        {w ? (
          <>
            <View
              pointerEvents="none"
              style={[styles.world, { transform: [{ translateX: tx }, { translateY: ty }, { scale: s }] }]}
            >
              <MapWorld palette={map} night={isNight} />
            </View>
            <Svg width={w} height={PASS_H} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Defs>
                <RadialGradient id={`r${id}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor="#000" stopOpacity={1} />
                  <Stop offset="0.55" stopColor="#000" stopOpacity={1} />
                  <Stop offset="1" stopColor="#000" stopOpacity={0} />
                </RadialGradient>
                <Mask id={`m${id}`} x="0" y="0" width={w} height={PASS_H} maskUnits="userSpaceOnUse">
                  <Rect x="0" y="0" width={w} height={PASS_H} fill="#fff" />
                  {visited.map((spot) => {
                    const p = toCard(spot);
                    return <Circle key={spot.id} cx={p.x} cy={p.y} r={58} fill={`url(#r${id})`} />;
                  })}
                  <Circle cx={w / 2} cy={PASS_H / 2} r={26} fill={`url(#r${id})`} />
                </Mask>
              </Defs>
              <Rect
                x="0"
                y="0"
                width={w}
                height={PASS_H}
                fill={fog}
                fillOpacity={isNight ? 0.78 : 0.86}
                mask={`url(#m${id})`}
              />
            </Svg>
            <LinearGradient
              pointerEvents="none"
              colors={[withAlpha(fog, 0), withAlpha(fog, 0.92)]}
              locations={[0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </>
        ) : null}
        <View style={[styles.areaPill, { backgroundColor: c.neon }]}>
          <Text variant="micro" style={[styles.areaText, { color: c.onNeon }]}>
            {pill}
          </Text>
        </View>
        <View style={styles.passText}>
          {n ? (
            <>
              <Text style={styles.passCount} tabular>
                {String(n)}
              </Text>
              <Text variant="label" style={styles.passLine}>
                {`${tried} · ${hoodsText}`}
              </Text>
            </>
          ) : (
            <Text variant="ui" style={styles.passEmpty}>
              {t('you.passportEmpty')}
            </Text>
          )}
        </View>
      </View>
    </Sticker>
  );
}

const STAT_COLORS = {
  night: {
    taste: { bg: ['#3a1d26', '#22161f'], ink: '#ffd9c8' },
    streak: { bg: ['#241d40', '#17131f'], ink: '#d9d0ff' },
  },
  day: {
    taste: { bg: ['#ffd9c2', '#ffd9c2'], ink: '#17131a' },
    streak: { bg: ['#d9d0ff', '#d9d0ff'], ink: '#17131a' },
  },
} as const;

/** A collectible stat card: a big value, its label, and a sticker peeking from the corner. */
function StatCard({
  tone,
  value,
  label,
  empty,
  art,
  dimArt,
  tilt,
}: {
  tone: 'taste' | 'streak';
  value: string | null;
  label: string;
  empty: string;
  art: string;
  dimArt: boolean;
  tilt: number;
}) {
  const { mode } = useTheme();
  const col = STAT_COLORS[mode][tone];
  return (
    <Sticker
      radius={24}
      clip
      style={[styles.stat, { transform: [{ rotate: `${tilt}deg` }] }]}
      faceStyle={styles.statFace}
    >
      <LinearGradient colors={col.bg} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      <Glyph of={art} size={60} dim={dimArt} style={styles.statArt} />
      <View
        accessible
        accessibilityLabel={t('you.statCardA11y', { label, value: value ?? empty })}
        style={styles.statText}
      >
        {value ? (
          <Text style={[styles.statValue, value.length > 7 && styles.statValueLong, { color: col.ink }]}>{value}</Text>
        ) : null}
        <Text variant="label" style={[styles.statLabel, { color: col.ink }]}>
          {label}
        </Text>
        {value ? null : (
          <Text variant="caption" style={[styles.statEmpty, { color: col.ink }]}>
            {empty}
          </Text>
        )}
      </View>
    </Sticker>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: space.md },
  headerText: { flex: 1, gap: 2 },
  section: { gap: 10, marginTop: space.sm },
  passport: {},
  passportFace: { height: PASS_H },
  world: { position: 'absolute', left: 0, top: 0, width: WORLD.width, height: WORLD.height },
  areaPill: { position: 'absolute', right: 14, top: 14, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  areaText: { fontFamily: 'Figtree_800ExtraBold', fontSize: 10.5, letterSpacing: 0.8 },
  passText: { position: 'absolute', left: 18, right: 18, bottom: 16, gap: 2 },
  passCount: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  passLine: { fontFamily: 'Figtree_700Bold' },
  passEmpty: { maxWidth: 260 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1 },
  statFace: { minHeight: 118, padding: 16 },
  statArt: { position: 'absolute', right: -6, bottom: -8, transform: [{ rotate: '12deg' }] },
  statText: { gap: 6 },
  statValue: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 30, lineHeight: 36, letterSpacing: -1 },
  statValueLong: { fontSize: 20, lineHeight: 26, letterSpacing: -0.5 },
  statLabel: { fontFamily: 'Figtree_700Bold', opacity: 0.9 },
  statEmpty: { opacity: 0.85, paddingRight: 34 },
  progressWrap: { gap: space.sm },
  repRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: 8,
  },
  shrink: { flexShrink: 1 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, minWidth: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: minTap + 20,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
});
