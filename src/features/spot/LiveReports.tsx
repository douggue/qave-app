import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Emoji, Text, useToast } from '@/components/ui';
import { reportAgo } from '@/data/format';
import { getPeople } from '@/data/repo';
import type { Report, Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { useAllReports } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP } from '@/state/rep';
import { useStore } from '@/state/store';
import { avatar, avatarBg, report as reportEmoji, ui } from '@/theme/emoji';
import { dur, ease, native } from '@/theme/motion';
import { hitSlop, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// Live reports with "Still true" / "Not anymore" votes kept in the store (03 spec 5).

function who(report: Report, spot: Spot) {
  if (report.by === 'you') return { name: t('spot.byYou'), icon: avatar.me, bg: avatarBg.me };
  if (report.by === 'owner') return { name: spot.owner ?? spot.name, icon: ui.owner, bg: '#ffe7b0' };
  const person = getPeople()[report.by];
  return person
    ? { name: person.handle, icon: avatar[person.avatar], bg: person.tint }
    : { name: '', icon: avatar.me, bg: avatarBg.me };
}

function VotePill({
  icon,
  count,
  selected,
  label,
  onPress,
}: {
  icon: string;
  count?: number;
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.vote,
        { backgroundColor: selected ? c.neon : c.card2, borderColor: c.line },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Emoji size={16}>{icon}</Emoji>
      {count !== undefined ? (
        <Text variant="label" tabular style={{ color: selected ? c.onNeon : c.ink }}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

function ReportRow({ report, spot, now }: { report: Report; spot: Spot; now: number }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const reduceMotion = useReduceMotion();
  const mine = state.votes[report.id];
  const up = report.votes + (mine === 1 ? 1 : 0);
  const person = who(report, spot);
  const fresh = report.by === 'you' && !!report.createdAt && now - report.createdAt < 60_000;
  const [fade] = useState(() => new Animated.Value(fresh && !reduceMotion ? 0 : 1));

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: native }).start();
  }, [fade]);

  const vote = (value: 1 | -1) => {
    const first = !state.voted[report.id];
    actions.vote(report.id, value, REP.vote);
    if (first) toast.show(t('toast.voteThanks', { rep: REP.vote }), { emoji: ui.check });
  };

  return (
    <Animated.View style={[styles.row, { opacity: fade }]}>
      <View style={[styles.avatar, { backgroundColor: person.bg }]}>
        <Emoji size={20}>{person.icon}</Emoji>
      </View>
      <View style={styles.body}>
        <View style={styles.line}>
          <Emoji size={14}>{reportEmoji[report.type]}</Emoji>
          <Text variant="ui" style={styles.shrink}>
            {report.text}
          </Text>
        </View>
        <Text variant="caption" tone="ink2">
          {t('spot.reportBy', { who: person.name, when: reportAgo(report, now, getAppStart()) })}
        </Text>
      </View>
      <View style={styles.votes}>
        <VotePill
          icon={ui.thumbUp}
          count={up}
          selected={mine === 1}
          label={t('vote.upA11y', { n: up })}
          onPress={() => vote(1)}
        />
        <VotePill icon={ui.thumbDown} selected={mine === -1} label={t('vote.down')} onPress={() => vote(-1)} />
      </View>
    </Animated.View>
  );
}

export function LiveReports({ spot, onReport }: { spot: Spot; onReport: () => void }) {
  const now = useClock(30_000);
  const reports = useAllReports().filter((r) => r.spotId === spot.id);
  return (
    <Card>
      <Text variant="cardTitle" accessibilityRole="header">
        {t('spot.reports')}
      </Text>
      {reports.length ? (
        reports.map((r) => <ReportRow key={r.id} report={r} spot={spot} now={now} />)
      ) : (
        <View style={styles.empty}>
          <Text variant="caption" tone="ink2">
            {t('spot.noReports')}
          </Text>
          <Button
            size="sm"
            variant="ghost"
            fullWidth={false}
            label={t('act.report')}
            accessibilityLabel={t('act.reportA11y', { name: spot.name })}
            onPress={onReport}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md, paddingVertical: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { flexGrow: 1, flexShrink: 1, flexBasis: 140, gap: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  votes: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  vote: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 10,
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  empty: { gap: space.sm, alignItems: 'flex-start' },
});
