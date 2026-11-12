import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FoodArt } from '@/components/cards/FoodArt';
import { Button, Placeholder, Screen, Text } from '@/components/ui';
import { getSpot } from '@/data/repo';
import { t } from '@/i18n';
import { ui } from '@/theme/emoji';
import { space } from '@/theme/tokens';

// Spot page. A minimal stand-in so "Open" works from the map; the full page lands in C3.
export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = id ? getSpot(id) : undefined;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen scroll>
      <Button label={t('common.back')} icon={ui.back} variant="ghost" size="sm" fullWidth={false} onPress={back} />
      {spot ? (
        <View style={styles.head}>
          <FoodArt food={spot.food} width="100%" height={180} emojiSize={88} />
          <Text variant="display" accessibilityRole="header">
            {spot.name}
          </Text>
          <Placeholder emoji={ui.construction} title={t('common.comingNext')} body={t('spot.loading')} />
        </View>
      ) : (
        <Placeholder emoji={ui.construction} title={t('spot.notFound')} body={t('common.comingNext')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space.lg },
});
