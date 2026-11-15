import { memo } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { avatar } from '@/theme/emoji';
import { resolveGlyph, toneColor, type GlyphSource, type GlyphTone } from '@/theme/glyphs';
import { palettes } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { FoodSticker } from './FoodSticker';
import { BRAND_TINT, Icon } from './Icon';
import { Emoji } from './Text';

type Props = {
  /** An emoji from src/theme/emoji.ts, or a glyph from src/theme/glyphs.ts. */
  of: GlyphSource;
  /** The emoji font size this replaces: drawn icons get a box about 15% larger, like an emoji's ink. */
  size: number;
  /**
   * Line color for plain icons (controls). Semantic icons (moods, reports, statuses) keep their
   * own tint unless `plain` is set, then they take this color too.
   */
  color?: string;
  plain?: boolean;
  /** Tint for icons that have no semantic tone of their own (big placeholder art). */
  tone?: GlyphTone;
  /** Semantic colors for a surface that does not follow the theme: the toast is 'inverse', the report radial 'night'. */
  palette?: 'night' | 'day' | 'inverse';
  strokeWidth?: number;
  dim?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * One way to draw any icon from our emoji maps: a custom food sticker, a drawn icon (tinted in
 * its semantic color for moods, reports and statuses), or the emoji itself for avatars and
 * anything unmapped. Decorative: hidden from screen readers; the parent label carries meaning.
 */
export const Glyph = memo(function Glyph({ of, size, color, plain, tone, palette, strokeWidth, dim, style }: Props) {
  const { c, isNight } = useTheme();
  const glyph = resolveGlyph(of);

  if (glyph && 'food' in glyph) {
    return (
      <View aria-hidden importantForAccessibility="no-hide-descendants" style={style}>
        <FoodSticker food={glyph.food} size={size} dim={dim} />
      </View>
    );
  }

  if (glyph && 'icon' in glyph) {
    const pal = !palette ? c : palettes[palette === 'inverse' ? (isNight ? 'day' : 'night') : palette];
    const t = plain ? undefined : (glyph.tone ?? tone);
    const tint = t ? toneColor(t, pal) : undefined;
    const box = Math.round(size * 1.15);
    return (
      <View
        aria-hidden
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[{ width: box, height: box }, dim && { opacity: 0.55 }, style]}
      >
        <Icon
          name={glyph.icon}
          size={box}
          color={color ?? pal.ink}
          tint={tint === 'brand' ? BRAND_TINT : tint}
          strokeWidth={strokeWidth ?? (box <= 16 ? 2.6 : 2.3)}
        />
      </View>
    );
  }

  const text = glyph && 'avatar' in glyph ? avatar[glyph.avatar] : typeof of === 'string' ? of : '';
  return (
    <Emoji size={size} style={[dim && { opacity: 0.55 }, style as StyleProp<TextStyle>]}>
      {text}
    </Emoji>
  );
});
