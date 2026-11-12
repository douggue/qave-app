import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Card, Chip, Emoji, Screen, Text, useToast } from '@/components/ui';
import { getBusiness } from '@/data/repo';
import { t, type StringKey } from '@/i18n';
import { levelFor } from '@/state/rep';
import { totalCheckIns, useStore, type ThemeMode } from '@/state/store';
import { avatar, avatarBg, ui } from '@/theme/emoji';
import { minTap, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const MODES: { mode: ThemeMode; label: StringKey }[] = [
  { mode: 'auto', label: 'theme.auto' },
  { mode: 'night', label: 'theme.night' },
  { mode: 'day', label: 'theme.day' },
];

// You tab: quiet rep and level, a few stats, the map look and the Business switch.
export default function YouScreen() {
  const { c } = useTheme();
  const toast = useToast();
  const { state, actions } = useStore();
  const { level, next } = levelFor(state.rep);
  const levelName = t(level.key);
  const progress = next ? (state.rep - level.min) / (next.min - level.min) : 1;
  const reportCount = state.reports.filter((r) => r.by === 'you').length;
  const confirmed = Object.keys(state.stillHere).length + Object.keys(state.voted).length;

  const stats: { label: StringKey; n: number }[] = [
    { label: 'you.checkIns', n: totalCheckIns(state) },
    { label: 'you.reports', n: reportCount },
    { label: 'you.confirmed', n: confirmed },
  ];

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('you.avatarA11y')}
          style={[styles.ring, { borderColor: c.sun, backgroundColor: c.paper }]}
        >
          <View style={[styles.avatar, { backgroundColor: avatarBg.me }]}>
            <Emoji size={44}>{avatar.me}</Emoji>
          </View>
        </View>
        <View style={styles.headerText}>
          <Text variant="title" accessibilityRole="header">
            {t('you.handle')}
          </Text>
          <Text variant="caption" tone="ink2">
            {t('you.city')}
          </Text>
          <View
            accessible
            accessibilityLabel={t('you.levelA11y', { level: levelName, rep: state.rep })}
            style={styles.badges}
          >
            <Badge tone="neon" icon={ui.sparkle} label={t('you.levelBadge', { level: levelName })} />
            <Badge tone="grape" label={t('you.repBadge', { rep: state.rep })} />
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        {stats.map(({ label, n }) => (
          <View
            key={label}
            accessible
            accessibilityLabel={t('you.statA11y', { label: t(label), n })}
            style={[styles.stat, { backgroundColor: c.card, borderColor: c.line }]}
          >
            <Text variant="title" tabular>
              {n}
            </Text>
            <Text variant="caption" tone="ink2">
              {t(label)}
            </Text>
          </View>
        ))}
      </View>

      <Card>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={next ? t('you.progressA11y', { n: next.min - state.rep, level: t(next.key) }) : t('you.maxLevel')}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          style={styles.progressWrap}
        >
          <Text variant="label" tone="ink2">
            {next ? t('you.toNext', { n: next.min - state.rep, level: t(next.key) }) : t('you.maxLevel')}
          </Text>
          <View style={[styles.track, { backgroundColor: c.card2 }]}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: c.sun }]} />
          </View>
        </View>
        <Text variant="caption" tone="ink2">
          {t('you.repHow')}
        </Text>
      </Card>

      <Card>
        <Text variant="heading" accessibilityRole="header">
          {t('you.theme')}
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel={t('theme.groupA11y')} style={styles.chips}>
          {MODES.map(({ mode, label }) => (
            <Chip
              key={mode}
              role="radio"
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
        onPress={() => {
          // The tab bar sees bizMode and lands on Today.
          actions.setBizMode(true);
          toast.show(t('biz.switchedIn'), { emoji: ui.store });
        }}
        accessibilityRole="button"
        accessibilityLabel={t('you.toBizA11y', { name: getBusiness().name })}
        accessibilityHint={t('you.toBizHint')}
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
            {getBusiness().name}
          </Text>
        </View>
        <Text variant="heading" tone="ink2" accessibilityElementsHidden importantForAccessibility="no">
          {ui.chevron}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingTop: space.sm },
  ring: { width: 98, height: 98, borderRadius: 49, borderWidth: 2, padding: 3 },
  avatar: { flex: 1, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: { flexGrow: 1, flexBasis: 96, borderWidth: 1, borderRadius: radius.lg, padding: space.md, gap: 2 },
  progressWrap: { gap: space.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
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
