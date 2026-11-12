import { StyleSheet, View } from 'react-native';

import { Badge, Placeholder, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { tab } from '@/theme/emoji';
import { space } from '@/theme/tokens';

// Ask Lokal. The canned chat (labeled Demo) lands in C4.
export default function AskScreen() {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="title" accessibilityRole="header" style={styles.title}>
            {t('ask.title')}
          </Text>
          <Badge label={t('common.demo')} tone="grape" />
        </View>
        <Text tone="ink2">{t('ask.demoNote')}</Text>
      </View>
      <Placeholder emoji={tab.ask} title={t('ask.title')} body={t('ask.placeholder')} badge={t('common.comingNext')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingTop: space.sm },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
  title: { flexShrink: 1 },
});
