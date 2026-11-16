import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { gradients, radius as radii } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { splitStickerStyle, Sticker } from './Sticker';

type Props = {
  children: ReactNode;
  /** `live` outlines the card in mint (serving now), `hot` in chili, `ai` tints it grape. */
  variant?: 'default' | 'ai' | 'live' | 'hot';
  /** Face color instead of the card color. */
  bg?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A themed surface in the sticker anatomy (outline plus hard drop). Content stacks in a column
 * with a 10 pt gap. Layout styles (margins, flex, width) go on the whole sticker, the rest on its face.
 */
export function Card({ children, variant = 'default', bg, radius = radii.lg, style }: Props) {
  const { c } = useTheme();
  const { outer, face } = splitStickerStyle(style);
  const line = variant === 'live' ? c.mint : variant === 'hot' ? c.hotFill : undefined;
  return (
    <Sticker
      radius={radius}
      bg={bg ?? c.card}
      line={line}
      style={outer}
      faceStyle={[styles.face, face]}
      clip={variant === 'ai'}
    >
      {variant === 'ai' ? (
        <LinearGradient
          colors={gradients.aiCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </Sticker>
  );
}

const styles = StyleSheet.create({
  face: { padding: 16, gap: 10 },
});
