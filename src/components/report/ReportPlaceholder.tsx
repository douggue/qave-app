import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Opened by the center Report action. The real radial replaces this in C3. */
export function ReportPlaceholder() {
  const { c } = useTheme();
  const { state, actions } = useStore();
  if (!state.reportOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}
        onPress={actions.closeReport}
        accessibilityRole="button"
        accessibilityLabel={t('report.close')}
      />
      <View style={styles.wrap} pointerEvents="box-none">
        <Card style={styles.card}>
          <Text variant="title">{t('report.title')}</Text>
          <Text tone="ink2">{t('report.placeholder')}</Text>
          <Button label={t('common.close')} variant="ghost" onPress={actions.closeReport} />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end', padding: space.lg, paddingBottom: 120 },
  card: { borderRadius: radius.xl, padding: space.xl, gap: space.md },
});
