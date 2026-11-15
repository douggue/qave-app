import { Text as RNText, type TextProps } from 'react-native';

import { type as typeScale, type PaletteKey, type TypeVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export type TextTone = Extract<
  PaletteKey,
  'ink' | 'ink2' | 'mint' | 'neon' | 'amber' | 'grape' | 'sky' | 'hot' | 'onNeon' | 'onMint' | 'onGrape' | 'onHot' | 'toastInk'
>;

type Props = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  center?: boolean;
  /** Tabular digits for numbers that tick (timers, rep). */
  tabular?: boolean;
};

/** Themed text. Never set numberOfLines on body text: French runs ~20% longer. */
export function Text({ variant = 'body', tone = 'ink', center, tabular, style, ...rest }: Props) {
  const { c } = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={variant === 'display' || variant === 'title' ? 1.6 : 2.0}
      {...rest}
      style={[
        typeScale[variant],
        { color: c[tone] },
        center && { textAlign: 'center' },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}

/** A decorative system emoji (avatars only; use <Glyph> for everything else). Hidden from screen readers. */
export function Emoji({ children, size = 24, style, ...rest }: TextProps & { size?: number }) {
  const { c } = useTheme();
  return (
    <RNText
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      allowFontScaling={false}
      {...rest}
      style={[{ color: c.ink, fontSize: size, lineHeight: Math.round(size * 1.2), textAlign: 'center' }, style]}
    >
      {children}
    </RNText>
  );
}
