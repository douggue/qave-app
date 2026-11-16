import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmojiFloat } from '@/components/celebrate/EmojiFloat';
import { CROWD_MIN, CrowdGlow, CrowdPill } from '@/components/map/CrowdHalo';
import { LokalMap, ZOOMS, type HitTarget, type LokalMapHandle, type Region } from '@/components/map/LokalMap';
import { PIN_ANCHOR_Y, SpotPin } from '@/components/map/SpotPin';
import { BottomSheet, PEEK, type Snap } from '@/components/sheet/BottomSheet';
import { crowdActivity, crowdFaces, hereTonight } from '@/data/crowd';
import { closingLeft, milesFromMe, pinTagText } from '@/data/format';
import { ME } from '@/data/repo';
import type { Spot } from '@/data/types';
import { MapButton, MapHeader } from '@/features/map/MapOverlay';
import { SheetExplore, SheetPreview, type ExploreMode } from '@/features/map/SheetContent';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { matchesFilter, useAllReports, useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { reportGlyph } from '@/theme/glyphs';
import { ease, native } from '@/theme/motion';
import { withAlpha } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Calm map (Mix): at most this many small tags under stickers at once. No bubbles. */
const MAX_TAGS = 4;
/** Screen points below the anchor that a pin tag takes. */
const TAG_BELOW = 20;
/** The tab bar's height before it is measured (it takes its own layout space). */
const TAB_BAR_EST = 86;
/** The recenter button's corner above the panel (right side). */
const RECENTER = 44 + 4 + 12;

type Box = { l: number; t: number; r: number; b: number };
const overlaps = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
/** A rough width for a tag: Figtree 700 at 10.5 pt averages about 5.8 pt per character. */
const tagW = (text: string) => text.length * 5.8 + 16;

/**
 * Which pins show their small tag: nearest the middle of the visible band first, up to
 * MAX_TAGS, skipping one that would collide with a sticker or another tag, or sit under the
 * header, the panel or the recenter button. The selected pin shows its distance ring instead.
 */
function pickTags(opts: {
  spots: Spot[];
  selectedId: string | null;
  isDimmed: (spot: Spot) => boolean;
  region: Region;
  size: { w: number; h: number };
  topLimit: number;
  bottomLimit: number;
  now: number;
  appStart: number;
}): Record<string, string | null> {
  const { spots, selectedId, isDimmed, region, size, topLimit, bottomLimit, now, appStart } = opts;
  const z = region.zoom;
  const pos = (spot: Spot) => ({ sx: (spot.x - region.x) * z + size.w / 2, sy: (spot.y - region.y) * z + size.h / 2 });
  const mid = { x: size.w / 2, y: (topLimit + bottomLimit) / 2 };
  const stickers = spots.map((spot) => {
    const { sx, sy } = pos(spot);
    const r = spot.id === selectedId ? 60 : 24;
    return { id: spot.id, box: { l: sx - r, t: sy - PIN_ANCHOR_Y - (r - 24), r: sx + r, b: sy - 4 + (r - 24) } };
  });
  const out: Record<string, string | null> = {};
  const taken: Box[] = [];
  const byMiddle = spots
    .map((spot) => ({ spot, ...pos(spot) }))
    .sort((a, b) => Math.hypot(a.sx - mid.x, a.sy - mid.y) - Math.hypot(b.sx - mid.x, b.sy - mid.y));
  for (const { spot, sx, sy } of byMiddle) {
    out[spot.id] = null;
    if (taken.length >= MAX_TAGS || spot.id === selectedId || isDimmed(spot)) continue;
    const tag = pinTagText(spot, closingLeft(spot, now, appStart));
    if (!tag) continue;
    const half = Math.min(150, tagW(tag)) / 2;
    const box = { l: sx - half, t: sy + 1, r: sx + half, b: sy + TAG_BELOW };
    const fits =
      box.l > 6 &&
      box.r < size.w - 6 &&
      sy - PIN_ANCHOR_Y > topLimit &&
      box.b < bottomLimit &&
      !(box.r > size.w - RECENTER && box.b > bottomLimit - RECENTER);
    if (
      !fits ||
      taken.some((o) => overlaps(o, box)) ||
      stickers.some((st) => st.id !== spot.id && overlaps(st.box, box))
    )
      continue;
    taken.push(box);
    out[spot.id] = tag;
  }
  return out;
}

/**
 * The first view: the center (at the widest zoom) that shows the most whole stickers, with
 * room for tags, in the band between the header and the panel peek, nearest "you" on a tie.
 */
function firstViewCenter(spots: Spot[], w: number, h: number, top: number, bottom: number, zoom: number) {
  const visible = (sx: number, sy: number) =>
    sx > 30 &&
    sx < w - 30 &&
    sy - PIN_ANCHOR_Y - 6 > top &&
    sy + TAG_BELOW < bottom &&
    !(sx > w - RECENTER - 26 && sy + TAG_BELOW > bottom - RECENTER);
  const xs = spots.map((s) => s.x);
  const ys = spots.map((s) => s.y);
  let best = { x: ME.x as number, y: ME.y as number, n: -1, d: Infinity };
  for (let cx = Math.min(...xs); cx <= Math.max(...xs); cx += 20) {
    for (let cy = Math.min(...ys); cy <= Math.max(...ys); cy += 20) {
      let n = 0;
      for (const s of spots) if (visible((s.x - cx) * zoom + w / 2, (s.y - cy) * zoom + h / 2)) n++;
      const d = Math.hypot(cx - ME.x, cy - ME.y);
      if (n > best.n || (n === best.n && d < best.d)) best = { x: cx, y: cy, n, d };
    }
  }
  return { x: best.x, y: best.y };
}

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
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, actions } = useStore();
  const spots = useSpots();
  const bobs = useBobLoops();
  const window = useWindowDimensions();
  const [snap, setSnapState] = useState<Snap>('peek');
  // 'top' shows the full Top 10 list in the sheet; it goes back to explore when the sheet collapses.
  const [listMode, setListMode] = useState<ExploreMode>('explore');
  const setSnap = useCallback((value: Snap) => {
    setSnapState(value);
    if (value === 'peek') setListMode('explore');
  }, []);
  const changeListMode = useCallback(
    (mode: ExploreMode) => {
      setListMode(mode);
      if (mode === 'top') setSnap('full');
    },
    [setSnap],
  );
  const [size, setSize] = useState({ w: 0, h: 0 });
  const height = size.h;
  // The top bar's measured height, so the camera centers inside the visible band.
  const [topInset, setTopInset] = useState(0);
  const topEstimate = topInset || insets.top + 140;
  // Positive shifts a target up: half the difference between what covers the bottom (sheet peek;
  // the tab bar takes its own layout space) and what covers the top.
  const bandOffset = Math.round((PEEK - topEstimate) / 2);

  const selected = state.selectedSpot ? (spots.find((s) => s.id === state.selectedSpot) ?? null) : null;
  // Keep the pin above the half-open sheet.
  // Center a focused pin in the band between the top bar and the half-open sheet, a little low
  // so its sticker and bubble fit above it.
  const focusOffset = Math.round(height / 2 - ((topEstimate + height * 0.5) / 2 + 45));

  const focus = useCallback(
    (spot: Spot) => {
      actions.selectSpot(spot.id);
      setSnapState((s) => (s === 'peek' ? 'half' : s));
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
    setSnapState((s) => (s === 'peek' ? 'half' : s));
  }, [selected, height, focusOffset, focusSeq]);

  const close = useCallback(() => {
    lastFocused.current = null;
    actions.selectSpot(null);
    setSnap('peek');
  }, [actions, setSnap]);

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

  // Open zoomed out where the most stickers fit between the top bar and the sheet peek.
  // Computed once from the window size: the map keeps its own camera after that.
  const [initialRegion] = useState<Region>(() => {
    const zoom = ZOOMS[0];
    const h = window.height - TAB_BAR_EST - insets.bottom;
    const c0 = firstViewCenter(spots, window.width, h, topEstimate, h - PEEK, zoom);
    return { x: c0.x, y: c0.y, zoom };
  });
  const [region, setRegion] = useState<Region>(initialRegion);

  // Calm map: which pins show a small tag (at most 4).
  const now = useClock(60_000);
  const reports = useAllReports();
  const filter = state.filter;
  // Where the panel starts on screen, so tags never hide under it.
  const mapH = size.h || window.height - TAB_BAR_EST;
  const sheetTop = snap === 'peek' ? mapH - PEEK : snap === 'half' ? mapH * 0.5 : 0;
  const tags = useMemo(
    () =>
      pickTags({
        spots,
        selectedId: state.selectedSpot,
        isDimmed: (s) => !matchesFilter(s, filter),
        region,
        size: size.w ? size : { w: window.width, h: window.height - TAB_BAR_EST },
        topLimit: topEstimate + 6,
        bottomLimit: sheetTop,
        now,
        appStart: getAppStart(),
      }),
    [spots, state.selectedSpot, filter, region, size, window, topEstimate, sheetTop, now],
  );

  // Crowd halos: spots with 15+ recent check-ins and confirmations tonight.
  const { votes, stillHere, hereAt } = state;
  const crowds = useMemo(() => {
    const input = { reports, votes, stillHere, hereAt };
    return spots
      .filter((s) => s.open && crowdActivity(s, input) >= CROWD_MIN)
      .map((spot) => ({ spot, here: hereTonight(spot, input), faces: crowdFaces(spot, reports) }));
  }, [spots, reports, votes, stillHere, hereAt]);

  // A fresh report rises from its pin as a short glyph float (02 spec 7.8).
  const fx = state.fx;
  const floatSpot = fx?.kind === 'report' && fx.report ? spots.find((s) => s.id === fx.spotId) : undefined;

  // Nearest first. The selected pin has zIndex 2000, so it still draws on top.
  const ordered = useMemo(() => [...spots].sort((a, b) => milesFromMe(a) - milesFromMe(b)), [spots]);

  return (
    <View
      style={styles.screen}
      onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <LokalMap
        ref={mapRef}
        region={initialRegion}
        onRegionChange={setRegion}
        pins={spots}
        onPin={onHitPin}
        onMapPress={close}
      >
        {crowds.map(({ spot }) => (
          <CrowdGlow key={`glow-${spot.id}`} spot={spot} />
        ))}
        {ordered.map((spot, i) => (
          <SpotPin
            key={spot.id}
            spot={spot}
            selected={spot.id === state.selectedSpot}
            tag={tags[spot.id] ?? null}
            dimmed={!matchesFilter(spot, state.filter)}
            bob={bobs[i % 2]}
            onPress={onPin}
          />
        ))}
        {/* One pill only: the biggest crowd. Smaller crowds keep just their glow. */}
        {[...crowds].sort((x, y) => y.here - x.here).slice(0, 1).map(({ spot, here, faces }) =>
          matchesFilter(spot, state.filter) ? (
            <CrowdPill
              key={`pill-${spot.id}`}
              spot={spot}
              here={here}
              faces={faces}
              flip={(spot.x - region.x) * region.zoom + (size.w || window.width) / 2 > (size.w || window.width) - 180}
            />
          ) : null,
        )}
        {fx && floatSpot && fx.report ? (
          <EmojiFloat key={fx.id} x={floatSpot.x} y={floatSpot.y} glyph={reportGlyph[fx.report]} />
        ) : null}
      </LokalMap>

      <View style={styles.overlay} pointerEvents="box-none">
        {/* A soft fade from the background color behind the header, over the map. */}
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(c.paper, 0.97), withAlpha(c.paper, 0.7), withAlpha(c.paper, 0)]}
          locations={[0, 0.62, 1]}
          style={[styles.scrim, { height: topEstimate + 70 }]}
        />
        <MapHeader spots={spots} onLayout={(e) => setTopInset(Math.round(e.nativeEvent.layout.height))} />
      </View>

      {snap === 'peek' ? (
        <View style={[styles.recenter, { bottom: PEEK + 12 }]} pointerEvents="box-none">
          <MapButton icon="recenter" label={t('map.recenter')} onPress={() => mapRef.current?.recenter(bandOffset)} />
        </View>
      ) : null}

      <BottomSheet snap={snap} onSnapChange={setSnap} contentKey={selected?.id ?? listMode} topInset={topEstimate + 8}>
        {selected ? (
          <SheetPreview spot={selected} onClose={close} />
        ) : (
          <SheetExplore spots={spots} onFocus={onPin} mode={listMode} onModeChange={changeListMode} />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  recenter: { position: 'absolute', right: 16, zIndex: 3000 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3000 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0 },
});
