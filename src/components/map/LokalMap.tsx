import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Animated, PanResponder, Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ME, WORLD } from '@/data/repo';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { t } from '@/i18n';
import { dur, ease, native } from '@/theme/motion';
import { useTheme } from '@/theme/use-theme';

import { MapWorld } from './MapWorld';

// A small MapView-like component over the illustrated world. Keep this interface
// (region, onRegionChange, children as markers, ref.animateTo) so Mapbox can replace it.

/** The three zoom levels (buttons only tonight, no pinch). */
export const ZOOMS = [0.7, 1, 1.4] as const;

export type Region = { x: number; y: number; zoom: number };

export type LokalMapHandle = {
  /** Move the camera so world point (x, y) is centered, shifted up by `offsetY` screen points. */
  animateTo: (x: number, y: number, zoom?: number, offsetY?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  recenter: (offsetY?: number) => void;
};

type Props = {
  region?: Region;
  onRegionChange?: (region: Region) => void;
  /** Markers, positioned in world units (absolute left/top). */
  children?: ReactNode;
};

/** 1 / zoom, so markers can keep their screen size at every zoom level. */
const MapScaleContext = createContext<Animated.AnimatedDivision | null>(null);
export const useMapInverseScale = () => useContext(MapScaleContext);

const SLACK = 140;

/** Camera state and gestures. A plain object (not refs) so gesture handlers always see the latest values. */
class MapCamera {
  x: number;
  y: number;
  zoom: number;
  w = 0;
  h = 0;
  reduceMotion = false;
  onChange?: (region: Region) => void;
  readonly cx: Animated.Value;
  readonly cy: Animated.Value;
  readonly scale: Animated.Value;
  readonly inverse: Animated.AnimatedDivision;
  readonly pan: ReturnType<typeof PanResponder.create>;
  private start = { x: 0, y: 0 };

  constructor(region: Region) {
    this.x = region.x;
    this.y = region.y;
    this.zoom = region.zoom;
    this.cx = new Animated.Value(region.x);
    this.cy = new Animated.Value(region.y);
    this.scale = new Animated.Value(region.zoom);
    this.inverse = Animated.divide(1, this.scale);
    this.pan = PanResponder.create({
      // Capture only real drags, so taps still reach the pins.
      onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        this.cx.stopAnimation();
        this.cy.stopAnimation();
        this.start = { x: this.x, y: this.y };
      },
      onPanResponderMove: (_e, g) => this.jump(this.start.x - g.dx / this.zoom, this.start.y - g.dy / this.zoom),
      onPanResponderRelease: () => this.emit(),
      onPanResponderTerminate: () => this.emit(),
      onPanResponderTerminationRequest: () => false,
    });
  }

  private clamp(x: number, y: number, zoom: number) {
    const lim = (v: number, half: number, total: number) =>
      half * 2 >= total + SLACK * 2 ? total / 2 : Math.min(Math.max(v, half - SLACK), total - half + SLACK);
    return { x: lim(x, this.w / 2 / zoom, WORLD.width), y: lim(y, this.h / 2 / zoom, WORLD.height) };
  }

  configure(onChange: ((region: Region) => void) | undefined, reduceMotion: boolean) {
    this.onChange = onChange;
    this.reduceMotion = reduceMotion;
  }

  private emit() {
    this.onChange?.({ x: this.x, y: this.y, zoom: this.zoom });
  }

  /** Move without animation (drags, layout changes). */
  jump(x: number, y: number) {
    const next = this.clamp(x, y, this.zoom);
    this.x = next.x;
    this.y = next.y;
    this.cx.setValue(next.x);
    this.cy.setValue(next.y);
  }

  setViewport(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.jump(this.x, this.y);
  }

  animateTo = (x: number, y: number, zoom = this.zoom, offsetY = 0) => {
    const z = ZOOMS.reduce((best, v) => (Math.abs(v - zoom) < Math.abs(best - zoom) ? v : best), ZOOMS[1]);
    const target = this.clamp(x, y + offsetY / z, z);
    this.x = target.x;
    this.y = target.y;
    this.zoom = z;
    const timing = (value: Animated.Value, toValue: number) =>
      Animated.timing(value, {
        toValue,
        duration: this.reduceMotion ? dur.fast : 420,
        easing: ease.soft,
        useNativeDriver: native,
      });
    Animated.parallel([timing(this.cx, target.x), timing(this.cy, target.y), timing(this.scale, z)]).start(() =>
      this.emit(),
    );
  };

  zoomIn = () => {
    const i = ZOOMS.indexOf(this.zoom as (typeof ZOOMS)[number]);
    this.animateTo(this.x, this.y, ZOOMS[Math.min(ZOOMS.length - 1, i + 1)]);
  };

  zoomOut = () => {
    const i = ZOOMS.indexOf(this.zoom as (typeof ZOOMS)[number]);
    this.animateTo(this.x, this.y, ZOOMS[Math.max(0, i - 1)]);
  };

  recenter = (offsetY = 0) => this.animateTo(ME.x, ME.y, this.zoom, offsetY);
}

export const LokalMap = forwardRef<LokalMapHandle, Props>(function LokalMap(
  { region = { x: ME.x, y: ME.y, zoom: 1 }, onRegionChange, children },
  ref,
) {
  const { map, isNight } = useTheme();
  const reduceMotion = useReduceMotion();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [camera] = useState(() => new MapCamera(region));

  useEffect(() => {
    camera.configure(onRegionChange, reduceMotion);
  }, [camera, onRegionChange, reduceMotion]);

  useEffect(() => {
    if (size.w) camera.setViewport(size.w, size.h);
  }, [camera, size.w, size.h]);

  useImperativeHandle(
    ref,
    () => ({ animateTo: camera.animateTo, zoomIn: camera.zoomIn, zoomOut: camera.zoomOut, recenter: camera.recenter }),
    [camera],
  );

  // RN scales around the view center (o), so to show world point c at the viewport
  // center: translate = (viewport / 2 - o) - (c - o) * zoom.
  const tx = useMemo(
    () =>
      Animated.subtract(
        size.w / 2 - WORLD.width / 2,
        Animated.multiply(Animated.add(camera.cx, -WORLD.width / 2), camera.scale),
      ),
    [camera, size.w],
  );
  const ty = useMemo(
    () =>
      Animated.subtract(
        size.h / 2 - WORLD.height / 2,
        Animated.multiply(Animated.add(camera.cy, -WORLD.height / 2), camera.scale),
      ),
    [camera, size.h],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize({ w, h });
  };

  return (
    <View
      style={[styles.fill, { backgroundColor: map.bg }, Platform.OS === 'web' && webNoTouchScroll]}
      onLayout={onLayout}
      accessibilityLabel={t('map.a11y')}
      {...camera.pan.panHandlers}
    >
      <Animated.View style={[styles.world, { transform: [{ translateX: tx }, { translateY: ty }, { scale: camera.scale }] }]}>
        <MapWorld palette={map} night={isNight} />
        <MapScaleContext.Provider value={camera.inverse}>
          <YouDot />
          {children}
        </MapScaleContext.Provider>
      </Animated.View>
    </View>
  );
});

const webNoTouchScroll = { touchAction: 'none', userSelect: 'none', cursor: 'grab' } as unknown as object;

/** The sky "you" dot at ME, with a soft pulse ring (static under reduce motion). */
function YouDot() {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const inverse = useMapInverseScale();
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.3);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2000, easing: ease.out, useNativeDriver: native }),
    );
    pulse.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      accessible
      accessibilityLabel={t('map.you')}
      style={[styles.me, { left: ME.x - 28, top: ME.y - 28 }, inverse ? { transform: [{ scale: inverse }] } : null]}
    >
      <Animated.View
        style={[
          styles.ring,
          { backgroundColor: c.sky },
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }],
          },
        ]}
      />
      <View style={[styles.dot, { backgroundColor: c.sky }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  world: { position: 'absolute', left: 0, top: 0, width: WORLD.width, height: WORLD.height },
  me: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 56, height: 56, borderRadius: 28 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: '#ffffff' },
});
