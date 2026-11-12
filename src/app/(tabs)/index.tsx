import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { EmojiFloat } from '@/components/celebrate/EmojiFloat';
import { LokalMap, type LokalMapHandle } from '@/components/map/LokalMap';
import { SpotPin } from '@/components/map/SpotPin';
import { BottomSheet, type Snap } from '@/components/sheet/BottomSheet';
import { useToast } from '@/components/ui';
import type { Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { matchesFilter, useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { report as reportEmoji, ui } from '@/theme/emoji';
import { ease, native } from '@/theme/motion';
import { useTheme } from '@/theme/use-theme';
import { IconButton, MapTopBar } from '@/features/map/MapOverlay';
import { SheetExplore, SheetHeader, SheetPreview } from '@/features/map/SheetContent';

const PEEK = 156;

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
  const { isNight } = useTheme();
  const { state, actions } = useStore();
  const spots = useSpots();
  const bobs = useBobLoops();
  const [snap, setSnap] = useState<Snap>('peek');
  const [height, setHeight] = useState(0);

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
  useEffect(() => {
    if (!height || !selected || lastFocused.current === selected.id) return;
    lastFocused.current = selected.id;
    mapRef.current?.animateTo(selected.x, selected.y, undefined, focusOffset);
    setSnap((s) => (s === 'peek' ? 'half' : s));
  }, [selected, height, focusOffset]);

  const close = () => {
    lastFocused.current = null;
    actions.selectSpot(null);
    setSnap('peek');
  };

  const onPin = useCallback(
    (spot: Spot) => {
      lastFocused.current = spot.id;
      focus(spot);
    },
    [focus],
  );

  const toggleTheme = () => {
    actions.setThemeMode(isNight ? 'day' : 'night');
    toast.show(t(isNight ? 'map.themeDay' : 'map.themeNight'), { emoji: isNight ? ui.sun : ui.moon });
  };

  // A fresh report rises from its pin as a short emoji float (02 spec 7.8).
  const fx = state.fx;
  const floatSpot = fx?.kind === 'report' && fx.report ? spots.find((s) => s.id === fx.spotId) : undefined;

  // Selected pin last, so it draws on top.
  const ordered = [...spots].sort((x, y) => Number(x.id === state.selectedSpot) - Number(y.id === state.selectedSpot));

  return (
    <View style={styles.screen} onLayout={(e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height)}>
      <LokalMap ref={mapRef} region={{ x: 820, y: 700 + 140, zoom: 1 }}>
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

      <MapTopBar />

      <View style={[styles.rail, { bottom: PEEK + 12 }]} pointerEvents="box-none">
        <IconButton
          icon={isNight ? ui.sun : ui.moon}
          label={t(isNight ? 'map.toDay' : 'map.toNight')}
          onPress={toggleTheme}
        />
        <IconButton icon={ui.plus} label={t('map.zoomIn')} onPress={() => mapRef.current?.zoomIn()} />
        <IconButton icon={ui.minus} label={t('map.zoomOut')} onPress={() => mapRef.current?.zoomOut()} />
        <IconButton icon={ui.recenter} label={t('map.recenter')} onPress={() => mapRef.current?.recenter(focusOffset)} />
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
  rail: { position: 'absolute', right: 12, gap: 8 },
});
