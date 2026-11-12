import { Pressable, StyleSheet, View } from 'react-native';

import { glow, radius } from '@/theme/tokens';
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
};

/** A pill that grows with its label. No fixed width, no truncation. */
export function Chip({ label, icon, selected, onPress, tone = 'solid', accessibilityLabel, accessibilityHint }: Props) {
  const { c, isNight } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
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
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  label: { flexShrink: 1 },
});
