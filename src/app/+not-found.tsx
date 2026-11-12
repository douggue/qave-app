import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Placeholder, Screen } from '@/components/ui';
import { t } from '@/i18n';
import { food } from '@/theme/emoji';
import { screenPad, space } from '@/theme/tokens';

/** Unknown links land here: on brand, and one tap back to the map. */
export default function NotFound() {
  return (
    <Screen style={styles.center}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.inner}>
        <Placeholder emoji={food.taco} emojiSize={56} title={t('notFound.title')} body={t('notFound.body')} />
        <Button label={t('notFound.back')} variant="primary" fullWidth={false} onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: screenPad },
  inner: { alignItems: 'center', gap: space.lg },
});
