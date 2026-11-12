import { StyleSheet, View } from 'react-native';

import { Button, Text, useToast } from '@/components/ui';
import { freshness } from '@/data/format';
import type { Spot } from '@/data/types';
import { APP_START, useClock } from '@/hooks/use-clock';
import { useAllReports } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { REP, STILL_HERE_COOLDOWN_MS } from '@/state/rep';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';

/** The live "Still there?" label (idea A). Minutes update from the shared clock. */
export function FreshnessLabel({ spotId }: { spotId: string }) {
  const now = useClock(30_000);
  const reports = useAllReports();
  const { stillHere } = useStore().state;
  const f = freshness(spotId, reports, stillHere[spotId], now, APP_START);
  return (
    <Text variant="label" tone={f.tone}>
      {f.label}
    </Text>
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
  label: { flexGrow: 1, flexShrink: 1, flexBasis: 160 },
});
