import { StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { cardA11y, SpotMeta, SpotRibbon, SpotTags, useRibbon } from '@/components/cards/SpotCards';
import { Button, Card, Text } from '@/components/ui';
import type { Spot } from '@/data/types';
import { t } from '@/i18n';
import { ui } from '@/theme/emoji';
import { space } from '@/theme/tokens';

/** A spot suggested by Ask: the shared card anatomy (ribbon, meta line, tags) and "Show on map". */
export function AnswerCard({ spot, onShowOnMap }: { spot: Spot; onShowOnMap: (spotId: string) => void }) {
  const ribbon = useRibbon(spot);
  return (
    <Card>
      <View accessible accessibilityLabel={cardA11y(spot, ribbon)} style={styles.row}>
        <FoodArt food={spot.food} width={48} height={48} radius={14} />
        <View style={styles.text}>
          <Text variant="ui">{spot.name}</Text>
          {ribbon ? <SpotRibbon ribbon={ribbon} /> : null}
          <SpotMeta spot={spot} />
          <SpotTags spot={spot} />
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
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  text: { flex: 1, gap: 4 },
});
