import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { glow, gradients, minTap, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Emoji, Text, type TextTone } from './Text';

type Variant = 'primary' | 'mint' | 'ghost' | 'soft';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  fullWidth?: boolean;
  /** 'switch' for on/off buttons such as Remind me; pass `checked` with it. */
  role?: 'button' | 'switch';
  checked?: boolean;
  style?: StyleProp<ViewStyle>;
};

const labelTone: Record<Variant, TextTone> = { primary: 'onHot', mint: 'onMint', ghost: 'ink', soft: 'ink' };

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
  const { c, isNight } = useTheme();
  const reduceMotion = useReduceMotion();
  const md = size === 'md';
  const shape = {
    minHeight: md ? 50 : minTap,
    paddingHorizontal: md ? 20 : 14,
    paddingVertical: md ? 12 : 10,
    borderRadius: md ? radius.md : 14,
  };

  const content = (
    <View style={[styles.row, { gap: md ? 8 : 6 }]}>
      {icon ? <Emoji size={md ? 18 : 16}>{icon}</Emoji> : null}
      <Text variant={md ? 'ui' : 'label'} tone={labelTone[variant]} center style={styles.label}>
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
      style={({ pressed }) => [
        fullWidth ? styles.full : styles.auto,
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.9, transform: reduceMotion ? [] : [{ scale: 0.97 }] },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={gradients.hotBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.body, shape, isNight && glow('#ff3c50', 12, 0.45)]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.body,
            shape,
            variant === 'mint' && { backgroundColor: c.mintFill },
            variant === 'mint' && isNight && glow(c.mint, 12, 0.45),
            variant === 'ghost' && { borderWidth: 1.5, borderColor: c.line },
            variant === 'soft' && { backgroundColor: c.card2, borderWidth: 1, borderColor: c.line },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  body: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  label: { flexShrink: 1 },
});
