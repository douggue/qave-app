import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Chip, Emoji, Screen, Text, useToast } from '@/components/ui';
import { t } from '@/i18n';
import { levelFor } from '@/state/rep';
import { totalCheckIns, useStore, type ThemeMode } from '@/state/store';
import { avatar, avatarBg, ui } from '@/theme/emoji';
import { minTap, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const MODES: { mode: ThemeMode; label: 'theme.auto' | 'theme.night' | 'theme.day' }[] = [
  { mode: 'auto', label: 'theme.auto' },
  { mode: 'night', label: 'theme.night' },
  { mode: 'day', label: 'theme.day' },
];

// You tab. Quiet rep, check-ins, theme control. Business switch is wired in C5.
export default function YouScreen() {
  const { c } = useTheme();
  const toast = useToast();
  const { state, actions } = useStore();
  const { level, next } = levelFor(state.rep);
  const levelName = t(level.key);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarBg.me }]}>
          <Emoji size={40}>{avatar.me}</Emoji>
        </View>
        <View style={styles.headerText}>
          <Text variant="title" accessibilityRole="header">
            {t('you.handle')}
          </Text>
          <Text tone="neon" tabular>
            {t('you.rep', { level: levelName, rep: state.rep })}
          </Text>
          <Text variant="caption" tone="ink2">
            {next ? t('you.toNext', { n: next.min - state.rep, level: t(next.key) }) : t('you.maxLevel')}
          </Text>
        </View>
      </View>

      <Card>
        <Text tone="ink2">{t('you.repHow')}</Text>
        <View style={styles.stat}>
          <Text variant="title" tabular>
            {totalCheckIns(state)}
          </Text>
          <Text variant="label" tone="ink2">
            {t('you.checkIns')}
          </Text>
        </View>
      </Card>

      <Card>
        <Text variant="heading" accessibilityRole="header">
          {t('you.theme')}
        </Text>
        <View style={styles.chips}>
          {MODES.map(({ mode, label }) => (
            <Chip
              key={mode}
              label={t(label)}
              selected={state.themeMode === mode}
              onPress={() => actions.setThemeMode(mode)}
              accessibilityLabel={t('theme.a11y', { mode: t(label) })}
            />
          ))}
        </View>
        <Text variant="caption" tone="ink2">
          {t('theme.autoNote')}
        </Text>
      </Card>

      <Pressable
        onPress={() => toast.show(t('toast.bizSoon'))}
        accessibilityRole="button"
        accessibilityLabel={t('you.toBiz')}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: c.card, borderColor: c.line },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Emoji size={24}>{ui.store}</Emoji>
        <View style={styles.rowText}>
          <Text variant="ui">{t('you.toBiz')}</Text>
          <Text variant="caption" tone="ink2">
            {t('you.toBizSub')}
          </Text>
        </View>
        <Text variant="heading" tone="ink2">
          {ui.chevron}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingTop: space.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  stat: { gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: minTap + 20,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  rowText: { flex: 1, gap: 2 },
});
