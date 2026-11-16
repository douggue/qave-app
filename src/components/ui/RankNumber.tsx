import { StyleSheet, Text as RNText, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/use-theme';

/** Offsets for the stroke copies: a ring of eight around the fill, at the stroke width. */
const RING = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

/**
 * A Top 10 rank: Unbounded 800, sun-yellow with a dark stroke. React Native text has no stroke,
 * so the stroke is eight dark copies offset around the yellow one (same on every platform).
 * Decorative: the card's label already says "Number 1".
 */
export function RankNumber({ n, size = 54, style }: { n: number; size?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const w = Math.max(2, Math.round(size / 22));
  const text = String(n);
  const base = { fontSize: size, lineHeight: Math.round(size * 1.08) };
  return (
    <View
      style={[styles.wrap, style]}
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {RING.map(([dx, dy]) => (
        <RNText
          key={`${dx}${dy}`}
          allowFontScaling={false}
          style={[
            styles.num,
            styles.abs,
            base,
            { color: c.rankStroke, transform: [{ translateX: dx * w }, { translateY: dy * w }] },
          ]}
        >
          {text}
        </RNText>
      ))}
      <RNText allowFontScaling={false} style={[styles.num, base, { color: c.sun }]}>
        {text}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
  num: { fontFamily: 'Unbounded_800ExtraBold', letterSpacing: -1 },
  abs: { position: 'absolute', left: 0, top: 0 },
});
