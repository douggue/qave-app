import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useLiveUpdates } from '@/hooks/use-live-updates';

export default function RootLayout() {
  useLiveUpdates();

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
