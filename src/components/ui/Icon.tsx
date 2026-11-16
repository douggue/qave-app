import { memo, useId } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';

import { brand } from '@/constants/brand';

// Lokal UI icons: a chunky rounded line on a 24 grid, drawn in code so they look the same on
// iPhone, Android and the web. Food uses the custom stickers (FoodSticker); avatars stay emoji.
// `shape` paths fill with the sun-to-chili gradient when active; `detail` paths are then cut out
// of that fill with the `cut` color (the surface behind the icon). With `tint`, shapes fill with
// the tint color at low opacity and every line is drawn in it: a colored badge for moods.

type Def = { shape?: string[]; detail?: string[]; dots?: [number, number, number][]; bite?: boolean };

const PIN = 'M12 2.6c-4.4 0-7.9 3.4-7.9 7.8 0 5.7 7.9 11 7.9 11s7.9-5.3 7.9-11c0-4.4-3.5-7.8-7.9-7.8z';

const TICKET: Def = {
  shape: ['M4.2 6h15.6a1.2 1.2 0 0 1 1.2 1.2v2.6a2.2 2.2 0 0 0 0 4.4v2.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 16.8v-2.6a2.2 2.2 0 0 0 0-4.4V7.2A1.2 1.2 0 0 1 4.2 6z'],
  detail: ['M15.5 8.6v.8', 'M15.5 11.6v.8', 'M15.5 14.6v.8'],
  dots: [[9.2, 12, 1.9]],
};

const DEFS = {
  map: {
    shape: ['M3 6.6l6-2.5 6 2.5 6-2.5v13.4l-6 2.5-6-2.5-6 2.5z'],
    detail: ['M12 7.8c-1.7 0-3 1.3-3 2.9 0 2.3 3 4.6 3 4.6s3-2.3 3-4.6c0-1.6-1.3-2.9-3-2.9z'],
  },
  drops: TICKET,
  ticket: TICKET,
  ask: {
    shape: [
      'M10.5 2.8c.6 4.4 2.8 6.6 7.2 7.2-4.4.6-6.6 2.8-7.2 7.2-.6-4.4-2.8-6.6-7.2-7.2 4.4-.6 6.6-2.8 7.2-7.2z',
      'M18.5 14.6c.3 1.7 1.2 2.6 2.9 2.9-1.7.3-2.6 1.2-2.9 2.9-.3-1.7-1.2-2.6-2.9-2.9 1.7-.3 2.6-1.2 2.9-2.9z',
    ],
  },
  you: {
    shape: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'],
    detail: ['M8.6 14.2c1.9 2.1 4.9 2.1 6.8 0'],
    dots: [[9.3, 10, 1.3], [14.7, 10, 1.3]],
  },
  today: {
    shape: ['M6 3.5h12A2.5 2.5 0 0 1 20.5 6v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5z'],
    detail: ['M8.2 16.4v-3', 'M12 16.4V8', 'M15.8 16.4v-5'],
  },
  where: { shape: [PIN], dots: [[11.6, 10.2, 2.6]], bite: true },
  golive: {
    detail: ['M8.3 8.3a5.3 5.3 0 0 0 0 7.4', 'M15.7 8.3a5.3 5.3 0 0 1 0 7.4', 'M5.3 5.3a9.4 9.4 0 0 0 0 13.4', 'M18.7 5.3a9.4 9.4 0 0 1 0 13.4'],
    dots: [[12, 12, 2.2]],
  },
  menu: {
    shape: ['M6.6 4.6h10.8a1.6 1.6 0 0 1 1.6 1.6v13.2a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19.4V6.2a1.6 1.6 0 0 1 1.6-1.6z'],
    detail: ['M9.6 3.2h4.8', 'M8.6 10.4h6.8', 'M8.6 13.8h6.8', 'M8.6 17.2h4'],
  },
  promote: {
    shape: ['M4 10.2v3.6a1 1 0 0 0 1 1h2.3l7.7 4.3V4.9L7.3 9.2H5a1 1 0 0 0-1 1z'],
    detail: ['M18.3 9.2a4 4 0 0 1 0 5.6', 'M7.7 15.2l1.4 4.4'],
  },
  bell: { shape: ['M6 16.4V11a6 6 0 0 1 12 0v5.4l1.6 2.1H4.4z'], detail: ['M10 20.8a2 2 0 0 0 4 0'] },
  sun: {
    shape: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
    detail: ['M12 2.6v1.8', 'M12 19.6v1.8', 'M2.6 12h1.8', 'M19.6 12h1.8', 'M5.4 5.4l1.3 1.3', 'M17.3 17.3l1.3 1.3', 'M5.4 18.6l1.3-1.3', 'M17.3 6.7l1.3-1.3'],
  },
  moon: { shape: ['M19.6 14.6A7.9 7.9 0 1 1 9.4 4.4a6.3 6.3 0 0 0 10.2 10.2z'] },
  recenter: {
    shape: ['M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z'],
    detail: ['M12 2v2.6', 'M12 19.4V22', 'M2 12h2.6', 'M19.4 12H22'],
    dots: [[12, 12, 2.3]],
  },
  surprise: {
    shape: ['M7.5 4h9A3.5 3.5 0 0 1 20 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5v-9A3.5 3.5 0 0 1 7.5 4z'],
    dots: [[8.8, 8.8, 1.5], [12, 12, 1.5], [15.2, 15.2, 1.5]],
  },
  // Moods, reports and statuses (read as tinted badges at 12 to 16 pt).
  flame: {
    shape: ['M12 2.8c.5 3 2.4 4.4 4.1 6.3 1.5 1.7 2.4 3.5 2.4 5.6a6.5 6.5 0 0 1-13 0c0-2.3 1-4.2 2.6-5.7.3 1.5 1 2.6 2.1 3.1-.4-3.4.3-6.9 1.8-9.3z'],
    detail: ['M12 14.6c1.2 1.2 1.9 2.2 1.9 3.2a1.9 1.9 0 0 1-3.8 0c0-1 .7-2 1.9-3.2z'],
  },
  cash: {
    shape: ['M4 6.5h16A1.5 1.5 0 0 1 21.5 8v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5z'],
    detail: ['M12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z'],
    dots: [[6.3, 12, 1.1], [17.7, 12, 1.1]],
  },
  stop: {
    shape: ['M8.4 3.3h7.2l5.1 5.1v7.2l-5.1 5.1H8.4l-5.1-5.1V8.4z'],
    detail: ['M7.9 12h8.2'],
  },
  camera: {
    shape: ['M4.5 7.6h2.9l1.7-2.5h5.8l1.7 2.5h2.9A1.5 1.5 0 0 1 21 9.1v8.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.9V9.1a1.5 1.5 0 0 1 1.5-1.5z'],
    detail: ['M12 10.2a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z'],
  },
  new: {
    shape: ['M10 5.2c.7 4.4 2.4 6.1 6.8 6.8-4.4.7-6.1 2.4-6.8 6.8-.7-4.4-2.4-6.1-6.8-6.8 4.4-.7 6.1-2.4 6.8-6.8z'],
    detail: ['M18.6 3v4', 'M16.6 5h4'],
    dots: [[19.2, 18.4, 1.5]],
  },
  sparkle: {
    shape: ['M12 3c.8 5.2 3.8 8.2 9 9-5.2.8-8.2 3.8-9 9-.8-5.2-3.8-8.2-9-9 5.2-.8 8.2-3.8 9-9z'],
  },
  alarm: {
    shape: ['M12 5.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z'],
    detail: ['M12 9.6V13l2.2 1.5', 'M3.4 6.4l3-2.7', 'M20.6 6.4l-3-2.7', 'M6.8 18.6l-1.6 2', 'M17.2 18.6l1.6 2'],
  },
  sleep: {
    shape: ['M15.4 18.2A7.1 7.1 0 1 1 6 8.8a5.7 5.7 0 0 0 9.4 9.4z'],
    detail: ['M14.2 2.8h4l-4 4.4h4', 'M19.4 9.8h2.4l-2.4 2.8h2.4'],
  },
  live: {
    detail: ['M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8z'],
    dots: [[12, 12, 4.2]],
  },
  star: {
    shape: ['M12 3.1l2.35 6.26 6.69.3-5.24 4.18 1.78 6.45L12 16.6l-5.58 3.69 1.78-6.45-5.24-4.18 6.69-.3z'],
  },
  gift: {
    shape: ['M4.8 11h14.4v8.2a1.3 1.3 0 0 1-1.3 1.3H6.1a1.3 1.3 0 0 1-1.3-1.3z', 'M4 7.4h16a.8.8 0 0 1 .8.8V11H3.2V8.2a.8.8 0 0 1 .8-.8z'],
    detail: ['M12 7.4v13.1', 'M12 7.4c-.9-2.6-4.4-3.8-4.6-1.8-.1 1.5 2.4 1.8 4.6 1.8 2.2 0 4.7-.3 4.6-1.8-.2-2-3.7-.8-4.6 1.8z'],
  },
  chef: {
    shape: ['M7 13.6A3.9 3.9 0 0 1 7.6 5.8a4.6 4.6 0 0 1 8.8 0 3.9 3.9 0 0 1 .6 7.8V20H7z'],
    detail: ['M7 16.6h10'],
  },
  heart: {
    shape: ['M12 20c-4.6-2.9-8-6.2-8-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8 2.4c0 4-3.4 7.3-8 10.2z'],
  },
  party: {
    shape: ['M3.6 20.4l4.3-11.3 7 7z'],
    detail: ['M13.2 3.4c.7 1.6.1 2.9-1.4 3.6', 'M20.6 10.8c-1.6-.7-2.9-.1-3.6 1.4', 'M14.6 9.4c1.5-1.9 3.2-2.6 5.3-2'],
    dots: [[17.4, 3.6, 1.3], [20.4, 15.6, 1.3], [9.4, 4.4, 1.1]],
  },
  cone: {
    shape: ['M10.3 3.8h3.4L18 18.4H6z'],
    detail: ['M8.4 12.4h7.2', 'M4 20.2h16'],
  },
  plus: { detail: ['M12 5v14', 'M5 12h14'] },
  search: { detail: ['M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z', 'M16 16l4.5 4.5'] },
  minus: { detail: ['M5 12h14'] },
  check: { detail: ['M5 12.5l4.5 4.5L19 7.5'] },
  close: { detail: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'] },
  back: { detail: ['M15 5l-7 7 7 7'] },
  chevron: { detail: ['M9 5l7 7-7 7'] },
  go: { shape: ['M20 4L4 11l7.2 1.8L13 20z'] },
  share: { detail: ['M12 3.6v11', 'M7.8 7.8L12 3.6l4.2 4.2', 'M5 12.6v5.9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.9'] },
  send: { detail: ['M12 19V5', 'M6 11l6-6 6 6'] },
  confirm: {
    shape: ['M7.5 10.5L11.3 3.6c1.6 0 2.6 1.3 2.2 2.9l-.8 3.5h5.4a2 2 0 0 1 2 2.4l-1.3 6a2 2 0 0 1-2 1.6H7.5z'],
    detail: ['M7.5 10.5v9.5H5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1z'],
  },
  copy: {
    shape: ['M9 8.5h9.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5V10A1.5 1.5 0 0 1 9 8.5z'],
    detail: ['M16.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5v9.5A1.5 1.5 0 0 0 5.5 16h2'],
  },
  timer: {
    detail: [
      'M7 3h10',
      'M7 21h10',
      'M8.2 3v2.4c0 1.3.6 2.5 1.7 3.2L12 10l2.1-1.4a3.9 3.9 0 0 0 1.7-3.2V3',
      'M8.2 21v-2.4c0-1.3.6-2.5 1.7-3.2L12 14l2.1 1.4a3.9 3.9 0 0 1 1.7 3.2V21',
    ],
  },
  truck: {
    shape: ['M3.6 6.5h8.9a1 1 0 0 1 1 1v9.2H2.6V7.5a1 1 0 0 1 1-1z', 'M13.5 9.6h3.8l3.2 3.6v3.5h-7z'],
    detail: ['M5.4 9.6h5.2'],
    dots: [[6.6, 17.6, 2.1], [16.6, 17.6, 2.1]],
  },
  trailer: {
    shape: ['M4.2 7h10.3a5.6 5.6 0 0 1 5.6 5.6v3.2H4.2a1.6 1.6 0 0 1-1.6-1.6V8.6A1.6 1.6 0 0 1 4.2 7z'],
    detail: ['M6.4 10.4h5.2', 'M20.1 15.8h1.6'],
    dots: [[9.4, 17.4, 2.2]],
  },
  cart: {
    shape: ['M4 9.2a8 8 0 0 1 16 0z', 'M5.4 13.2h13.2v4H5.4z'],
    detail: ['M12 9.2v4'],
    dots: [[8.2, 19.4, 1.7], [15.8, 19.4, 1.7]],
  },
  tent: {
    shape: ['M3 10l9-6.2 9 6.2z'],
    detail: ['M4.6 10v10', 'M19.4 10v10', 'M8.2 15h7.6', 'M9.4 15v5', 'M14.6 15v5'],
  },
  store: {
    detail: [
      'M3.5 9.2L5 4h14l1.5 5.2',
      'M3.5 9.2a2.8 2.8 0 0 0 5.6 0 2.9 2.9 0 0 0 5.8 0 2.8 2.8 0 0 0 5.6 0',
      'M5 11.6V20h14v-8.4',
      'M10 20v-4.8h4V20',
    ],
  },
} satisfies Record<string, Def>;

export type IconName = keyof typeof DEFS;

/** Fill opacity of a tinted shape: enough to read as a colored badge, light enough for the lines. */
const TINT_FILL = 0.22;

// The three-tooth bite, as on the app icon (pin space 100x130 scaled to the 24 grid).
const BITE = [
  [17.4, 2.2],
  [20.2, 4.2],
  [21.5, 7.4],
] as const;

/** `tint` value that draws the icon with the sun-to-chili brand gradient. */
export const BRAND_TINT = 'brand';

type Props = {
  name: IconName;
  size?: number;
  /** Line color. Ignored when `active` or `tint` is set. */
  color?: string;
  /** Active tab state: shapes fill with the brand gradient. */
  active?: boolean;
  /** Colored badge look: shapes fill with this color at low opacity, lines in it. BRAND_TINT for the gradient. */
  tint?: string;
  /** Surface color behind the icon, used to cut details out of an active fill. */
  cut?: string;
  strokeWidth?: number;
};

export const Icon = memo(function Icon({ name, size = 24, color, active, tint, cut, strokeWidth = 2.3 }: Props) {
  const def: Def = DEFS[name];
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, '');
  const grad = `url(#g${id})`;
  const hasShape = !!def.shape?.length;
  const tintInk = tint ? (tint === BRAND_TINT ? grad : tint) : undefined;
  const ink = active ? grad : (tintInk ?? color ?? '#000000');
  const detailInk = active && hasShape ? (cut ?? '#ffffff') : ink;
  const dotInk = active && hasShape ? (cut ?? '#ffffff') : ink;
  const shapeFill = active ? grad : (tintInk ?? 'none');
  const shapeOpacity = !active && tintInk ? TINT_FILL : 1;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} pointerEvents="none">
      <Defs>
        <LinearGradient id={`g${id}`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={brand.sun} />
          <Stop offset="0.55" stopColor={brand.grill} />
          <Stop offset="1" stopColor={brand.chili} />
        </LinearGradient>
        {def.bite ? (
          <Mask id={`b${id}`} x="0" y="0" width="24" height="24" maskUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="24" height="24" fill="#fff" />
            {BITE.map(([cx, cy]) => (
              <Circle key={`${cx}`} cx={cx} cy={cy} r={2.9} fill="#000" />
            ))}
          </Mask>
        ) : null}
      </Defs>
      <G
        fill="none"
        stroke={ink}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        mask={def.bite ? `url(#b${id})` : undefined}
      >
        {def.shape?.map((d) => <Path key={d} d={d} fill={shapeFill} fillOpacity={shapeOpacity} />)}
      </G>
      <G fill="none" stroke={detailInk} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {def.detail?.map((d) => <Path key={d} d={d} />)}
      </G>
      {def.dots?.map(([cx, cy, r]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={dotInk} />)}
    </Svg>
  );
});
