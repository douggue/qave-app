import { StyleSheet, View } from 'react-native';

import { Button, Glyph, Skeleton, Text, useToast } from '@/components/ui';
import { useHydrated } from '@/hooks/use-hydrated';
import { closingLeft, closingText, freshness } from '@/data/format';
import type { Spot } from '@/data/types';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useAllReports } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP, STILL_HERE_COOLDOWN_MS } from '@/state/rep';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { statusGlyph } from '@/theme/glyphs';
import { useTheme } from '@/theme/use-theme';

/**
 * "Closes in 25 min" under the status line (idea B), only for closing-soon spots.
 * An amber caption; the alarm icon is decorative. Waits for hydration on web.
 */
export function ClosingSoon({ spot }: { spot: Spot }) {
  const now = useClock(60_000);
  const hydrated = useHydrated();
  if (!hydrated) return spot.open && spot.closesInMin !== undefined ? <Skeleton height={16} width={120} /> : null;
  const left = closingLeft(spot, now, getAppStart());
  if (left === null) return null;
  return (
    <View style={styles.closing}>
      <Glyph of={statusGlyph.closingSoon} size={13} />
      <Text variant="caption" tone="amber" style={styles.shrink}>
        {closingText(left)}
      </Text>
    </View>
  );
}

/** The live "Still there?" label (idea A). Minutes update from the shared clock. */
export function FreshnessLabel({ spotId }: { spotId: string }) {
  const now = useClock(30_000);
  const reports = useAllReports();
  const { stillHere } = useStore().state;
  const f = freshness(spotId, reports, stillHere[spotId], now, getAppStart());
  return (
    <Text variant="label" tone={f.tone}>
      {f.label}
    </Text>
  );
}

/**
 * "12 confirmed tonight": every "Still true" on the spot's reports (sample counts plus yours)
 * and your own "Yep, still here". Hidden at 0.
 */
function ConfirmedTonight({ spotId }: { spotId: string }) {
  const { votes, stillHere } = useStore().state;
  const reports = useAllReports();
  let n = stillHere[spotId] ? 1 : 0;
  for (const r of reports) if (r.spotId === spotId) n += r.votes + (votes[r.id] === 1 ? 1 : 0);
  const { c } = useTheme();
  if (!n) return null;
  return (
    <View style={styles.closing}>
      <Glyph of={ui.check} size={12} color={c.mint} />
      <Text variant="caption" tone="ink2" style={styles.shrink}>
        {n === 1 ? t('fresh.confirmedTonight1') : t('fresh.confirmedTonight', { n })}
      </Text>
    </View>
  );
}

/** Freshness plus the one-tap "Yep, still here" confirmation (+2 rep, then a cooldown). */
export function StillThere({ spot }: { spot: Spot }) {
  const now = useClock(30_000);
  const { state, actions } = useStore();
  const toast = useToast();
  const last = state.stillHere[spot.id];
  const cooling = !!last && now - last < STILL_HERE_COOLDOWN_MS;

  const confirm = () => {
    actions.confirmStillHere(spot.id, REP.stillHere);
    toast.show(t('rep.plus', { n: REP.stillHere }), { emoji: ui.check });
  };

  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <FreshnessLabel spotId={spot.id} />
        <ConfirmedTonight spotId={spot.id} />
      </View>
      {spot.open ? (
        <Button
          size="sm"
          variant="soft"
          fullWidth={false}
          icon={cooling ? ui.check : undefined}
          label={cooling ? t('fresh.thanks') : t('fresh.yep')}
          accessibilityLabel={cooling ? t('fresh.thanks') : t('fresh.yepA11y', { name: spot.name })}
          disabled={cooling}
          onPress={confirm}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  label: { flexGrow: 1, flexShrink: 1, flexBasis: 160, gap: 2 },
  closing: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
});
