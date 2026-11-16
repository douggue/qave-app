import { router } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { SpotCard, SpotRow } from '@/components/cards/SpotCards';
import { ClosingSoon, StillThere } from '@/components/spot/Freshness';
import { Badge, Button, Glyph, LiveText, Text, useToast } from '@/components/ui';
import {
  closingLeft,
  friendsText,
  formatDistance,
  kindLabel,
  milesFromMe,
  moodText,
  priceText,
  statusText,
} from '@/data/format';
import { directionsUrl } from '@/data/links';
import { rankTonight } from '@/data/rank';
import type { Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useCheckIn } from '@/hooks/use-check-in';
import { matchesFilter, useAllReports } from '@/hooks/use-spots';
import { t, type StringKey } from '@/i18n';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { moodGlyph } from '@/theme/glyphs';
import { minTap, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { CategoryTiles } from './CategoryTiles';

export type ExploreMode = 'explore' | 'top';

type ExploreProps = {
  spots: Spot[];
  onFocus: (spot: Spot) => void;
  /** 'top' shows the full Top 10 list instead of the explore content. */
  mode: ExploreMode;
  onModeChange: (mode: ExploreMode) => void;
};

/** Open spots ranked for tonight (src/data/rank.ts), from live reports and your activity. */
function useTonightRank(spots: Spot[]): Spot[] {
  const { checkIns, votes, stillHere } = useStore().state;
  const reports = useAllReports();
  const now = useClock(60_000);
  return useMemo(
    () => rankTonight(spots, { reports, checkIns, votes, stillHere, now, appStart: getAppStart() }),
    [spots, reports, checkIns, votes, stillHere, now],
  );
}

/** "Top 10 tonight" after 5 PM (and late), "Top 10 today" in the day. */
function useTopTitle(): StringKey {
  const now = useClock(60_000);
  const h = new Date(now).getHours();
  return h >= 17 || h < 5 ? 'top.tonight' : 'top.today';
}

/** A section heading in the panel: Unbounded 18, with an optional "See all" on the right. */
function SectionHead({
  title,
  action,
}: {
  title: string;
  action?: { label: string; a11y: string; onPress: () => void };
}) {
  const { c } = useTheme();
  return (
    <View style={styles.titleRow}>
      <Text variant="heading" accessibilityRole="header" style={styles.titleText}>
        {title}
      </Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.a11y}
          hitSlop={4}
          style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
        >
          <Text variant="label" tone="ink2" style={styles.seeAllText}>
            {action.label}
          </Text>
          <Glyph of={ui.chevron} size={10} color={c.ink2} strokeWidth={2.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Explore state (Mix). The peek shows the category tiles (the map's only filter) and the
 * "Top 10 tonight" heading with the top of the first cards. Half and full add the Top 10 rail,
 * then Closing soon and More near you. Everything follows the selected tile.
 * In 'top' mode it shows the whole Top 10 as a ranked list.
 */
export function SheetExplore({ spots, onFocus, mode, onModeChange }: ExploreProps) {
  const { c } = useTheme();
  const { filter } = useStore().state;
  const now = useClock(60_000);
  const ranked = useTonightRank(spots).filter((s) => matchesFilter(s, filter));
  const topTitle = t(useTopTitle());

  if (mode === 'top') {
    return (
      <>
        <View style={styles.topHead}>
          <Pressable
            onPress={() => onModeChange('explore')}
            accessibilityRole="button"
            accessibilityLabel={t('top.backA11y')}
            style={({ pressed }) => [styles.back, { backgroundColor: c.card2 }, pressed && styles.pressed]}
          >
            <Glyph of={ui.back} size={14} color={c.ink} strokeWidth={2.6} />
            <Text variant="label">{t('top.back')}</Text>
          </Pressable>
        </View>
        <Text variant="title" accessibilityRole="header">
          {topTitle}
        </Text>
        <Text variant="label" tone="ink2">
          {t('top.sub')}
        </Text>
        {ranked.length ? (
          <View style={styles.list}>
            {ranked.map((spot, i) => (
              <SpotRow key={spot.id} spot={spot} rank={i + 1} onPress={onFocus} />
            ))}
          </View>
        ) : (
          <Text tone="ink2">{t('top.empty')}</Text>
        )}
      </>
    );
  }

  const appStart = getAppStart();
  const matching = spots.filter((s) => matchesFilter(s, filter));
  const closing = matching
    .map((spot) => ({ spot, left: closingLeft(spot, now, appStart) }))
    .filter((r): r is { spot: Spot; left: number } => r.left !== null)
    .sort((a, b) => a.left - b.left)
    .map((r) => r.spot);
  const more = matching
    .filter((s) => !closing.includes(s))
    .sort((a, b) => Number(b.open) - Number(a.open) || milesFromMe(a) - milesFromMe(b));

  return (
    <>
      <CategoryTiles />
      <SectionHead
        title={topTitle}
        action={
          ranked.length > 1
            ? { label: t('top.seeAll'), a11y: t('top.seeAllA11y'), onPress: () => onModeChange('top') }
            : undefined
        }
      />
      {ranked.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.railScroll}
          contentContainerStyle={styles.rail}
        >
          {ranked.map((spot, i) => (
            <SpotCard key={spot.id} spot={spot} rank={i + 1} onPress={onFocus} />
          ))}
        </ScrollView>
      ) : (
        <Text tone="ink2">{matching.length ? t('top.empty') : t('sheet.noMatch')}</Text>
      )}
      {closing.length ? (
        <>
          <SectionHead title={t('sheet.closingSoon')} />
          <View style={styles.list}>
            {closing.map((spot) => (
              <SpotRow key={spot.id} spot={spot} onPress={onFocus} />
            ))}
          </View>
        </>
      ) : null}
      {more.length ? (
        <>
          <SectionHead title={t('sheet.more')} />
          <View style={styles.list}>
            {more.map((spot) => (
              <SpotRow key={spot.id} spot={spot} dimmed={!spot.open} onPress={onFocus} />
            ))}
          </View>
        </>
      ) : null}
    </>
  );
}

/** Preview state for the selected spot. */
export function SheetPreview({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const { c } = useTheme();
  const { actions } = useStore();
  const toast = useToast();
  const mood = moodText(spot);
  const { here: checkedIn, checkIn } = useCheckIn(spot);
  const friends = spot.friends ?? [];

  return (
    <View style={styles.preview}>
      <View style={styles.top}>
        <FoodArt food={spot.food} width={76} height={76} radius={20} />
        <View style={styles.titleCol}>
          <Text variant="title" accessibilityRole="header">
            {spot.name}
          </Text>
          <View style={styles.inline}>
            <Glyph of={ui.star} size={12} />
            <Text
              variant="caption"
              tone="ink2"
              style={styles.shrink}
              accessibilityLabel={t('spot.ratingA11y', { r: spot.rating, n: spot.reviewCount })}
            >
              {t('spot.metaFull', {
                r: spot.rating,
                n: spot.reviewCount,
                price: priceText(spot),
                kind: kindLabel(spot),
              })}
            </Text>
          </View>
          <View style={styles.inline}>
            <View style={[styles.dot, { backgroundColor: spot.open ? c.mintFill : c.ink3 }]} />
            <LiveText variant="ui" tone={spot.open ? 'mint' : 'ink2'} style={styles.shrink} placeholderWidth="70%">
              {statusText(spot)}
            </LiveText>
          </View>
          <ClosingSoon spot={spot} />
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('sheet.close')}
          style={({ pressed }) => [styles.close, { backgroundColor: c.card2 }, pressed && styles.pressed]}
        >
          <Glyph of={ui.close} size={14} color={c.ink2} strokeWidth={2.6} />
        </Pressable>
      </View>

      <View style={styles.wrapRow}>
        {mood && spot.mood ? <Badge tone="neon" icon={moodGlyph[spot.mood.emoji]} label={mood} /> : null}
        <LiveText variant="caption" tone="ink2" placeholderWidth={140}>
          {t('spot.distHood', { distance: formatDistance(spot), hood: spot.hood })}
        </LiveText>
      </View>

      <StillThere spot={spot} />

      {friends.length ? (
        <Text variant="label" tone="ink2">
          {friendsText(friends.map((f) => f.name))}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            size="sm"
            variant={checkedIn ? 'soft' : 'primary'}
            icon={checkedIn ? ui.check : undefined}
            label={checkedIn ? t('act.here') : t('act.checkIn')}
            accessibilityLabel={t(checkedIn ? 'act.hereA11y' : 'act.checkInA11y', { name: spot.name })}
            disabled={checkedIn}
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
            variant="soft"
            icon={ui.go}
            label={t('act.go')}
            accessibilityLabel={t('act.goA11y', { name: spot.name })}
            onPress={() =>
              Linking.openURL(directionsUrl(spot)).catch(() => toast.show(t('toast.mapsError'), { emoji: ui.go }))
            }
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
  rail: { gap: 12, paddingHorizontal: 20, paddingBottom: 4, alignItems: 'flex-start' },
  railScroll: { marginHorizontal: -20, flexGrow: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  titleText: { flex: 1, minWidth: 0 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: minTap, paddingLeft: 8 },
  seeAllText: { fontFamily: 'Figtree_700Bold' },
  list: { gap: 10 },
  topHead: { flexDirection: 'row' },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: minTap,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  pressed: { opacity: 0.85 },
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
