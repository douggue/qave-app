import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { CompactSpotRow, SpotRow, TrendCard } from '@/components/cards/SpotCards';
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
import type { Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useCheckIn } from '@/hooks/use-check-in';
import { matchesFilter } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { moodGlyph, reportGlyph } from '@/theme/glyphs';
import { minTap } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type ExploreProps = { spots: Spot[]; onFocus: (spot: Spot) => void };

/** Rows shown compact at the top of the list, so the peek shows real spots (two fit). */
const COMPACT_ROWS = 3;

/** Sheet header: a heading-size title with the open count beside it. Part of the drag area. */
export function SheetHeader({ spots }: { spots: Spot[] }) {
  const open = spots.filter((s) => s.open).length;
  return (
    <View style={styles.header}>
      <Text variant="heading" accessibilityRole="header" style={styles.headerTitle}>
        {t('sheet.title')}
      </Text>
      <Text variant="label" tone="mint" style={styles.headerSub}>
        {t('sheet.openNow', { open })}
      </Text>
    </View>
  );
}

/**
 * Explore state. The peek shows the first two rows, closing-soon first then nearest (idea B),
 * so the first view is useful. Then the trending rail, then the rest of the list.
 */
export function SheetExplore({ spots, onFocus }: ExploreProps) {
  const { filter } = useStore().state;
  const now = useClock(60_000);

  const trending = spots
    .filter((s) => s.open && (s.hot || s.mood))
    .sort((a, b) => Number(b.hot) - Number(a.hot) || b.rating - a.rating)
    .slice(0, 6);

  const matching = spots.filter((s) => matchesFilter(s, filter));
  const rows = matching
    .map((spot) => ({ spot, left: closingLeft(spot, now, getAppStart()), miles: milesFromMe(spot) }))
    .sort((a, b) => {
      if (a.left !== null && b.left !== null) return a.left - b.left;
      if (a.left !== null) return -1;
      if (b.left !== null) return 1;
      return a.miles - b.miles;
    });
  const top = rows.slice(0, COMPACT_ROWS);
  const rest = rows.slice(COMPACT_ROWS);

  return (
    <>
      {top.length ? (
        <View>
          {top.map(({ spot, left }) => (
            <CompactSpotRow key={spot.id} spot={spot} closingMin={left} onPress={onFocus} />
          ))}
        </View>
      ) : (
        <Text tone="ink2">{t('sheet.noMatch')}</Text>
      )}
      <Text variant="label" tone="ink2">
        {t('sheet.sub', { count: spots.length, open: spots.filter((s) => s.open).length })}
        {'\n'}
        {t('sheet.hint')}
      </Text>
      <View style={styles.sectionTitle}>
        <Glyph of={reportGlyph.amazing} size={18} />
        <Text variant="heading" accessibilityRole="header" style={styles.shrink}>
          {t('sheet.trending')}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {trending.map((spot) => (
          <TrendCard key={spot.id} spot={spot} onPress={onFocus} />
        ))}
      </ScrollView>
      {rest.length ? (
        <>
          <Text variant="heading" accessibilityRole="header">
            {t('sheet.more')}
          </Text>
          <View>
            {rest.map(({ spot, left }) => (
              <SpotRow key={spot.id} spot={spot} closingMin={left} onPress={onFocus} />
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
        <FoodArt food={spot.food} width={72} height={72} />
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
              {t('spot.metaFull', { r: spot.rating, n: spot.reviewCount, price: priceText(spot), kind: kindLabel(spot) })}
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
          style={[styles.close, { backgroundColor: c.card2 }]}
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
            variant="ghost"
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
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  headerTitle: { flexShrink: 1 },
  headerSub: { flexShrink: 1 },
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
