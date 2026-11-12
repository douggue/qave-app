import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { EmojiFloat } from '@/components/celebrate/EmojiFloat';
import { LokalMap, ZOOMS, type HitTarget, type LokalMapHandle, type Region } from '@/components/map/LokalMap';
import { SpotPin } from '@/components/map/SpotPin';
import { BottomSheet, PEEK, type Snap } from '@/components/sheet/BottomSheet';
import { useToast } from '@/components/ui';
import { milesFromMe } from '@/data/format';
import type { Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { matchesFilter, useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { report as reportEmoji, ui } from '@/theme/emoji';
import { ease, native } from '@/theme/motion';
import { withAlpha } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, MapTopBar } from '@/features/map/MapOverlay';
import { SheetExplore, SheetHeader, SheetPreview } from '@/features/map/SheetContent';


/** Two shared bob loops for all pins (02 spec 7.1), paused off-screen and under reduce motion. */
function useBobLoops() {
  const reduceMotion = useReduceMotion();
  const [a] = useState(() => new Animated.Value(0));
  const [b] = useState(() => new Animated.Value(0));
  useFocusEffect(
    useCallback(() => {
      if (reduceMotion) {
        a.setValue(0);
        b.setValue(0);
        return;
      }
      const loop = (v: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(v, { toValue: 1, duration: 1200, easing: ease.soft, useNativeDriver: native }),
            Animated.timing(v, { toValue: 0, duration: 1200, easing: ease.soft, useNativeDriver: native }),
          ]),
        );
      const la = loop(a, 0);
      const lb = loop(b, 600);
      la.start();
      lb.start();
      return () => {
        la.stop();
        lb.stop();
      };
    }, [a, b, reduceMotion]),
  );
  return [a, b] as const;
}

export default function MapScreen() {
  const mapRef = useRef<LokalMapHandle>(null);
  const toast = useToast();
  const { c, isNight } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, actions } = useStore();
  const spots = useSpots();
  const bobs = useBobLoops();
  const [snap, setSnap] = useState<Snap>('peek');
  const [height, setHeight] = useState(0);
  // The top bar's measured height, so the camera centers inside the visible band.
  const [topInset, setTopInset] = useState(0);
  const topEstimate = topInset || insets.top + 174;
  // Positive shifts a target up: half the difference between what covers the bottom (sheet peek;
  // the tab bar takes its own layout space) and what covers the top.
  const bandOffset = Math.round((PEEK - topEstimate) / 2);

  const selected = state.selectedSpot ? spots.find((s) => s.id === state.selectedSpot) ?? null : null;
  // Keep the pin above the half-open sheet.
  const focusOffset = Math.round(height * 0.2);

  const focus = useCallback(
    (spot: Spot) => {
      actions.selectSpot(spot.id);
      setSnap((s) => (s === 'peek' ? 'half' : s));
      mapRef.current?.animateTo(spot.x, spot.y, undefined, focusOffset);
    },
    [actions, focusOffset],
  );

  // Focus requests from elsewhere (Ask "Show on map", inbox) arrive through selectedSpot.
  const lastFocused = useRef<string | null>(null);
  const lastSeq = useRef(state.focusSeq);
  const focusSeq = state.focusSeq;
  useEffect(() => {
    if (focusSeq !== lastSeq.current) {
      lastSeq.current = focusSeq;
      lastFocused.current = null;
    }
    if (!height || !selected || lastFocused.current === selected.id) return;
    lastFocused.current = selected.id;
    mapRef.current?.animateTo(selected.x, selected.y, undefined, focusOffset);
    setSnap((s) => (s === 'peek' ? 'half' : s));
  }, [selected, height, focusOffset, focusSeq]);

  const close = useCallback(() => {
    lastFocused.current = null;
    actions.selectSpot(null);
    setSnap('peek');
  }, [actions]);

  const onPin = useCallback(
    (spot: Spot) => {
      lastFocused.current = spot.id;
      focus(spot);
    },
    [focus],
  );
  const onHitPin = useCallback(
    (pin: HitTarget) => {
      const spot = spots.find((s) => s.id === pin.id);
      if (spot) onPin(spot);
    },
    [spots, onPin],
  );

  // Open zoomed out on the middle of the spot cluster, centered in the band between the
  // top bar and the sheet. Computed once: the map keeps its own camera after that.
  const [initialRegion] = useState<Region>(() => {
    const cx = spots.reduce((sum, s) => sum + s.x, 0) / Math.max(1, spots.length);
    const cy = spots.reduce((sum, s) => sum + s.y, 0) / Math.max(1, spots.length);
    const zoom = ZOOMS[0];
    return { x: cx, y: cy + bandOffset / zoom, zoom };
  });

  // Stretch: Surprise me picks an open, highly rated spot you have not checked in at yet.
  const surprise = () => {
    const pool = spots.filter((s) => s.open && s.rating >= 4.6 && !state.checkIns[s.id] && s.id !== state.selectedSpot);
    if (pool.length === 0) {
      toast.show(t('toast.surpriseNone'), { emoji: ui.dice });
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onPin(pick);
    AccessibilityInfo.announceForAccessibility(t('toast.surprise', { name: pick.name }));
  };

  const toggleTheme = () => {
    actions.setThemeMode(isNight ? 'day' : 'night');
    toast.show(t(isNight ? 'map.themeDay' : 'map.themeNight'), { emoji: isNight ? ui.sun : ui.moon });
  };

  // A fresh report rises from its pin as a short emoji float (02 spec 7.8).
  const fx = state.fx;
  const floatSpot = fx?.kind === 'report' && fx.report ? spots.find((s) => s.id === fx.spotId) : undefined;

  // Nearest first. The selected pin has zIndex 2000, so it still draws on top.
  const ordered = useMemo(() => [...spots].sort((a, b) => milesFromMe(a) - milesFromMe(b)), [spots]);

  return (
    <View style={styles.screen} onLayout={(e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height)}>
      <LokalMap ref={mapRef} region={initialRegion} pins={spots} onPin={onHitPin} onMapPress={close}>
        {ordered.map((spot, i) => (
          <SpotPin
            key={spot.id}
            spot={spot}
            selected={spot.id === state.selectedSpot}
            dimmed={!matchesFilter(spot, state.filter)}
            bob={bobs[i % 2]}
            onPress={onPin}
          />
        ))}
        {fx && floatSpot && fx.report ? (
          <EmojiFloat key={fx.id} x={floatSpot.x} y={floatSpot.y} emoji={reportEmoji[fx.report]} />
        ) : null}
      </LokalMap>

      <View style={styles.overlay} pointerEvents="box-none">
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(c.paper, 0.92), withAlpha(c.paper, 0.6), 'transparent']}
          locations={[0, 0.55, 1]}
          style={[styles.scrim, { height: insets.top + 190 }]}
        />
        <MapTopBar onLayout={(e) => setTopInset(Math.round(e.nativeEvent.layout.height))} />
      </View>

      <View style={[styles.rail, { bottom: PEEK + 12 }]} pointerEvents="box-none">
        <IconButton
          icon={isNight ? ui.sun : ui.moon}
          label={t(isNight ? 'map.toDay' : 'map.toNight')}
          onPress={toggleTheme}
        />
        <IconButton icon={ui.dice} label={t('map.surprise')} onPress={surprise} />
        <IconButton icon={ui.plus} label={t('map.zoomIn')} onPress={() => mapRef.current?.zoomIn()} />
        <IconButton icon={ui.minus} label={t('map.zoomOut')} onPress={() => mapRef.current?.zoomOut()} />
        <IconButton icon={ui.recenter} label={t('map.recenter')} onPress={() => mapRef.current?.recenter(bandOffset)} />
      </View>

      <BottomSheet
        snap={snap}
        onSnapChange={setSnap}
        contentKey={selected?.id ?? 'explore'}
        header={selected ? null : <SheetHeader spots={spots} />}
      >
        {selected ? <SheetPreview spot={selected} onClose={close} /> : <SheetExplore spots={spots} onFocus={onPin} />}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  rail: { position: 'absolute', right: 12, gap: 8, zIndex: 3000 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3000 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0 },
});
