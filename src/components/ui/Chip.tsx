import { Pressable, StyleSheet, View } from 'react-native';

import { hitSlop, radius, tapComfort } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import type { GlyphSource } from '@/theme/glyphs';

import { Glyph } from './Glyph';
import { Sticker } from './Sticker';
import { Text } from './Text';

type Props = {
  label: string;
  /** An emoji key's glyph from src/theme/emoji.ts: a food sticker or a drawn icon. */
  icon?: GlyphSource;
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
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={compact ? COMPACT_SLOP : hitSlop}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={role === 'radio' ? { checked: !!selected } : { selected: !!selected }}
    >
      {({ pressed }) => (
        <Sticker
          radius={radius.pill}
          bg={selected ? c.neon : tone === 'glass' ? c.glass : c.card}
          line={selected ? c.ctaLine : undefined}
          dropColor={selected ? c.ctaDrop : undefined}
          drop={3}
          pressed={pressed}
          faceStyle={[styles.chip, compact && styles.compact]}
        >
          <View style={styles.row}>
            {icon ? <Glyph of={icon} size={14} color={selected ? c.onNeon : c.ink} plain /> : null}
            <Text variant="label" tone={selected ? 'onNeon' : 'ink'} style={styles.label}>
              {label}
            </Text>
          </View>
        </Sticker>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: tapComfort - 3,
    paddingHorizontal: 14,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  compact: { minHeight: 40, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  label: { flexShrink: 1, fontFamily: 'Figtree_700Bold' },
});
