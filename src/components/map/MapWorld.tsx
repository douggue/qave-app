import { memo } from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { getMapLabels, WORLD } from '@/data/repo';
import type { MapPalette } from '@/theme/tokens';

// The illustrated Austin world, ported from buildMap() in design/lokal-mockup-v4.html.
// Blocks, buildings, parks and trees are merged into a few long paths (not thousands
// of nodes) so it renders fast on Android. The geometry is computed once per app run.

type Bounds = [number, number, number, number];
type RegionPaths = { id: string; bounds: Bounds; rot: number; park: string; tree: string; block: string; bldg: string };

/** The mockup's seeded generator (Park-Miller), so the city looks the same every time. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const inPark = (x: number, y: number) =>
  ((x - 240) / 200) ** 2 + ((y - 1060) / 150) ** 2 < 1 ||
  ((x - 170) / 90) ** 2 + ((y - 330) / 190) ** 2 < 1 ||
  ((x - 1250) / 110) ** 2 + ((y - 1500) / 80) ** 2 < 1 ||
  ((x - 610) / 90) ** 2 + ((y - 980) / 40) ** 2 < 1;

const n = (v: number) => Math.round(v * 10) / 10;
const rect = (x: number, y: number, w: number, h: number) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`;
const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${n(h - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${r}` +
  `h${n(-(w - 2 * r))}a${r} ${r} 0 0 1 ${-r} ${-r}v${n(-(h - 2 * r))}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const circle = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0z`;

function region(id: string, x0: number, y0: number, x1: number, y1: number, cell: number, rot: number, r: () => number): RegionPaths {
  const gap = 15;
  let park = '';
  let tree = '';
  let block = '';
  let bldg = '';
  for (let x = x0 - 200; x < x1 + 200; x += cell) {
    for (let y = y0 - 200; y < y1 + 200; y += cell) {
      const cx = x + cell / 2;
      const cy = y + cell / 2;
      const w = cell - gap;
      if (inPark(cx, cy)) {
        park += rect(x, y, cell + 1, cell + 1);
        for (let k = 0; k < 3; k++) tree += circle(x + 10 + r() * (cell - 20), y + 10 + r() * (cell - 20), 6 + r() * 5);
        continue;
      }
      block += roundRect(x, y, w, w, 9);
      const count = 1 + Math.floor(r() * 4);
      for (let b = 0; b < count; b++) {
        const bw = 12 + r() * (w / 2 - 10);
        const bh = 12 + r() * (w / 2 - 10);
        bldg += rect(x + 6 + r() * (w - bw - 12), y + 6 + r() * (w - bh - 12), bw, bh);
      }
    }
  }
  return { id, bounds: [x0, y0, x1, y1], rot, park, tree, block, bldg };
}

let cache: RegionPaths[] | null = null;
function regions(): RegionPaths[] {
  if (!cache) {
    const r = rng(42);
    cache = [
      region('rnw', 0, 0, 780, 880, 76, -8, r),
      region('rne', 780, 0, 1400, 880, 82, 0, r),
      region('rs', 0, 900, 1400, 1800, 86, 5, r),
    ];
  }
  return cache;
}

const RIVER = 'M-40 905 C 160 840, 330 960, 560 880 S 900 800, 1120 870 S 1350 930, 1460 880';
const AVENUES =
  'M780 -20V1820 M400 -20L370 1820 M620 960V1820 M780 600H1420 M-20 790C300 770 500 800 780 790S1200 800 1420 780 M-20 1000C300 980 500 1010 760 990S1200 1010 1420 990';
const I35 = 'M1010 -20C1000 400 990 800 1000 1100S990 1500 985 1820';
const FONT = 'Figtree_700Bold';

type Props = { palette: MapPalette; night: boolean };

/** The static world drawing. Memoized: it only re-renders when the palette changes. */
export const MapWorld = memo(function MapWorld({ palette: p, night }: Props) {
  const labels = getMapLabels();
  return (
    <Svg width={WORLD.width} height={WORLD.height} viewBox={`0 0 ${WORLD.width} ${WORLD.height}`} pointerEvents="none">
      <Rect width={WORLD.width} height={WORLD.height} fill={p.road} />
      <Defs>
        {regions().map(({ id, bounds: [x0, y0, x1, y1] }) => (
          <ClipPath key={id} id={id}>
            <Rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
          </ClipPath>
        ))}
      </Defs>
      {regions().map(({ id, bounds: [x0, y0, x1, y1], rot, park, tree, block, bldg }) => (
        <G key={id} clipPath={`url(#${id})`}>
          <G transform={`rotate(${rot} ${(x0 + x1) / 2} ${(y0 + y1) / 2})`}>
            <Path d={park} fill={p.park} />
            <Path d={tree} fill={p.tree} />
            <Path d={block} fill={p.block} />
            <Path d={bldg} fill={p.bldg} />
          </G>
        </G>
      ))}
      <Path d={RIVER} stroke={p.bank} strokeWidth={122} fill="none" strokeLinecap="round" />
      <Path d={RIVER} stroke={p.water} strokeWidth={92} fill="none" strokeLinecap="round" />
      <G fill="none" strokeLinecap="round">
        <Path d={AVENUES} stroke={p.aveO} strokeWidth={20} />
        <Path d={AVENUES} stroke={p.ave} strokeWidth={13} />
        <Path d={I35} stroke={p.hwyO} strokeWidth={30} />
        <Path d={I35} stroke={p.hwy} strokeWidth={20} />
      </G>
      {labels.map((l) => {
        if (l.kind === 'shield') {
          return (
            <G key={l.text}>
              <Rect x={l.x - 17} y={l.y - 13} width={34} height={26} rx={6} fill="#2f6fd6" stroke="#ffffff" strokeWidth={3} />
              <SvgText x={l.x} y={l.y + 5} textAnchor="middle" fontFamily={FONT} fontSize={12} fill="#ffffff">
                {l.text}
              </SvgText>
            </G>
          );
        }
        const hood = l.kind === 'hood';
        return (
          <SvgText
            key={l.text}
            x={l.x}
            y={l.y}
            fontFamily={FONT}
            fontSize={hood || l.kind === 'water' ? 15 : 12}
            letterSpacing={hood ? 4 : 0}
            fontStyle={l.kind === 'water' ? 'italic' : 'normal'}
            fill={l.kind === 'water' ? p.wl : p.label}
            transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
          >
            {l.text}
          </SvgText>
        );
      })}
    </Svg>
  );
});
