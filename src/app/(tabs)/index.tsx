import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';

import { EmojiFloat } from '@/components/celebrate/EmojiFloat';
import { LokalMap, ZOOMS, type HitTarget, type LokalMapHandle, type Region } from '@/components/map/LokalMap';
import { SpotPin, type PinLabel } from '@/components/map/SpotPin';
import { BottomSheet, PEEK, type Snap } from '@/components/sheet/BottomSheet';
import { useToast } from '@/components/ui';
import { closingLeft, milesFromMe, pinTagText, reportAt } from '@/data/format';
import { ME } from '@/data/repo';
import type { Spot } from '@/data/types';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { getAppStart, useClock } from '@/hooks/use-clock';
import { matchesFilter, useAllReports, useSpots } from '@/hooks/use-spots';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { ui } from '@/theme/emoji';
import { reportGlyph } from '@/theme/glyphs';
import { ease, native } from '@/theme/motion';
import { withAlpha } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityPill, IconButton, MapTopBar, ZoomPill } from '@/features/map/MapOverlay';
import { SheetExplore, SheetHeader, SheetPreview } from '@/features/map/SheetContent';

/** At most this many pins show the big mood bubble at once (calm map). */
const MAX_BUBBLES = 3;
/** Screen points from a pin's anchor to the top of its sticker, and to the top of its bubble. */
const STICKER_ABOVE = 72;
const BUBBLE_ABOVE = 104;
/** Screen points below the anchor that a pin tag takes. */
const TAG_BELOW = 24;
/** The tab bar's height before it is measured (it takes its own layout space). */
const TAB_BAR_EST = 86;

type PinLabels = Record<string, { label: PinLabel; tag: string | null }>;

type Box = { l: number; t: number; r: number; b: number };
const overlaps = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
/** A rough width for a label: Figtree at 12 pt averages about 6.4 pt per character. */
const textW = (text: string, px: number) => text.length * px * 0.53;

/**
 * Which pins get the big bubble, a small tag, or nothing. The selected pin first, then hot or
 * freshly reported spots nearest the middle of the visible band, up to MAX_BUBBLES, skipping
 * one that would collide with a bubble already placed. Every other pin with a mood gets a tag
 * unless it would collide. Nothing shows where it would sit under the top bar or the sheet.
 */
function pickLabels(opts: {
  spots: Spot[];
  selectedId: string | null;
  isDimmed: (spot: Spot) => boolean;
  region: Region;
  size: { w: number; h: number };
  topLimit: number;
  bottomLimit: number;
  railTop: number | null;
  /** Where the activity pill starts (left side, above the sheet), or null when hidden. */
  pillTop: number | null;
  bandOffset: number;
  newestReport: Record<string, number>;
  now: number;
  appStart: number;
}): PinLabels {
  const { spots, selectedId, isDimmed, region, size, topLimit, bottomLimit, railTop, pillTop, bandOffset } = opts;
  const { newestReport, now, appStart } = opts;
  const z = region.zoom;
  const midX = region.x;
  const midY = region.y - bandOffset / z;
  const pos = (spot: Spot) => ({ sx: (spot.x - region.x) * z + size.w / 2, sy: (spot.y - region.y) * z + size.h / 2 });
  const underRail = (sx: number, sy: number) => railTop !== null && sx > size.w - RAIL_W && sy > railTop;
  const underPill = (box: Box) => pillTop !== null && box.l < PILL_W && box.b > pillTop;

  const out: PinLabels = {};
  const candidates: { spot: Spot; score: number; box: Box }[] = [];
  for (const spot of spots) {
    const tag = pinTagText(spot, closingLeft(spot, now, appStart));
    out[spot.id] = { label: 'none', tag };
    const mood = spot.mood ? t(spot.mood.key, spot.mood.params) : null;
    if (!mood) continue;
    const { sx, sy } = pos(spot);
    const half = Math.min(180, textW(mood, 12) + 38) / 2;
    const box = { l: sx - half, t: sy - BUBBLE_ABOVE, r: sx + half, b: sy - BUBBLE_ABOVE + 28 };
    const fits =
      box.l > 8 && box.r < size.w - 8 && box.t > topLimit && sy < bottomLimit && !underRail(box.r, sy) && !underPill(box);
    if (!fits) continue;
    if (spot.id === selectedId) {
      candidates.push({ spot, score: -Infinity, box });
      continue;
    }
    if (isDimmed(spot)) continue;
    const dist = Math.hypot(spot.x - midX, spot.y - midY);
    const fresh = newestReport[spot.id] !== undefined && now - newestReport[spot.id] < 20 * 60_000;
    // World units: a hot or fresh spot wins over a plain one a little closer to the middle.
    candidates.push({ spot, score: dist - (spot.hot ? 320 : 0) - (fresh ? 200 : 0), box });
  }
  // Labels never cover another pin's sticker (the selected pin's own bubble always shows).
  const stickers = spots.map((spot) => {
    const { sx, sy } = pos(spot);
    return { id: spot.id, box: { l: sx - 26, t: sy - STICKER_ABOVE + 8, r: sx + 26, b: sy - 12 } };
  });
  const coversSticker = (id: string, box: Box) => stickers.some((st) => st.id !== id && overlaps(st.box, box));
  const taken: Box[] = [];
  let bubbles = 0;
  for (const { spot, box } of candidates.sort((a, b) => a.score - b.score)) {
    if (bubbles >= MAX_BUBBLES) break;
    const forced = spot.id === selectedId;
    if (!forced && (taken.some((o) => overlaps(o, box)) || coversSticker(spot.id, box))) continue;
    taken.push(box);
    bubbles++;
    out[spot.id].label = 'bubble';
  }
  // Tags, nearest the middle first, so a crowded edge loses its tags before the center does.
  const byMiddle = [...spots].sort(
    (a, b) => Math.hypot(a.x - midX, a.y - midY) - Math.hypot(b.x - midX, b.y - midY),
  );
  for (const spot of byMiddle) {
    const entry = out[spot.id];
    if (entry.label === 'bubble' || !entry.tag) continue;
    const { sx, sy } = pos(spot);
    const half = Math.min(150, textW(entry.tag, 11.5) + 30) / 2;
    const box = { l: sx - half, t: sy + 1, r: sx + half, b: sy + 19 };
    const fits =
      box.l > 4 && box.r < size.w - 4 && sy + 4 > topLimit && sy + TAG_BELOW < bottomLimit && !underRail(box.r, sy) && !underPill(box);
    if (!fits || taken.some((o) => overlaps(o, box)) || coversSticker(spot.id, box)) continue;
    taken.push(box);
    entry.label = 'tag';
  }
  return out;
}

/** Room the rail (right) and the activity pill (left) take above the sheet peek. */
const RAIL_W = 70;
const RAIL_H = 200;
const PILL_W = 300;
const PILL_H = 58;

/**
 * The first view: the zoomed-out center that shows the most whole stickers (with room for
 * tags) in the band between the top bar and the sheet peek, clear of the rail and the
 * activity pill, nearest "you" on a tie. At 390x844 that is 6 stickers.
 */
function firstViewCenter(spots: Spot[], w: number, h: number, top: number, bottom: number, zoom: number) {
  const visible = (sx: number, sy: number) =>
    sx > 26 &&
    sx < w - 26 &&
    sy - STICKER_ABOVE - 6 > top &&
    sy + TAG_BELOW < bottom &&
    !(sx < PILL_W && sy + TAG_BELOW > bottom - PILL_H) &&
    !(sx > w - RAIL_W - 26 && sy > bottom - RAIL_H);
  const xs = spots.map((s) => s.x);
  const ys = spots.map((s) => s.y);
  const now = Date.now();
  let best = { x: ME.x as number, y: ME.y as number, score: -1, n: -1, d: Infinity };
  for (let cx = Math.min(...xs); cx <= Math.max(...xs); cx += 20) {
    for (let cy = Math.min(...ys); cy <= Math.max(...ys); cy += 20) {
      let n = 0;
      for (const s of spots) if (visible((s.x - cx) * zoom + w / 2, (s.y - cy) * zoom + h / 2)) n++;
      // A view with a couple of live bubbles beats one more bare sticker.
      const labels = pickLabels({
        spots,
        selectedId: null,
        isDimmed: () => false,
        region: { x: cx, y: cy, zoom },
        size: { w, h },
        topLimit: top + 6,
        bottomLimit: bottom,
        railTop: bottom - 12 - RAIL_H,
        pillTop: bottom - PILL_H,
        bandOffset: 0,
        newestReport: {},
        now,
        appStart: now,
      });
      const bubbles = Object.values(labels).filter((l) => l.label === 'bubble').length;
      const score = n + Math.min(2, bubbles);
      const d = Math.hypot(cx - ME.x, cy - ME.y);
      if (score > best.score || (score === best.score && (n > best.n || (n === best.n && d < best.d))))
        best = { x: cx, y: cy, score, n, d };
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
  const toast = useToast();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, actions } = useStore();
  const spots = useSpots();
  const bobs = useBobLoops();
  const window = useWindowDimensions();
  const [snap, setSnap] = useState<Snap>('peek');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const height = size.h;
  // The top bar's measured height, so the camera centers inside the visible band.
  const [topInset, setTopInset] = useState(0);
  const topEstimate = topInset || insets.top + 152;
  // Positive shifts a target up: half the difference between what covers the bottom (sheet peek;
  // the tab bar takes its own layout space) and what covers the top.
  const bandOffset = Math.round((PEEK - topEstimate) / 2);

  const selected = state.selectedSpot ? spots.find((s) => s.id === state.selectedSpot) ?? null : null;
  // Keep the pin above the half-open sheet.
  // Center a focused pin in the band between the top bar and the half-open sheet, a little low
  // so its sticker and bubble fit above it.
  const focusOffset = Math.round(height / 2 - ((topEstimate + height * 0.5) / 2 + 45));

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

  // Open zoomed out where the most stickers fit between the top bar and the sheet peek.
  // Computed once from the window size: the map keeps its own camera after that.
  const [initialRegion] = useState<Region>(() => {
    const zoom = ZOOMS[0];
    const h = window.height - TAB_BAR_EST - insets.bottom;
    const c0 = firstViewCenter(spots, window.width, h, topEstimate, h - PEEK, zoom);
    return { x: c0.x, y: c0.y, zoom };
  });
  const [region, setRegion] = useState<Region>(initialRegion);

  // Calm map: which pins get the big bubble (at most 3), a small tag, or nothing.
  const now = useClock(60_000);
  const reports = useAllReports();
  const newestReport = useMemo(() => {
    const appStart = getAppStart();
    const out: Record<string, number> = {};
    for (const r of reports) out[r.spotId] = Math.max(out[r.spotId] ?? 0, reportAt(r, appStart));
    return out;
  }, [reports]);
  const filter = state.filter;
  // Where the sheet starts on screen, so labels never hide under it.
  const mapH = size.h || window.height - TAB_BAR_EST;
  const sheetTop = snap === 'peek' ? mapH - PEEK : snap === 'half' ? mapH * 0.5 : 0;
  const labels = useMemo(
    () =>
      pickLabels({
        spots,
        selectedId: state.selectedSpot,
        isDimmed: (s) => !matchesFilter(s, filter),
        region,
        size: size.w ? size : { w: window.width, h: window.height - TAB_BAR_EST },
        topLimit: topEstimate + 6,
        bottomLimit: sheetTop,
        railTop: snap === 'peek' ? sheetTop - 12 - RAIL_H : null,
        pillTop: snap === 'peek' ? sheetTop - PILL_H : null,
        bandOffset,
        newestReport,
        now,
        appStart: getAppStart(),
      }),
    [spots, state.selectedSpot, filter, region, size, window, topEstimate, sheetTop, snap, bandOffset, newestReport, now],
  );

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

  // A fresh report rises from its pin as a short glyph float (02 spec 7.8).
  const fx = state.fx;
  const floatSpot = fx?.kind === 'report' && fx.report ? spots.find((s) => s.id === fx.spotId) : undefined;

  // Nearest first. The selected pin has zIndex 2000, so it still draws on top.
  const ordered = useMemo(() => [...spots].sort((a, b) => milesFromMe(a) - milesFromMe(b)), [spots]);

  return (
    <View
      style={styles.screen}
      onLayout={(e: LayoutChangeEvent) =>
        setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      <LokalMap
        ref={mapRef}
        region={initialRegion}
        onRegionChange={setRegion}
        pins={spots}
        onPin={onHitPin}
        onMapPress={close}
      >
        {ordered.map((spot, i) => (
          <SpotPin
            key={spot.id}
            spot={spot}
            selected={spot.id === state.selectedSpot}
            label={labels[spot.id]?.label ?? 'none'}
            tag={labels[spot.id]?.tag ?? null}
            dimmed={!matchesFilter(spot, state.filter)}
            bob={bobs[i % 2]}
            onPress={onPin}
          />
        ))}
        {fx && floatSpot && fx.report ? (
          <EmojiFloat key={fx.id} x={floatSpot.x} y={floatSpot.y} glyph={reportGlyph[fx.report]} />
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

      {snap === 'peek' ? (
        <>
          <View style={[styles.rail, { bottom: PEEK + 12 }]} pointerEvents="box-none">
            <IconButton icon={ui.dice} label={t('map.surprise')} onPress={surprise} />
            <ZoomPill onIn={() => mapRef.current?.zoomIn()} onOut={() => mapRef.current?.zoomOut()} />
            <IconButton
              icon={ui.recenter}
              label={t('map.recenter')}
              onPress={() => mapRef.current?.recenter(bandOffset)}
            />
          </View>
          <View style={[styles.activity, { bottom: PEEK + 12 }]} pointerEvents="box-none">
            <ActivityPill spots={spots} onOpen={onPin} />
          </View>
        </>
      ) : null}

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
  // Leaves room for the rail (12 + 44 + 8) on the right.
  activity: { position: 'absolute', left: 12, right: 64, alignItems: 'flex-start', zIndex: 3000 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3000 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0 },
});
