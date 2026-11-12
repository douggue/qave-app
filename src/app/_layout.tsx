import { Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { AnimatedSplash } from '@/components/animated-splash';
import { FxHost } from '@/components/celebrate/FxHost';
import { ReportRadial } from '@/components/report/ReportRadial';
import { ToastProvider } from '@/components/ui';
import { brand } from '@/constants/brand';
import { useLiveUpdates } from '@/hooks/use-live-updates';
import { StoreProvider } from '@/state/store';

// Keep the native splash up until the animated splash is ready to take over.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useLiveUpdates();
  const [fontsLoaded, fontError] = useFonts({ Unbounded_800ExtraBold, Figtree_700Bold });
  const [splashDone, setSplashDone] = useState(false);
  // Never hold the app back for fonts: after 1.5 s, start with the fallback font.
  const [fontWaitOver, setFontWaitOver] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontWaitOver(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hide();
  }, []);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  if (!fontsLoaded && !fontError && !fontWaitOver) {
    return null;
  }

  return (
    <StoreProvider>
      <View style={{ flex: 1, backgroundColor: brand.night }}>
        <StatusBar style="light" />
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: brand.night } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="spot/[id]" />
          </Stack>
          {/* Overlays above every screen, below the toast: the Report radial and celebrations. */}
          <ReportRadial />
          <FxHost />
        </ToastProvider>
        {!splashDone && <AnimatedSplash onReady={hideNativeSplash} onDone={finishSplash} />}
      </View>
    </StoreProvider>
  );
}
