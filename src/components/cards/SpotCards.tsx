import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Emoji, Text } from '@/components/ui';
import { closingText, formatDistance, kindLabel, moodText, priceText, statusText } from '@/data/format';
import type { Spot } from '@/data/types';
import { t } from '@/i18n';
import { mood as moodEmoji, status as statusEmoji, ui } from '@/theme/emoji';
import { useTheme } from '@/theme/use-theme';

import { FoodArt } from './FoodArt';

/** A card in the "Trending right now" rail. Pressing it focuses the spot. */
export function TrendCard({ spot, onPress }: { spot: Spot; onPress: (spot: Spot) => void }) {
  const mood = moodText(spot);
  const line = mood ?? statusText(spot);
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={t('spot.rowA11y', { name: spot.name, status: line, distance: formatDistance(spot) })}
      style={({ pressed }) => [styles.trend, pressed && { opacity: 0.85 }]}
    >
      <FoodArt food={spot.food} width={168} height={112} />
      <Text variant="ui" numberOfLines={2}>
        {spot.name}
      </Text>
      <View style={styles.inline}>
        {spot.mood ? <Emoji size={12}>{moodEmoji[spot.mood.emoji]}</Emoji> : null}
        <Text variant="caption" tone="ink2" numberOfLines={2} style={styles.shrink}>
          {line}
        </Text>
      </View>
    </Pressable>
  );
}

/** A row in "Closest to you": art, name, closing-soon pill, status, meta and distance. */
export function SpotRow({
  spot,
  closingMin,
  dimmed,
  onPress,
}: {
  spot: Spot;
  closingMin: number | null;
  dimmed?: boolean;
  onPress: (spot: Spot) => void;
}) {
  const { c } = useTheme();
  const status = statusText(spot);
  const distance = formatDistance(spot);
  const closing = closingMin !== null ? closingText(closingMin) : null;
  return (
    <Pressable
      onPress={() => onPress(spot)}
      accessibilityRole="button"
      accessibilityLabel={t('spot.rowA11y', {
        name: spot.name,
        status: closing ? `${closing}, ${status}` : status,
        distance,
      })}
      style={({ pressed }) => [styles.row, { borderBottomColor: c.line }, dimmed && styles.dim, pressed && { opacity: 0.85 }]}
    >
      <FoodArt food={spot.food} width={56} height={56} radius={16} />
      <View style={styles.middle}>
        <Text variant="ui">{spot.name}</Text>
        {closing ? <Badge tone="amber" icon={statusEmoji.closingSoon} label={closing} /> : null}
        <View style={styles.inline}>
          <View style={[styles.dot, { backgroundColor: spot.open ? c.mintFill : c.ink3 }]} />
          <Text variant="label" tone={spot.open ? 'mint' : 'ink2'} style={styles.shrink}>
            {status}
          </Text>
        </View>
        <View style={styles.inline}>
          <Emoji size={11}>{ui.star}</Emoji>
          <Text variant="caption" tone="ink2" style={styles.shrink}>
            {t('spot.meta', { r: spot.rating, price: priceText(spot), kind: kindLabel(spot) })}
          </Text>
        </View>
      </View>
      <Text variant="caption" tone="ink2" style={styles.distance}>
        {distance}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trend: { width: 168, gap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dim: { opacity: 0.45 },
  middle: { flex: 1, minWidth: 0, gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  distance: { flexShrink: 0, textAlign: 'right', paddingTop: 2 },
});
