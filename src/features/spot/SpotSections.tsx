import { StyleSheet, View } from 'react-native';

import { Badge, Card, Emoji, Text } from '@/components/ui';
import { Skeleton as Placeholder } from '@/components/ui/Skeleton';
import { busyWord, formatClock, formatPrice, todayIndex, weekdayShort } from '@/data/format';
import type { Dish, Spot } from '@/data/types';
import { t } from '@/i18n';
import { ui } from '@/theme/emoji';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// Spot page sections (02 spec 6.2). Everything wraps; no fixed text widths.

/**
 * 7-day stop strip for mobile spots, Monday first, today highlighted (after hydration on web,
 * since "today" depends on the clock and time zone). Short names wrap to two lines, never clip.
 */
export function ScheduleStrip({ spot, now, ready = true }: { spot: Spot; now: number; ready?: boolean }) {
  const { c } = useTheme();
  const today = ready ? todayIndex(now) : -1;
  const days = spot.schedule ?? [];
  return (
    <View style={styles.gapSm}>
      <Text variant="label" tone="ink2" accessibilityRole="header">
        {t('spot.schedule')}
      </Text>
      <View style={styles.strip}>
        {days.map((stop, i) => {
          const isToday = i === today;
          const day = weekdayShort(i);
          const where = stop ? stop.name : t('spot.offA11y');
          return (
            <View
              key={i}
              accessible
              accessibilityLabel={t(isToday ? 'spot.dayTodayA11y' : 'spot.dayA11y', {
                day: weekdayShort(i, 'long'),
                place: where,
              })}
              style={[styles.day, { backgroundColor: isToday ? c.neon : c.card2 }]}
            >
              <Text variant="micro" center style={{ color: isToday ? c.onNeon : c.ink2 }}>
                {day}
              </Text>
              <Text
                variant="micro"
                center
                numberOfLines={2}
                ellipsizeMode="clip"
                textBreakStrategy="simple"
                style={[styles.place, { color: isToday ? c.onNeon : stop ? c.ink : c.ink3 }]}
              >
                {stop ? stop.short : t('spot.off')}
              </Text>
            </View>
          );
        })}
      </View>
      <Text variant="caption" tone="ink2">
        {spot.owner ? t('spot.scheduleNote', { own: spot.owner }) : t('spot.scheduleNoteAnon')}
      </Text>
    </View>
  );
}

/** "What people say", clearly labeled as an AI summary. */
export function AiSummary({ spot }: { spot: Spot }) {
  return (
    <Card variant="ai">
      <View style={styles.titleRow}>
        <Emoji size={18}>{ui.sparkles}</Emoji>
        <Text variant="heading" tone="grape" accessibilityRole="header" style={styles.shrink}>
          {t('spot.whatPeopleSay')}
        </Text>
        <Badge label={t('spot.aiBadge')} tone="grape" />
      </View>
      <Text>{spot.aiSummary}</Text>
    </Card>
  );
}

const AXIS = [8, 12, 16, 20, 23];

/**
 * 16 hourly bars from 8am to 11pm. One element for screen readers.
 * The chart never contradicts the live status: "closed" and the dimmed chart only show
 * when the spot is not open; an open spot outside 8am to 11pm shows its peak instead.
 */
export function BusyBars({ spot, now, ready = true }: { spot: Spot; now: number; ready?: boolean }) {
  const { c, isNight } = useTheme();
  const hour = new Date(now).getHours();
  const inRange = hour >= 8 && hour <= 23;
  const slot = spot.open && inRange ? hour - 8 : -1;
  const peak = spot.busy.indexOf(Math.max(...spot.busy));
  const peakHour = formatClock({ h: 8 + peak, m: 0 });
  const nowText = !spot.open
    ? t('spot.busyClosed')
    : slot >= 0
      ? t('spot.busyNow', { word: busyWord(spot.busy[slot] ?? 0) })
      : t('spot.busyPeak', { peak: peakHour });
  const a11y =
    spot.open && slot < 0 ? t('spot.busyA11yPeak', { peak: peakHour }) : t('spot.busyA11y', { now: nowText, peak: peakHour });
  const dim = !spot.open;

  return (
    <Card>
      <View style={styles.titleRow}>
        <Text variant="cardTitle" accessibilityRole="header" style={styles.shrink}>
          {t('spot.busy')}
        </Text>
        {ready ? (
          <Badge label={nowText} tone={slot >= 0 && (spot.busy[slot] ?? 0) >= 6 ? 'amber' : 'neutral'} />
        ) : (
          <Placeholder height={24} width={120} />
        )}
      </View>
      <View accessible accessibilityLabel={ready ? a11y : t('spot.busy')} style={[styles.bars, dim && styles.dim]}>
        {spot.busy.map((v, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: Math.max(4, v * 8.8),
                backgroundColor: ready && i === slot ? c.chili : isNight ? 'rgba(165,133,255,0.45)' : '#c9c0f5',
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.axis} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {AXIS.map((h) => (
          <Text key={h} variant="micro" tone="ink2">
            {formatClock({ h, m: 0 })}
          </Text>
        ))}
      </View>
    </Card>
  );
}

function DishRow({ dish }: { dish: Dish }) {
  const { c } = useTheme();
  const price = formatPrice(dish.price);
  return (
    <View accessible accessibilityLabel={t('spot.dishA11y', { name: dish.name, price, pct: dish.liked })} style={styles.gapXs}>
      <View style={styles.dishTop}>
        <Text variant="ui" style={styles.grow}>
          {dish.name}
        </Text>
        <Text variant="ui" tone="ink2" style={styles.noShrink}>
          {price}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: c.card2 }]}>
        <View style={[styles.fill, { width: `${dish.liked}%`, backgroundColor: c.mintFill }]} />
      </View>
      <Text variant="caption" tone="ink2">
        {t('spot.liked', { pct: dish.liked })}
      </Text>
    </View>
  );
}

export function TopDishes({ spot }: { spot: Spot }) {
  return (
    <Card>
      <Text variant="cardTitle" accessibilityRole="header">
        {t('spot.dishes')}
      </Text>
      {spot.dishes.map((d) => (
        <DishRow key={d.name} dish={d} />
      ))}
    </Card>
  );
}

export function VibeChips({ spot }: { spot: Spot }) {
  if (!spot.vibe.length) return null;
  return (
    <View style={styles.gapSm}>
      <Text variant="heading" accessibilityRole="header">
        {t('spot.vibe')}
      </Text>
      <View style={styles.wrap}>
        {spot.vibe.map((v) => (
          <Badge key={v} label={v} style={styles.vibe} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  grow: { flex: 1, minWidth: 0 },
  noShrink: { flexShrink: 0 },
  gapXs: { gap: 6 },
  gapSm: { gap: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
  strip: { flexDirection: 'row', gap: 5 },
  day: { flex: 1, minWidth: 0, minHeight: 64, borderRadius: 11, paddingVertical: 6, paddingHorizontal: 2, gap: 2 },
  place: { fontSize: 10.5, lineHeight: 13 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 88 },
  bar: { flex: 1, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  dim: { opacity: 0.4 },
  axis: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 4 },
  dishTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  vibe: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
});
