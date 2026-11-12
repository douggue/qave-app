import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { getBusiness } from '@/data/repo';
import { getLocale, t, type StringKey } from '@/i18n';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const num = (n: number) => n.toLocaleString(getLocale());

/** This week's numbers and the demand nudge. Shown live or offline (owners check numbers before service). */
export function StatsRow() {
  const { c } = useTheme();
  const { stats, nudge } = getBusiness();
  const cards: { label: StringKey; value: string; delta?: number }[] = [
    { label: 'biz.stat.views', value: num(stats.views), delta: stats.viewsDelta },
    { label: 'biz.stat.checkIns', value: num(stats.checkIns), delta: stats.checkInsDelta },
    { label: 'biz.stat.followers', value: num(stats.followers), delta: stats.followersDelta },
    { label: 'biz.stat.rating', value: stats.rating.toLocaleString(getLocale(), { minimumFractionDigits: 1 }) },
  ];

  return (
    <View style={styles.wrap}>
      <Text variant="heading" accessibilityRole="header">
        {t('biz.stats')}
      </Text>
      <View style={styles.grid}>
        {cards.map(({ label, value, delta }) => (
          <View
            key={label}
            accessible
            accessibilityLabel={
              delta !== undefined
                ? t('biz.statA11y', { value, label: t(label), delta })
                : t('biz.statA11yPlain', { value, label: t(label) })
            }
            style={[styles.stat, { backgroundColor: c.card, borderColor: c.line }]}
          >
            <Text variant="title" tabular>
              {value}
            </Text>
            <Text variant="micro" tone="ink2">
              {t(label)}
            </Text>
            {delta !== undefined ? (
              <Text variant="caption" tone="mint">
                {t('biz.statDelta', { n: delta })}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
      <Card>
        <Text variant="ui" accessibilityRole="header">
          {t('biz.nudgeTitle')}
        </Text>
        <Text>{t('biz.nudge', { count: nudge.count, food: nudge.food, area: nudge.area })}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: { flexGrow: 1, flexBasis: '45%', borderWidth: 1, borderRadius: radius.lg, padding: space.md, gap: 2 },
});
