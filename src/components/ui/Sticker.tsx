import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/use-theme';

type Props = {
  children?: ReactNode;
  radius?: number;
  /** Face color. Defaults to the card color. */
  bg?: string;
  /** Outline color; defaults to the theme's sticker outline. */
  line?: string;
  lineWidth?: number;
  /** Drop depth in points (0 for none); defaults to the theme's 5 pt. */
  drop?: number;
  dropColor?: string;
  /** Layout of the whole sticker (size, margins, flex). */
  style?: StyleProp<ViewStyle>;
  /** Layout inside the face (padding, gap, alignment). */
  faceStyle?: StyleProp<ViewStyle>;
  /** Pressed: the face sinks into its drop, like pressing a sticker down. */
  pressed?: boolean;
  /** Clip the face's content to its rounded corners (art that bleeds to the edge). */
  clip?: boolean;
};

/**
 * The Mix sticker anatomy: a rounded face with an outline, and a hard drop straight down drawn
 * as a sibling view behind it (same radius), so it looks the same on iOS, Android and the web.
 * Day: 2 pt ink outline and ink drop. Night: 1.5 pt white-14% outline and a black drop.
 */
export function Sticker({
  children,
  radius = 22,
  bg,
  line,
  lineWidth,
  drop,
  dropColor,
  style,
  faceStyle,
  pressed,
  clip,
}: Props) {
  const { c, st } = useTheme();
  const d = drop ?? st.drop;
  const push = pressed ? Math.min(3, d) : 0;
  return (
    <View style={[{ paddingBottom: d }, style]}>
      {d > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.drop, { top: d, borderRadius: radius, backgroundColor: dropColor ?? c.stickerDrop }]}
        />
      ) : null}
      <View
        style={[
          styles.face,
          {
            borderRadius: radius,
            borderWidth: lineWidth ?? st.line,
            borderColor: line ?? c.stickerLine,
            backgroundColor: bg ?? c.card,
          },
          clip && styles.clip,
          push ? { transform: [{ translateY: push }] } : null,
          faceStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/** Split a style into what belongs on the whole sticker (layout) and what belongs on its face. */
const OUTER_KEYS = new Set([
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'width',
  'minWidth',
  'maxWidth',
  'alignSelf',
  'opacity',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'transform',
  'zIndex',
]);

export function splitStickerStyle(style: StyleProp<ViewStyle>): { outer: ViewStyle; face: ViewStyle } {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const face: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flat)) (OUTER_KEYS.has(k) ? outer : face)[k] = v;
  return { outer: outer as ViewStyle, face: face as ViewStyle };
}

const styles = StyleSheet.create({
  drop: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  face: { flexGrow: 1 },
  clip: { overflow: 'hidden' },
});
