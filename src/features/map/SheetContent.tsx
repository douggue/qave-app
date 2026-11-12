import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { SpotRow, TrendCard } from '@/components/cards/SpotCards';
import { StillThere } from '@/components/spot/Freshness';
import { Badge, Button, Emoji, Text, useToast } from '@/components/ui';
import {
  closingLeft,
  closingText,
  formatDistance,
  kindLabel,
  milesFromMe,
  moodText,
  priceText,
  statusText,
} from '@/data/format';
import type { Spot } from '@/data/types';
import { APP_START, useClock } from '@/hooks/use-clock';
import { matchesFilter } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP } from '@/state/rep';
import { useStore } from '@/state/store';
import { mood as moodEmoji, report as reportEmoji, status as statusEmoji, ui } from '@/theme/emoji';
import { minTap } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type ExploreProps = { spots: Spot[]; onFocus: (spot: Spot) => void };

/** Sheet header: title plus the live count line. Part of the drag area. */
export function SheetHeader({ spots }: { spots: Spot[] }) {
  const open = spots.filter((s) => s.open).length;
  return (
    <View style={styles.header}>
      <Text variant="title" accessibilityRole="header">
        {t('sheet.title')}
      </Text>
      <Text variant="caption" tone="ink2">
        {t('sheet.sub', { count: spots.length, open })}
      </Text>
    </View>
  );
}

/** Explore state: trending rail, then closest spots with closing-soon first (idea B). */
export function SheetExplore({ spots, onFocus }: ExploreProps) {
  const { filter } = useStore().state;
  const now = useClock(60_000);

  const trending = spots
    .filter((s) => s.open && (s.hot || s.mood))
    .sort((a, b) => Number(b.hot) - Number(a.hot) || b.rating - a.rating)
    .slice(0, 6);

  const matching = spots.filter((s) => matchesFilter(s, filter));
  const rows = matching
    .map((spot) => ({ spot, left: closingLeft(spot, now, APP_START), miles: milesFromMe(spot) }))
    .sort((a, b) => {
      if (a.left !== null && b.left !== null) return a.left - b.left;
      if (a.left !== null) return -1;
      if (b.left !== null) return 1;
      return a.miles - b.miles;
    });

  return (
    <>
      <Text variant="label" tone="ink2">
        {t('sheet.hint')}
      </Text>
      <View style={styles.sectionTitle}>
        <Emoji size={18}>{reportEmoji.amazing}</Emoji>
        <Text variant="heading" accessibilityRole="header" style={styles.shrink}>
          {t('sheet.trending')}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {trending.map((spot) => (
          <TrendCard key={spot.id} spot={spot} onPress={onFocus} />
        ))}
      </ScrollView>
      <Text variant="heading" accessibilityRole="header">
        {t('sheet.closest')}
      </Text>
      {rows.length ? (
        <View>
          {rows.map(({ spot, left }) => (
            <SpotRow key={spot.id} spot={spot} closingMin={left} onPress={onFocus} />
          ))}
        </View>
      ) : (
        <Text tone="ink2">{t('sheet.noMatch')}</Text>
      )}
    </>
  );
}

/** Preview state for the selected spot. */
export function SheetPreview({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const { c } = useTheme();
  const { state, actions } = useStore();
  const toast = useToast();
  const now = useClock(60_000);
  const left = closingLeft(spot, now, APP_START);
  const mood = moodText(spot);
  const checkedIn = (state.checkIns[spot.id] ?? 0) > 0;
  const friends = spot.friends ?? [];

  const checkIn = () => {
    actions.checkIn(spot.id, REP.checkIn);
    toast.show(t('checkin.done', { spot: spot.name }), { emoji: ui.check });
  };

  return (
    <View style={styles.preview}>
      <View style={styles.top}>
        <FoodArt food={spot.food} width={72} height={72} />
        <View style={styles.titleCol}>
          <Text variant="title" accessibilityRole="header">
            {spot.name}
          </Text>
          <View style={styles.inline}>
            <Emoji size={12}>{ui.star}</Emoji>
            <Text
              variant="caption"
              tone="ink2"
              style={styles.shrink}
              accessibilityLabel={t('spot.ratingA11y', { r: spot.rating, n: spot.reviewCount })}
            >
              {t('spot.metaFull', { r: spot.rating, n: spot.reviewCount, price: priceText(spot), kind: kindLabel(spot) })}
            </Text>
          </View>
          <View style={styles.inline}>
            <View style={[styles.dot, { backgroundColor: spot.open ? c.mintFill : c.ink3 }]} />
            <Text variant="ui" tone={spot.open ? 'mint' : 'ink2'} style={styles.shrink}>
              {statusText(spot)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('sheet.close')}
          style={[styles.close, { backgroundColor: c.card2 }]}
        >
          <Text variant="ui" tone="ink2">
            {ui.close}
          </Text>
        </Pressable>
      </View>

      <View style={styles.wrapRow}>
        {left !== null ? <Badge tone="amber" icon={statusEmoji.closingSoon} label={closingText(left)} /> : null}
        {mood && spot.mood ? <Badge tone="neon" icon={moodEmoji[spot.mood.emoji]} label={mood} /> : null}
        <Text variant="caption" tone="ink2">
          {t('spot.distHood', { distance: formatDistance(spot), hood: spot.hood })}
        </Text>
      </View>

      <StillThere spot={spot} />

      {friends.length ? (
        <Text variant="label" tone="ink2">
          {friends.length > 1
            ? t('spot.friendsN', { name: friends[0].name, n: friends.length - 1 })
            : t('spot.friends1', { name: friends[0].name })}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            size="sm"
            variant={checkedIn ? 'soft' : 'primary'}
            icon={checkedIn ? ui.check : undefined}
            label={checkedIn ? t('act.here') : t('act.checkIn')}
            accessibilityLabel={t('act.checkInA11y', { name: spot.name })}
            disabled={!spot.open}
            onPress={checkIn}
          />
        </View>
        <View style={styles.action}>
          <Button
            size="sm"
            variant="ghost"
            label={t('act.report')}
            accessibilityLabel={t('act.reportA11y', { name: spot.name })}
            onPress={actions.openReport}
          />
        </View>
        <View style={styles.action}>
          <Button
            size="sm"
            variant="ghost"
            label={t('act.open')}
            accessibilityLabel={t('act.openA11y', { name: spot.name })}
            onPress={() => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })}
          />
        </View>
      </View>
      <Button
        variant="soft"
        label={t('spot.openPage')}
        accessibilityLabel={t('act.openA11y', { name: spot.name })}
        onPress={() => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 10, gap: 2 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rail: { gap: 12, paddingRight: 16 },
  shrink: { flexShrink: 1 },
  preview: { gap: 12 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titleCol: { flex: 1, minWidth: 0, gap: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  close: { width: minTap, height: minTap, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { flexGrow: 1, flexBasis: 96 },
});
