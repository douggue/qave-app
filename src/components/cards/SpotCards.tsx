import { Pressable, StyleSheet, View } from 'react-native';

import { Glyph, LiveText, RankNumber, Sticker, Text } from '@/components/ui';
import { dropState } from '@/data/drops';
import { cardMeta, closingLeft, closingText, formatDistance, ratingText, tagTexts, whenText } from '@/data/format';
import { getDrops } from '@/data/repo';
import type { Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { uiGlyph, type IconGlyph } from '@/theme/glyphs';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { FoodArt } from './FoodArt';

// One card anatomy for every spot card (Top 10, panel rows, Ask), in the Mix sticker style:
//   at most ONE ribbon (active Drop "8 left" > Closing soon > Just parked > none),
//   one meta line (star rating · distance · "until 10 PM" / "opens Sat 9 AM"),
//   up to 3 small grey tags from the spot's data.

export type Ribbon = { label: string; tone: 'grape' | 'amber' | 'sky' | 'hot'; icon: IconGlyph };

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
    if (s.phase === 'live' && s.left > 0)
      return { label: t('ribbon.left', { n: s.left }), tone: 'grape', icon: { icon: 'ticket' } };
  }
  if (closingLeft(spot, now, appStart) !== null)
    return { label: t('ribbon.closing'), tone: 'amber', icon: { icon: 'alarm' } };
  const parkedReport = reports.some(
    (r) => r.spotId === spot.id && r.type === 'parked' && r.createdAt && now - r.createdAt < PARKED_FRESH_MIN * 60_000,
  );
  if (spot.open && (spot.mood?.emoji === 'parked' || parkedReport)) {
    return { label: t('ribbon.parked'), tone: 'sky', icon: { icon: 'truck' } };
  }
  if (spot.open && spot.hot) return { label: t('ribbon.hot'), tone: 'hot', icon: { icon: 'flame' } };
  return null;
}

/** Ribbon fills: bright in both modes, always with ink text (4.5:1 or better on each). */
const RIBBON_BG: Record<Ribbon['tone'], string> = {
  hot: '#ff5a3c',
  amber: '#ffcc33',
  sky: '#4aa8ff',
  grape: '#a585ff',
};
const RIBBON_INK = '#17131a';

/** The card's screen-reader label: rank, name, ribbon, meta and tags, in reading order. */
export function cardA11y(spot: Spot, ribbon: Ribbon | null, rank?: number): string {
  const meta = t('card.metaA11y', {
    r: ratingText(spot),
    distance: formatDistance(spot, { long: true }),
    when: whenText(spot),
  });
  return [
    rank ? t('top.rankA11y', { n: rank }) : null,
    spot.name,
    ribbon?.label,
    meta,
    tagTexts(spot).join(', ') || null,
  ]
    .filter(Boolean)
    .join('. ');
}

/** The bold ribbon: on the art (cards) or inline under the name (rows). Caps, outlined like a sticker. */
export function SpotRibbon({ ribbon, onArt }: { ribbon: Ribbon; onArt?: boolean }) {
  const { c, st } = useTheme();
  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.ribbon,
        onArt && styles.ribbonOnArt,
        { backgroundColor: RIBBON_BG[ribbon.tone], borderWidth: st.line, borderColor: c.ctaLine },
      ]}
    >
      <Glyph of={ribbon.icon} size={10} color={RIBBON_INK} plain strokeWidth={2.8} />
      <Text variant="micro" style={[styles.ribbonText, { color: RIBBON_INK }]}>
        {ribbon.label.toLocaleUpperCase()}
      </Text>
    </View>
  );
}

/** The shared meta line. With `closingMin`, the time part reads "Closes in 25 min" in amber. */
export function SpotMeta({ spot, closingMin = null }: { spot: Spot; closingMin?: number | null }) {
  const closing = closingMin !== null ? closingText(closingMin) : null;
  const text = closing
    ? t('card.meta', { r: ratingText(spot), distance: formatDistance(spot), when: '' })
    : cardMeta(spot);
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
  const { c } = useTheme();
  const tags = tagTexts(spot);
  if (!tags.length) return null;
  return (
    <View style={styles.tags} aria-hidden importantForAccessibility="no-hide-descendants">
      {tags.map((tag) => (
        <View key={tag} style={[styles.tag, { backgroundColor: c.card2 }]}>
          <Text variant="micro" tone="ink2" style={styles.tagText}>
            {tag}
          </Text>
        </View>
      ))}
    </View>
  );
}

const CARD_W = 224;
const ART_H = 118;

/**
 * A Top 10 rail card: sticker anatomy (outline and hard drop), art with the big yellow rank
 * number and the ribbon, then name, meta line and tags. Pressing it focuses the spot.
 */
export function SpotCard({ spot, rank, onPress }: { spot: Spot; rank?: number; onPress: (spot: Spot) => void }) {
  const ribbon = useRibbon(spot);
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={cardA11y(spot, ribbon, rank)}
      style={styles.cardPress}
    >
      {({ pressed }) => (
        <Sticker radius={22} pressed={pressed} clip>
          <View>
            <FoodArt
              food={spot.food}
              width="100%"
              height={ART_H}
              radius={0}
              emojiSize={86}
              fillStyle={rank ? styles.rankedArt : null}
            />
            {rank ? <RankNumber n={rank} style={styles.rank} /> : null}
            {ribbon ? <SpotRibbon ribbon={ribbon} onArt /> : null}
          </View>
          <View style={styles.meta}>
            <Text variant="ui" numberOfLines={1} style={styles.name}>
              {spot.name}
            </Text>
            <SpotMeta spot={spot} />
            <SpotTags spot={spot} />
          </View>
        </Sticker>
      )}
    </Pressable>
  );
}

/**
 * A list card (Closing soon, More near you, the Top 10 list): art, name, the ribbon as an
 * inline pill, the meta line and tags, in the sticker anatomy. With `rank`, a rank number leads.
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
  const now = useClock(60_000);
  const closingMin = closingLeft(spot, now, getAppStart());
  const ribbon = useRibbon(spot);
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={cardA11y(spot, ribbon, rank)}
      style={dimmed && styles.dim}
    >
      {({ pressed }) => (
        <Sticker radius={20} pressed={pressed} faceStyle={styles.row}>
          {rank ? <RankNumber n={rank} size={30} style={styles.rowRank} /> : null}
          <FoodArt food={spot.food} width={60} height={60} radius={16} />
          <View style={styles.middle}>
            <Text variant="ui" style={styles.name}>
              {spot.name}
            </Text>
            {ribbon ? <SpotRibbon ribbon={ribbon} /> : null}
            <SpotMeta spot={spot} closingMin={closingMin} />
            <SpotTags spot={spot} />
          </View>
        </Sticker>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardPress: { width: CARD_W },
  rankedArt: { paddingLeft: 48 },
  rank: { position: 'absolute', top: 2, left: 12 },
  meta: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 4 },
  name: { fontSize: 15.5, lineHeight: 20 },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  ribbonOnArt: { position: 'absolute', right: 10, bottom: 10, maxWidth: CARD_W - 20 },
  ribbonText: { flexShrink: 1, fontFamily: 'Figtree_800ExtraBold', fontSize: 10.5, letterSpacing: 0.6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shrink: { flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  tagText: { letterSpacing: 0.1, fontSize: 10.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowRank: { minWidth: 24 },
  dim: { opacity: 0.45 },
  middle: { flex: 1, minWidth: 0, gap: 4 },
});
