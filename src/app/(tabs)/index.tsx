import { StyleSheet, View } from 'react-native';

import { Placeholder, Screen, Text } from '@/components/ui';
import { getSpots } from '@/data/repo';
import { t } from '@/i18n';
import { tab } from '@/theme/emoji';
import { space } from '@/theme/tokens';

// Map home. The illustrated map, pins and sheet land in C2.
export default function MapScreen() {
  const spots = getSpots();
  const open = spots.filter((s) => s.open).length;
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          {t('map.title')}
        </Text>
        <Text tone="ink2">{t('map.summary', { count: spots.length, open })}</Text>
      </View>
      <Placeholder emoji={tab.map} title={t('tab.map')} body={t('map.placeholder')} badge={t('common.comingNext')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingTop: space.sm },
});
