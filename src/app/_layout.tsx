import { Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { AnimatedSplash } from '@/components/animated-splash';
import { brand } from '@/constants/brand';
import { useLiveUpdates } from '@/hooks/use-live-updates';

// Keep the native splash up until the animated splash is ready to take over.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useLiveUpdates();
  const [fontsLoaded, fontError] = useFonts({ Unbounded_800ExtraBold, Figtree_700Bold });
  const [splashDone, setSplashDone] = useState(false);

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hide();
  }, []);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: brand.night }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: brand.night } }} />
      {!splashDone && <AnimatedSplash onReady={hideNativeSplash} onDone={finishSplash} />}
    </View>
  );
}
