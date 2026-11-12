import { StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { Button, Card, Emoji, LiveText, Text } from '@/components/ui';
import { formatDistance, priceText, statusText } from '@/data/format';
import type { Spot } from '@/data/types';
import { t } from '@/i18n';
import { ui } from '@/theme/emoji';
import { space } from '@/theme/tokens';

/** A spot suggested by Ask: art, name, meta, status and "Show on map". */
export function AnswerCard({ spot, onShowOnMap }: { spot: Spot; onShowOnMap: (spotId: string) => void }) {
  const meta = t('ask.cardMeta', { r: spot.rating, price: priceText(spot), distance: formatDistance(spot) });
  return (
    <Card>
      <View
        accessible
        accessibilityLabel={t('spot.rowA11y', { name: spot.name, status: statusText(spot), distance: formatDistance(spot) })}
        style={styles.row}
      >
        <FoodArt food={spot.food} width={48} height={48} radius={14} />
        <View style={styles.text}>
          <Text variant="ui">{spot.name}</Text>
          <View style={styles.inline}>
            <Emoji size={11}>{ui.star}</Emoji>
            <LiveText variant="caption" tone="ink2" style={styles.shrink} placeholderWidth="70%">
              {meta}
            </LiveText>
          </View>
          <LiveText variant="caption" tone={spot.open ? 'mint' : 'ink2'} placeholderWidth="60%">
            {statusText(spot)}
          </LiveText>
        </View>
      </View>
      <Button
        variant="ghost"
        size="sm"
        icon={ui.pin}
        label={t('common.showOnMap')}
        accessibilityLabel={t('common.showOnMapA11y', { name: spot.name })}
        onPress={() => onShowOnMap(spot.id)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  text: { flex: 1, gap: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
});
