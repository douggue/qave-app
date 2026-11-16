import { Pressable, StyleSheet, View } from 'react-native';

import { Glyph, LiveText, Text } from '@/components/ui';
import { dropState } from '@/data/drops';
import { cardMeta, closingLeft, closingText, formatDistance, ratingText, tagTexts, whenText } from '@/data/format';
import { getDrops } from '@/data/repo';
import type { Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { uiGlyph, type IconGlyph } from '@/theme/glyphs';
import { radius, type Palette } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { FoodArt } from './FoodArt';

// One card anatomy for every spot card (Top 10, Trending, panel rows):
//   at most ONE ribbon (active Drop "8 left" > Closing soon > Just parked > none),
//   one meta line (star rating · distance · "until 10 PM" / "opens Sat 9 AM"),
//   up to 3 small grey tags from the spot's data.

export type Ribbon = { label: string; tone: 'grape' | 'amber' | 'sky'; icon: IconGlyph };

/** Minutes before a "Just parked" mood or report stops counting as fresh. */
const PARKED_FRESH_MIN = 30;

/** The one ribbon a spot earns right now, by priority, or null. */
export function useRibbon(spot: Spot): Ribbon | null {
  const now = useClock(5000);
  const { claims, reports } = useStore().state;
  const appStart = getAppStart();
  for (const drop of getDrops()) {
    if (drop.spotId !== spot.id) continue;
    const s = dropState(drop, now, appStart, !!claims[drop.id]);
    if (s.phase === 'live' && s.left > 0) return { label: t('ribbon.left', { n: s.left }), tone: 'grape', icon: { icon: 'ticket' } };
  }
  if (closingLeft(spot, now, appStart) !== null) return { label: t('ribbon.closing'), tone: 'amber', icon: { icon: 'alarm' } };
  const parkedReport = reports.some(
    (r) => r.spotId === spot.id && r.type === 'parked' && r.createdAt && now - r.createdAt < PARKED_FRESH_MIN * 60_000,
  );
  if (spot.open && (spot.mood?.emoji === 'parked' || parkedReport)) {
    return { label: t('ribbon.parked'), tone: 'sky', icon: { icon: 'truck' } };
  }
  return null;
}

/** Ink on a ribbon's solid color: dark on the bright night tones, white on the deeper day ones. */
const ribbonInk = (isNight: boolean) => (isNight ? '#10101e' : '#ffffff');

/** The card's screen-reader label: rank, name, ribbon, meta and tags, in reading order. */
export function cardA11y(spot: Spot, ribbon: Ribbon | null, rank?: number): string {
  const meta = t('card.metaA11y', {
    r: ratingText(spot),
    distance: formatDistance(spot, { long: true }),
    when: whenText(spot),
  });
  return [rank ? t('top.rankA11y', { n: rank }) : null, spot.name, ribbon?.label, meta, tagTexts(spot).join(', ') || null]
    .filter(Boolean)
    .join('. ');
}

/** The bold ribbon: on the art (cards) or inline under the name (rows). */
export function SpotRibbon({ ribbon, onArt }: { ribbon: Ribbon; onArt?: boolean }) {
  const { c, isNight } = useTheme();
  const ink = ribbonInk(isNight);
  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.ribbon, onArt && styles.ribbonOnArt, { backgroundColor: c[ribbon.tone as keyof Palette] }]}
    >
      <Glyph of={ribbon.icon} size={11} color={ink} plain strokeWidth={2.6} />
      <Text variant="caption" style={[styles.ribbonText, { color: ink }]}>
        {ribbon.label}
      </Text>
    </View>
  );
}

/** The shared meta line. With `closingMin`, the time part reads "Closes in 25 min" in amber. */
export function SpotMeta({ spot, closingMin = null }: { spot: Spot; closingMin?: number | null }) {
  const closing = closingMin !== null ? closingText(closingMin) : null;
  const text = closing ? t('card.meta', { r: ratingText(spot), distance: formatDistance(spot), when: '' }) : cardMeta(spot);
  return (
    <View style={styles.inline} aria-hidden importantForAccessibility="no-hide-descendants">
      <Glyph of={uiGlyph.star} size={11} />
      <LiveText variant="caption" tone="ink2" style={styles.shrink} placeholderWidth="75%">
        {text}
        {closing ? (
          <Text variant="caption" tone="amber">
            {closing}
          </Text>
        ) : null}
      </LiveText>
    </View>
  );
}

/** Up to three small grey tags. */
export function SpotTags({ spot }: { spot: Spot }) {
  const { c, isNight } = useTheme();
  const tags = tagTexts(spot);
  if (!tags.length) return null;
  return (
    <View style={styles.tags} aria-hidden importantForAccessibility="no-hide-descendants">
      {tags.map((tag) => (
        <View
          key={tag}
          style={[styles.tag, isNight ? { backgroundColor: c.card2 } : { backgroundColor: c.card, borderColor: c.line, borderWidth: 1 }]}
        >
          <Text variant="micro" tone="ink2" style={styles.tagText}>
            {tag}
          </Text>
        </View>
      ))}
    </View>
  );
}

const CARD_W = 176;

/**
 * A rail card (Top 10, Trending): art with the ribbon (and a big rank number when ranked),
 * then name, meta line and tags. Pressing it focuses the spot.
 */
export function SpotCard({ spot, rank, onPress }: { spot: Spot; rank?: number; onPress: (spot: Spot) => void }) {
  const ribbon = useRibbon(spot);
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={cardA11y(spot, ribbon, rank)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View>
        <FoodArt food={spot.food} width={CARD_W} height={112} emojiSize={rank ? 56 : undefined} fillStyle={rank ? styles.rankedArt : null} />
        {rank ? (
          <Text aria-hidden importantForAccessibility="no" style={styles.rank} maxFontSizeMultiplier={1.2}>
            {String(rank)}
          </Text>
        ) : null}
        {ribbon ? <SpotRibbon ribbon={ribbon} onArt /> : null}
      </View>
      <Text variant="ui" numberOfLines={1}>
        {spot.name}
      </Text>
      <SpotMeta spot={spot} />
      <SpotTags spot={spot} />
    </Pressable>
  );
}

/** A card in the "Trending right now" rail: the shared card anatomy. */
export function TrendCard({ spot, onPress }: { spot: Spot; onPress: (spot: Spot) => void }) {
  return <SpotCard spot={spot} onPress={onPress} />;
}

/**
 * A list row (More near you, the Top 10 list): art, name, the ribbon as an inline pill,
 * the meta line and tags. With `rank`, a big rank number leads the row.
 */
export function SpotRow({
  spot,
  rank,
  dimmed,
  onPress,
}: {
  spot: Spot;
  rank?: number;
  dimmed?: boolean;
  onPress: (spot: Spot) => void;
}) {
  const { c } = useTheme();
  const ribbon = useRibbon(spot);
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={cardA11y(spot, ribbon, rank)}
      style={({ pressed }) => [styles.row, { borderBottomColor: c.line }, dimmed && styles.dim, pressed && styles.pressed]}
    >
      {rank ? (
        <Text variant="heading" style={styles.rowRank} aria-hidden importantForAccessibility="no">
          {String(rank)}
        </Text>
      ) : null}
      <FoodArt food={spot.food} width={56} height={56} radius={16} />
      <View style={styles.middle}>
        <Text variant="ui">{spot.name}</Text>
        {ribbon ? <SpotRibbon ribbon={ribbon} /> : null}
        <SpotMeta spot={spot} />
        <SpotTags spot={spot} />
      </View>
    </Pressable>
  );
}

/** Height of a compact row, so the sheet peek can show exactly two. */
export const COMPACT_ROW_H = 52;

/**
 * A two-line row for the sheet's first view: art, name, and the shared meta line (its time
 * part turns amber "Closes in N min" when closing soon). No ribbon or tags: the peek is tight.
 */
export function CompactSpotRow({ spot, onPress }: { spot: Spot; onPress: (spot: Spot) => void }) {
  const { c } = useTheme();
  const now = useClock(60_000);
  const closingMin = closingLeft(spot, now, getAppStart());
  const ribbon = useRibbon(spot);
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={cardA11y(spot, ribbon)}
      style={({ pressed }) => [styles.compact, { borderBottomColor: c.line }, pressed && styles.pressed]}
    >
      <FoodArt food={spot.food} width={40} height={40} radius={12} emojiSize={24} />
      <View style={styles.middle}>
        <Text variant="ui" numberOfLines={1}>
          {spot.name}
        </Text>
        <SpotMeta spot={spot} closingMin={closingMin} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: COMPACT_ROW_H,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  card: { width: CARD_W, gap: 6 },
  rankedArt: { paddingLeft: 40 },
  rank: {
    position: 'absolute',
    top: 2,
    left: 10,
    fontFamily: 'Unbounded_800ExtraBold',
    fontSize: 40,
    lineHeight: 50,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  ribbonOnArt: { position: 'absolute', right: 8, bottom: 8, maxWidth: CARD_W - 16 },
  ribbonText: { flexShrink: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shrink: { flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  tagText: { letterSpacing: 0.1 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowRank: { minWidth: 26, textAlign: 'center', paddingTop: 14 },
  dim: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  middle: { flex: 1, minWidth: 0, gap: 4 },
});
