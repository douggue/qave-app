import { StyleSheet, View } from 'react-native';

import { Placeholder, Screen, Text } from '@/components/ui';
import { getDrops } from '@/data/repo';
import { t } from '@/i18n';
import { tab } from '@/theme/emoji';
import { space } from '@/theme/tokens';

// Drops. The countdown cards land in C4.
export default function DropsScreen() {
  const drops = getDrops();
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          {t('drops.title')}
        </Text>
        <Text tone="ink2">{t('drops.subtitle')}</Text>
      </View>
      <Placeholder
        emoji={tab.drops}
        title={t('drops.title')}
        body={t('drops.placeholder', { count: drops.length })}
        badge={t('common.comingNext')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingTop: space.sm },
});
