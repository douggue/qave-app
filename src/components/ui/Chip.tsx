import { Pressable, StyleSheet, View } from 'react-native';

import { glow, hitSlop, radius, tapComfort } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Emoji, Text } from './Text';

type Props = {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  /** glass over the map, solid on screens. */
  tone?: 'glass' | 'solid';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** 'radio' inside a radiogroup (theme picker); selected then reads as checked. */
  role?: 'button' | 'radio';
  /** The map chip row: a visible 40 pt pill with a 4 pt hit slop (48 pt to touch). */
  compact?: boolean;
};

const COMPACT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 } as const;

/** A pill that grows with its label. No fixed width, no truncation. */
export function Chip({
  label,
  icon,
  selected,
  onPress,
  tone = 'solid',
  accessibilityLabel,
  accessibilityHint,
  role = 'button',
  compact,
}: Props) {
  const { c, isNight } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={compact ? COMPACT_SLOP : hitSlop}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={role === 'radio' ? { checked: !!selected } : { selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.compact,
        { backgroundColor: tone === 'glass' ? c.glass : c.card, borderColor: c.line },
        selected && { backgroundColor: c.neon, borderColor: 'transparent' },
        selected && isNight && glow(c.neon, 12, 0.7),
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Emoji size={14}>{icon}</Emoji> : null}
        <Text variant="label" tone={selected ? 'onNeon' : 'ink'} style={styles.label}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: tapComfort,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  compact: { minHeight: 40, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  label: { flexShrink: 1 },
});
