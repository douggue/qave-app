import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Glyph, Text, useToast } from '@/components/ui';
import { reportAgo } from '@/data/format';
import { getPeople } from '@/data/repo';
import type { Report, Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { useAllReports } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP } from '@/state/rep';
import { useStore } from '@/state/store';
import { avatar, avatarBg, ui } from '@/theme/emoji';
import { reportGlyph } from '@/theme/glyphs';
import { dur, ease, native } from '@/theme/motion';
import { hitSlop, palettes, radius, space } from '@/theme/tokens';
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

/**
 * A Waze-style report card: mood badge, what was reported, when and by whom, a "Still true"
 * confirm with its count, and a small "Not anymore" link. One vote per person per report.
 */
function ReportCard({ report, spot, now }: { report: Report; spot: Spot; now: number }) {
  const { c } = useTheme();
  const { state, actions } = useStore();
  const toast = useToast();
  const reduceMotion = useReduceMotion();
  const mine = state.votes[report.id];
  const count = report.votes + (mine === 1 ? 1 : 0);
  const person = who(report, spot);
  const fresh = report.by === 'you' && !!report.createdAt && now - report.createdAt < 60_000;
  const [fade] = useState(() => new Animated.Value(fresh && !reduceMotion ? 0 : 1));
  const meta = t('report.by', { when: reportAgo(report, now, getAppStart()), who: person.name });

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: native }).start();
  }, [fade]);

  const vote = (value: 1 | -1) => {
    if (mine === value) return;
    const first = !state.voted[report.id];
    actions.vote(report.id, value, REP.vote);
    // Only the first vote on a report earns rep; switching it later just says thanks.
    if (!first) toast.show(t('fresh.thanks'), { emoji: ui.check });
    else if (value === 1) toast.show(t('toast.voteThanks', { rep: REP.vote }), { emoji: ui.check });
    else toast.show(t('toast.notAnymore', { rep: REP.vote }), { emoji: ui.check });
  };

  const confirmed = mine === 1;
  const denied = mine === -1;

  return (
    <Animated.View style={[styles.card, { backgroundColor: c.card2, borderColor: c.line, opacity: fade }]}>
      <View style={styles.top} accessible accessibilityLabel={t('report.cardA11y', { text: report.text, meta })}>
        <View style={[styles.badge, { backgroundColor: c.card, borderColor: c.line }]}>
          <Glyph of={reportGlyph[report.type]} size={21} />
        </View>
        <View style={styles.body}>
          <Text variant="ui">{report.text}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.avatar, { backgroundColor: person.bg }]}>
              <Glyph of={person.icon} size={11} color={palettes.day.ink} />
            </View>
            <Text variant="caption" tone="ink2" style={styles.shrink}>
              {meta}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => vote(1)}
          disabled={confirmed}
          accessibilityRole="button"
          accessibilityLabel={t(confirmed ? 'report.confirmedA11y' : 'report.confirmA11y', { n: count })}
          accessibilityState={{ selected: confirmed, disabled: confirmed }}
          style={({ pressed }) => [
            styles.confirm,
            confirmed
              ? { backgroundColor: c.tintMint, borderColor: c.mint }
              : { backgroundColor: c.mintFill, borderColor: 'transparent' },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Glyph of={confirmed ? ui.check : ui.thumbUp} size={14} color={confirmed ? c.mint : c.onMint} strokeWidth={2.5} />
          <Text variant="label" tabular tone={confirmed ? 'mint' : 'onMint'} style={styles.shrink}>
            {t(confirmed ? 'report.confirmed' : 'report.confirm', { n: count })}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => vote(-1)}
          disabled={denied}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={denied ? t('report.markedNot') : t('report.notAnymoreA11y')}
          accessibilityState={{ selected: denied, disabled: denied }}
          style={({ pressed }) => [styles.not, pressed && { opacity: 0.7 }]}
        >
          <Text variant="label" tone="ink2" style={[styles.shrink, !denied && styles.underline]}>
            {denied ? t('report.markedNot') : t('report.notAnymore')}
          </Text>
        </Pressable>
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
        reports.map((r) => <ReportCard key={r.id} report={r} spot={spot} now={now} />)
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
  underline: { textDecorationLine: 'underline' },
  card: { borderWidth: 1, borderRadius: radius.md, padding: space.md, gap: space.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.md, rowGap: space.xs },
  confirm: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  not: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  empty: { gap: space.sm, alignItems: 'flex-start' },
});
