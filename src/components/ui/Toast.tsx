import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View, type ViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { dur, ease, native } from '@/theme/motion';
import { elevation } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Emoji, Text } from './Text';

type ToastItem = { id: number; message: string; emoji?: string };
type ToastApi = { show: (message: string, options?: { emoji?: string }) => void };

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Screens with a tall header (Business) register the header's bottom edge, so toasts show
 * below it instead of over the title. The newest mounted anchor wins; none means the default.
 */
type AnchorApi = { set: (id: number, top: number | null) => void };
const AnchorContext = createContext<AnchorApi | null>(null);
let anchorIds = 0;

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

  const anchors = useRef(new Map<number, number>());
  const [anchorTop, setAnchorTop] = useState<number | null>(null);
  const anchorApi = useMemo<AnchorApi>(
    () => ({
      set: (id, top) => {
        if (top === null) anchors.current.delete(id);
        else anchors.current.set(id, top);
        const values = [...anchors.current.values()];
        setAnchorTop(values.length ? values[values.length - 1] : null);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={api}>
      <AnchorContext.Provider value={anchorApi}>
        {children}
        {queue[0] ? <ToastView key={queue[0].id} item={queue[0]} onDone={done} top={anchorTop} /> : null}
      </AnchorContext.Provider>
    </ToastContext.Provider>
  );
}

function ToastView({ item, onDone, top }: { item: ToastItem; onDone: () => void; top: number | null }) {
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
    <View pointerEvents="none" style={[styles.host, { top: top ?? insets.top + 64 }]}>
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

/**
 * Keep toasts below this screen's header: pass the header view's ref, put the returned
 * handler on its onLayout. Measures the header's bottom in the window; clears on unmount.
 */
export function useToastAnchor(ref: RefObject<ViewInstance | null>) {
  const api = useContext(AnchorContext);
  const [id] = useState(() => ++anchorIds);
  useEffect(() => () => api?.set(id, null), [api, id]);
  return useCallback(() => {
    ref.current?.measureInWindow((_x, y, _w, h) => {
      if (h > 0) api?.set(id, Math.round(y + h + 8));
    });
  }, [api, id, ref]);
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
