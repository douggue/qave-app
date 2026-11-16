import {
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
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
import { useHydrated } from '@/hooks/use-hydrated';
import { useLiveUpdates } from '@/hooks/use-live-updates';
import { getLocale } from '@/i18n';
import { StoreProvider } from '@/state/store';
import { useTheme } from '@/theme/use-theme';

// Keep the native splash up until the animated splash is ready to take over.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useLiveUpdates();
  // Web renders in RENDER_LOCALE until hydration; then the tree remounts once in the device
  // locale if it differs (strings are not reactive). Native keeps one key from the start.
  const hydrated = useHydrated();
  const localeKey = hydrated ? getLocale() : 'pre';
  const [fontsLoaded, fontError] = useFonts({
    Unbounded_800ExtraBold,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });
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
      <View key={localeKey === 'en-US' || localeKey === 'pre' ? 'app' : localeKey} style={{ flex: 1, backgroundColor: brand.night }}>
        <ThemedStatusBar />
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

/** Light status bar text at night, dark on the day paper. */
function ThemedStatusBar() {
  const { isNight } = useTheme();
  return <StatusBar style={isNight ? 'light' : 'dark'} />;
}
