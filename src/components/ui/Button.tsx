import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { minTap } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import type { GlyphSource } from '@/theme/glyphs';

import { Glyph } from './Glyph';
import { Sticker } from './Sticker';
import { Text, type TextTone } from './Text';

/**
 * `primary` is the sun-yellow main action (both modes); `soft` the secondary (card face, outline);
 * `ghost` a quiet outlined button with no drop. `danger` is an outlined chili button for
 * destructive actions; `dangerSolid` confirms one. `mint` is the business Go live color.
 */
type Variant = 'primary' | 'mint' | 'ghost' | 'soft' | 'danger' | 'dangerSolid';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  /** An emoji key's glyph from src/theme/emoji.ts, drawn in the label color. */
  icon?: GlyphSource;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  fullWidth?: boolean;
  /** 'switch' for on/off buttons such as Remind me; pass `checked` with it. */
  role?: 'button' | 'switch';
  checked?: boolean;
  style?: StyleProp<ViewStyle>;
};

const labelTone: Record<Variant, TextTone> = {
  primary: 'onNeon',
  mint: 'onMint',
  ghost: 'ink',
  soft: 'ink',
  danger: 'hot',
  dangerSolid: 'onNeon',
};

/** Buttons grow taller when a label wraps (French), never clip. Minimum 44 pt. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = true,
  role = 'button',
  checked,
  style,
}: Props) {
  const { c } = useTheme();
  const md = size === 'md';
  const face: Record<Variant, { bg: string; line?: string; drop?: number; dropColor?: string }> = {
    primary: { bg: c.neon, line: c.ctaLine, dropColor: c.ctaDrop },
    mint: { bg: c.mintFill, line: c.ctaLine, dropColor: c.ctaDrop },
    soft: { bg: c.card },
    ghost: { bg: 'transparent', line: c.line2, drop: 0 },
    danger: { bg: c.card, line: c.hot },
    dangerSolid: { bg: c.hotFill, line: c.ctaLine, dropColor: c.ctaDrop },
  };
  const f = face[variant];

  const content = (
    <View style={[styles.row, { gap: md ? 8 : 6 }]}>
      {icon ? <Glyph of={icon} size={md ? 16.5 : 15} color={c[labelTone[variant]]} plain strokeWidth={2.6} /> : null}
      <Text variant="ui" tone={labelTone[variant]} center style={[styles.label, md ? styles.labelMd : styles.labelSm]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={role === 'switch' ? { disabled: !!disabled, checked: !!checked } : { disabled: !!disabled }}
      style={[fullWidth ? styles.full : styles.auto, disabled && styles.disabled, style]}
    >
      {({ pressed }) => (
        <Sticker
          radius={md ? 18 : 14}
          bg={f.bg}
          line={f.line}
          drop={f.drop ?? (md ? 5 : 4)}
          dropColor={f.dropColor}
          pressed={pressed && !disabled}
          faceStyle={[
            styles.body,
            { minHeight: md ? 52 : minTap, paddingHorizontal: md ? 20 : 14, paddingVertical: md ? 12 : 9 },
          ]}
        >
          {content}
        </Sticker>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  disabled: { opacity: 0.45 },
  body: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  label: { flexShrink: 1 },
  labelMd: { fontSize: 16, lineHeight: 21 },
  labelSm: { fontSize: 14, lineHeight: 19 },
});
