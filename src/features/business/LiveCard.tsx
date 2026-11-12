import { useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Emoji, Text, useToast } from '@/components/ui';
import { formatClock, formatCountdown } from '@/data/format';
import { getBusiness, getStatuses } from '@/data/repo';
import type { LiveSession, LiveStatusId } from '@/data/types';
import { useClock } from '@/hooks/use-clock';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { status as statusEmoji, ui } from '@/theme/emoji';
import { glow, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { liveDuration, liveUntilText } from './format';

/** Today's main card: offline with Go live now, or live with timer, quick statuses and End service. */
export function LiveCard() {
  const { liveSession } = useStore().state;
  return liveSession ? <LiveState session={liveSession} /> : <OfflineState />;
}

function OfflineState() {
  const { c } = useTheme();
  const { actions } = useStore();
  const biz = getBusiness();
  const next = biz.stops.find((s) => s.id === biz.nextStop.stopId) ?? biz.stops[0];

  return (
    <Card>
      <View accessible accessibilityLabel={t('biz.offlineA11y')} style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: c.ink2 }]} />
        <Text variant="title" accessibilityRole="header">
          {t('biz.offline')}
        </Text>
      </View>
      <Text>{t('biz.nextStop', { place: next.name, time: formatClock(biz.nextStop.at) })}</Text>
      <Button
        variant="mint"
        icon={ui.pin}
        label={t('biz.goLiveNow')}
        accessibilityHint={t('biz.goLiveNowHint')}
        onPress={actions.openGoLive}
      />
    </Card>
  );
}

/** How long the second tap on End service stays armed. */
const ARM_MS = 4000;

function LiveState({ session }: { session: LiveSession }) {
  const { c, isNight } = useTheme();
  const toast = useToast();
  const { actions } = useStore();
  const now = useClock(1000);
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const biz = getBusiness();
  const stop = biz.stops.find((s) => s.id === session.stopId) ?? biz.stops[0];
  const elapsed = Math.max(0, now - session.startedAt);
  const duration = liveDuration(elapsed);
  const until = liveUntilText(session.until);
  const armed = armedAt !== null && now - armedAt < ARM_MS;

  const pickStatus = (id: LiveStatusId) => {
    const clearing = session.status === id;
    actions.setLiveStatus(id);
    const status = getStatuses().find((s) => s.id === id);
    if (clearing || !status) toast.show(t('biz.statusCleared'));
    else toast.show(t('biz.statusToast', { status: t(status.moodKey) }), { emoji: statusEmoji[status.emoji] });
  };

  const end = () => {
    if (!armed) {
      setArmedAt(Date.now());
      AccessibilityInfo.announceForAccessibility(t('biz.endServiceConfirm'));
      return;
    }
    setArmedAt(null);
    actions.endService();
    toast.show(t('biz.ended'));
  };

  return (
    <Card variant="live" style={[styles.liveCard, { borderColor: c.mint }]}>
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: c.mint }, isNight && glow(c.mint, 8, 0.9)]} />
        <Text variant="title" tone="mint" accessibilityRole="header" style={styles.grow}>
          {t('biz.live')}
        </Text>
        <Text
          variant="title"
          tabular
          accessibilityLabel={t('biz.liveTimerA11y', { duration })}
          accessibilityLiveRegion="none"
        >
          {formatCountdown(elapsed)}
        </Text>
      </View>
      <Text variant="ui" accessibilityLiveRegion="none">
        {t('biz.liveFor', { place: stop.name, duration, until })}
      </Text>

      <View style={styles.section}>
        <Text variant="ui" accessibilityRole="header">
          {t('biz.quickStatus')}
        </Text>
        <Text variant="caption" tone="ink2">
          {t('biz.quickStatusNote')}
        </Text>
      </View>
      <View style={styles.grid}>
        {getStatuses().map((s) => {
          const selected = session.status === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => pickStatus(s.id)}
              accessibilityRole="button"
              accessibilityLabel={t(s.labelKey)}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.status,
                { backgroundColor: selected ? c.neon : c.card2, borderColor: selected ? 'transparent' : c.line },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Emoji size={18}>{statusEmoji[s.emoji]}</Emoji>
              <Text variant="ui" tone={selected ? 'onNeon' : 'ink'} style={styles.grow}>
                {t(s.labelKey)}
              </Text>
              {selected ? (
                <Text variant="ui" tone="onNeon" accessibilityElementsHidden importantForAccessibility="no">
                  {ui.check}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.endGap} />
      <Button
        variant={armed ? 'soft' : 'ghost'}
        label={armed ? t('biz.endServiceConfirm') : t('biz.endService')}
        onPress={end}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  liveCard: { borderWidth: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  grow: { flex: 1 },
  section: { gap: 2, marginTop: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  status: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 56,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  endGap: { height: space.sm },
});
