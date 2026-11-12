import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t, type StringKey } from '@/i18n';
import { dur, ease, native, spring } from '@/theme/motion';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// Three-snap sheet (02-ui-screens-motion.md section 5). It moves with translateY on the
// native driver. The handle is a drag area and also an accessible adjustable control.

export type Snap = 'peek' | 'half' | 'full';
export const SNAPS: Snap[] = ['peek', 'half', 'full'];
const SNAP_KEY: Record<Snap, StringKey> = { peek: 'sheet.peek', half: 'sheet.half', full: 'sheet.full' };
const PEEK = 156;

type SheetConfig = {
  snap: Snap;
  offsets: Record<Snap, number>;
  reduceMotion: boolean;
  onSnapChange: (snap: Snap) => void;
};

/** Position and drag handling. A plain object so the handlers always read the latest config. */
class SheetGesture {
  readonly y = new Animated.Value(2000);
  private cfg: SheetConfig = { snap: 'peek', offsets: { peek: 0, half: 0, full: 0 }, reduceMotion: false, onSnapChange: () => {} };
  private start = 0;

  readonly pan = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderGrant: () => {
      this.y.stopAnimation();
      this.start = this.cfg.offsets[this.cfg.snap];
    },
    onPanResponderMove: (_e, g) => {
      const { peek } = this.cfg.offsets;
      let next = this.start + g.dy;
      if (next < 0) next *= 0.3;
      if (next > peek) next = peek + (next - peek) * 0.3;
      this.y.setValue(next);
    },
    onPanResponderRelease: (_e, g) => {
      const { offsets: o, snap: current } = this.cfg;
      let target: Snap;
      if (Math.abs(g.vy) > 1.2) {
        const i = SNAPS.indexOf(current) + (g.vy < 0 ? 1 : -1);
        target = SNAPS[Math.min(SNAPS.length - 1, Math.max(0, i))];
      } else {
        const projected = this.start + g.dy + g.vy * 140;
        target = SNAPS.reduce((best, s) => (Math.abs(o[s] - projected) < Math.abs(o[best] - projected) ? s : best));
      }
      if (target === current) this.animateTo(target, g.vy);
      else this.cfg.onSnapChange(target);
    },
    onPanResponderTerminate: () => this.animateTo(this.cfg.snap),
  });

  configure(cfg: SheetConfig) {
    this.cfg = cfg;
  }

  animateTo(target: Snap, velocity = 0) {
    const toValue = this.cfg.offsets[target];
    const anim = this.cfg.reduceMotion
      ? Animated.timing(this.y, { toValue, duration: dur.fast, easing: ease.soft, useNativeDriver: native })
      : Animated.spring(this.y, { toValue, ...spring.sheet, velocity, useNativeDriver: native });
    anim.start();
  }
}

type Props = {
  snap: Snap;
  onSnapChange: (snap: Snap) => void;
  /** Drawn under the handle; dragging it moves the sheet too. */
  header?: ReactNode;
  children: ReactNode;
  /** Changes whenever the content swaps, to scroll back to the top. */
  contentKey?: string;
};

export function BottomSheet({ snap, onSnapChange, header, children, contentKey }: Props) {
  const { c, isNight } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [areaH, setAreaH] = useState(0);
  const [sheet] = useState(() => new SheetGesture());
  const scrollRef = useRef<ScrollViewInstance>(null);

  const full = Math.max(PEEK + 40, areaH - insets.top - 56);
  const offsets = useMemo<Record<Snap, number>>(
    () => ({
      full: 0,
      half: Math.max(0, full - Math.min(full, Math.round(areaH * 0.5))),
      peek: Math.max(0, full - PEEK),
    }),
    [areaH, full],
  );

  useLayoutEffect(() => {
    sheet.configure({ snap, offsets, reduceMotion, onSnapChange });
  });

  useEffect(() => {
    if (areaH) sheet.animateTo(snap);
  }, [sheet, snap, areaH, offsets]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [contentKey]);

  const step = (dir: 1 | -1) => {
    const i = SNAPS.indexOf(snap) + dir;
    if (i >= 0 && i < SNAPS.length) onSnapChange(SNAPS[i]);
  };
  const cycle = () => onSnapChange(SNAPS[(SNAPS.indexOf(snap) + 1) % SNAPS.length]);

  const onAreaLayout = (e: LayoutChangeEvent) => setAreaH(e.nativeEvent.layout.height);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" onLayout={onAreaLayout}>
      {areaH ? (
        <Animated.View
          style={[
            styles.sheet,
            { height: full, backgroundColor: c.paper, borderColor: c.line, transform: [{ translateY: sheet.y }] },
          ]}
        >
          <View {...sheet.pan.panHandlers} style={Platform.OS === 'web' ? webNoScroll : undefined}>
            <Pressable
              onPress={cycle}
              accessibilityRole="adjustable"
              accessibilityLabel={t('sheet.handle', { state: t(SNAP_KEY[snap]) })}
              accessibilityHint={t('sheet.handleHint')}
              accessibilityValue={{ text: t(SNAP_KEY[snap]) }}
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
              hitSlop={{ top: 8, bottom: 8 }}
              style={styles.handleZone}
            >
              <View style={[styles.grabber, { backgroundColor: isNight ? 'rgba(255,255,255,0.18)' : 'rgba(22,23,43,0.18)' }]} />
            </Pressable>
            {header}
          </View>
          <ScrollView
            ref={scrollRef}
            scrollEnabled={snap === 'full'}
            contentContainerStyle={[styles.body, { paddingBottom: 24 + offsets[snap] }]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      ) : null}
    </View>
  );
}

const webNoScroll = { touchAction: 'none' } as unknown as object;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  handleZone: { alignItems: 'center', justifyContent: 'center', minHeight: 28, paddingTop: 10, paddingBottom: 6 },
  grabber: { width: 42, height: 5, borderRadius: 3 },
  body: { paddingHorizontal: 16, gap: 14 },
});
