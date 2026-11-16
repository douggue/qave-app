import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Glyph, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { glow } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { FILTER_LABEL, TILES, usePickFilter } from './filters';

const TILE = 64;

/**
 * A horizontal row of sticker category tiles (Baemin style). Each sets the same store filter
 * as the chips over the map, so both always show the same selection.
 */
export function CategoryTiles() {
  const { c, isNight } = useTheme();
  const { filter } = useStore().state;
  const pick = usePickFilter();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
      accessibilityLabel={t('tiles.a11y')}
    >
      {TILES.map((tile) => {
        const selected = filter === tile.key;
        return (
          <Pressable
            key={tile.key}
            onPress={() => pick(tile.key)}
            accessibilityRole="button"
            accessibilityLabel={t(FILTER_LABEL[tile.key])}
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.square,
                // Day paper is near card2, so day tiles sit on white with a hairline.
                { backgroundColor: isNight ? c.card2 : c.card, borderColor: isNight ? 'transparent' : c.line },
                selected && { backgroundColor: c.tintNeon, borderColor: c.neon },
                selected && isNight && glow(c.neon, 10, 0.55),
              ]}
            >
              <Glyph of={tile.glyph} size={'food' in tile.glyph ? 40 : 30} />
            </View>
            <Text variant="caption" tone={selected ? 'ink' : 'ink2'} center>
              {t(tile.short)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -16, flexGrow: 0 },
  row: { paddingHorizontal: 16, paddingVertical: 4, gap: 8 },
  tile: { width: 72, minHeight: 88, alignItems: 'center', gap: 6 },
  square: {
    width: TILE,
    height: TILE,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});
