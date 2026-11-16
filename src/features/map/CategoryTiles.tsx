import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Glyph, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/use-theme';

import { FILTER_LABEL, TILES, usePickFilter } from './filters';

const TILE = 64;

/**
 * A horizontal row of sticker category tiles: the map's only filter control (Mix). The
 * selected tile gets the yellow ring (ink by day); pins that do not match fade.
 */
export function CategoryTiles() {
  const { c } = useTheme();
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
                { backgroundColor: selected ? c.tileOn : c.tile, borderColor: selected ? c.tileRing : 'transparent' },
              ]}
            >
              <Glyph of={tile.glyph} size={'food' in tile.glyph ? 41 : 28} />
            </View>
            <Text variant="caption" tone={selected ? 'ink' : 'ink2'} center style={styles.label}>
              {t(tile.short)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -20, flexGrow: 0 },
  row: { paddingHorizontal: 20, gap: 10 },
  tile: { width: 68, minHeight: 88, alignItems: 'center', gap: 6 },
  label: { fontSize: 11.5, lineHeight: 15 },
  square: {
    width: TILE,
    height: TILE,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});
