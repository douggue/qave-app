import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui';
import { BizHeader } from '@/features/business/BizHeader';
import { LiveCard } from '@/features/business/LiveCard';
import { StatsRow } from '@/features/business/StatsRow';
import { t } from '@/i18n';
import { space } from '@/theme/tokens';

// Business Today: go live, live statuses, and this week's numbers for the sample truck.
export default function TodayScreen() {
  return (
    <Screen scroll>
      <BizHeader caption={t('biz.caption.today')} />
      <View style={styles.body}>
        <LiveCard />
        <StatsRow />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.xl, marginTop: space.sm },
});
