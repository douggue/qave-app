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
      maxFontSizeMultiplier={1.6}
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

/** A decorative emoji: hidden from screen readers, the parent label carries the meaning. */
export function Emoji({ children, size = 24, style, ...rest }: TextProps & { size?: number }) {
  return (
    <RNText
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      allowFontScaling={false}
      {...rest}
      style={[{ fontSize: size, lineHeight: Math.round(size * 1.2), textAlign: 'center' }, style]}
    >
      {children}
    </RNText>
  );
}
