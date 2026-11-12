import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { dur, ease, native } from '@/theme/motion';
import { elevation } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Emoji, Text } from './Text';

type ToastItem = { id: number; message: string; emoji?: string };
type ToastApi = { show: (message: string, options?: { emoji?: string }) => void };

const ToastContext = createContext<ToastApi | null>(null);

/** How long a toast stays: longer messages stay a little longer. */
const holdFor = (message: string) => Math.min(5000, 2600 + Math.max(0, message.length - 40) * 40);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback<ToastApi['show']>((message, options) => {
    const item = { id: nextId.current++, message, emoji: options?.emoji };
    setQueue((q) => [...q, item]);
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  const done = useCallback(() => setQueue((q) => q.slice(1)), []);
  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {queue[0] ? <ToastView key={queue[0].id} item={queue[0]} onDone={done} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: native }),
      Animated.delay(holdFor(item.message)),
      Animated.timing(anim, { toValue: 0, duration: dur.fast, easing: ease.in, useNativeDriver: native }),
    ]);
    seq.start(({ finished }) => finished && onDone());
    return () => seq.stop();
  }, [anim, item.message, onDone]);

  const translateY = reduceMotion ? 0 : anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + 64 }]}>
      <Animated.View
        accessibilityLiveRegion={Platform.OS === 'android' ? 'polite' : undefined}
        style={[
          styles.toast,
          elevation.e2,
          { backgroundColor: c.toastBg, opacity: anim, transform: [{ translateY }] },
        ]}
      >
        {item.emoji ? <Emoji size={18}>{item.emoji}</Emoji> : null}
        <Text variant="ui" tone="toastInk" center style={styles.text}>
          {item.message}
        </Text>
      </Animated.View>
    </View>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside ToastProvider');
  return api;
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 50 },
  toast: {
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  text: { flexShrink: 1 },
});
