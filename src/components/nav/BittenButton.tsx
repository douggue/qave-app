import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';

import { gradients } from '@/theme/tokens';

// The three teeth of the app icon and the splash pin (animated-splash.tsx TEETH, on the pin's
// circle centered at 50,50 with radius 46): tooth centers and radius as fractions of the radius.
const TEETH = [
  [29 / 46, -46 / 46],
  [44 / 46, -35 / 46],
  [51 / 46, -18 / 46],
] as const;
const TOOTH = 12 / 46;

/**
 * The signature: a brand-gradient circle with the three-tooth bite cut out of its top-right edge,
 * and a soft warm glow under it (with the selected pin, the only glow in the app). One SVG with a
 * mask, so the bite looks the same on iOS, Android and the web. Decorative: place it absolutely
 * behind the button's icon; it extends `pad` points around the circle for the glow.
 */
export function BittenButton({ size, pad = Math.round(size * 0.36) }: { size: number; pad?: number }) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, '');
  const r = size / 2;
  const box = size + pad * 2;
  const cx = pad + r;
  return (
    <Svg
      width={box}
      height={box}
      style={[styles.svg, { left: -pad, top: -pad }]}
      pointerEvents="none"
      accessible={false}
    >
      <Defs>
        <LinearGradient id={`g${id}`} x1={pad} y1={pad} x2={pad + size} y2={pad + size} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={gradients.brand[0]} />
          <Stop offset="0.55" stopColor={gradients.brand[1]} />
          <Stop offset="1" stopColor={gradients.brand[2]} />
        </LinearGradient>
        <RadialGradient id={`h${id}`} cx={cx} cy={cx + r * 0.3} r={r + pad * 0.9} gradientUnits="userSpaceOnUse">
          <Stop offset="0.5" stopColor="#ff3c50" stopOpacity={0.42} />
          <Stop offset="1" stopColor="#ff3c50" stopOpacity={0} />
        </RadialGradient>
        {/* The bite cuts only inside the button's edge, so the glow around it stays whole. */}
        <Mask id={`m${id}`} x="0" y="0" width={box} height={box} maskUnits="userSpaceOnUse">
          <Rect x="0" y="0" width={box} height={box} fill="#fff" />
          {TEETH.map(([dx, dy]) => (
            <Circle key={dx} cx={cx + dx * r} cy={cx + dy * r} r={TOOTH * r} fill="#000" />
          ))}
          <Circle cx={cx} cy={cx} r={r + 0.5 + pad} fill="none" stroke="#fff" strokeWidth={pad * 2} />
        </Mask>
      </Defs>
      <G mask={`url(#m${id})`}>
        <Circle cx={cx} cy={cx + r * 0.3} r={r + pad * 0.9} fill={`url(#h${id})`} />
        <Circle cx={cx} cy={cx} r={r} fill={`url(#g${id})`} />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: { position: 'absolute' },
});
