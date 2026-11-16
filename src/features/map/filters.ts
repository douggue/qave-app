import { useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';

import { matchesFilter, useSpots } from '@/hooks/use-spots';
import { t, type StringKey } from '@/i18n';
import { useStore, type FilterKey } from '@/state/store';
import type { Glyph } from '@/theme/glyphs';

// The map filters. The category tiles in the panel are the only filter control (Mix).

/** Every filter with its full label (what the tiles read aloud). */
export const FILTERS: { key: FilterKey; label: StringKey }[] = [
  { key: 'all', label: 'filter.all' },
  { key: 'open', label: 'filter.open' },
  { key: 'mobile', label: 'filter.mobile' },
  { key: 'tacos', label: 'filter.tacos' },
  { key: 'bbq', label: 'filter.bbq' },
  { key: 'sweets', label: 'filter.sweets' },
  { key: 'asian', label: 'filter.asian' },
  { key: 'popup', label: 'filter.popup' },
  { key: 'cheap', label: 'filter.cheap' },
];

export const FILTER_LABEL = Object.fromEntries(FILTERS.map((f) => [f.key, f.label])) as Record<FilterKey, StringKey>;

/** Category tiles in the panel: food sticker for food filters, a drawn icon for the rest. */
export const TILES: { key: FilterKey; short: StringKey; glyph: Glyph }[] = [
  { key: 'all', short: 'tile.all', glyph: { icon: 'sparkle', tone: 'ink' } },
  { key: 'tacos', short: 'tile.tacos', glyph: { food: 'taco' } },
  { key: 'bbq', short: 'tile.bbq', glyph: { food: 'bbq' } },
  { key: 'asian', short: 'tile.asian', glyph: { food: 'pho' } },
  { key: 'sweets', short: 'tile.sweets', glyph: { food: 'croissant' } },
  { key: 'open', short: 'tile.open', glyph: { icon: 'live', tone: 'mint' } },
  { key: 'mobile', short: 'tile.mobile', glyph: { icon: 'truck', tone: 'sky' } },
  { key: 'popup', short: 'tile.popup', glyph: { icon: 'tent', tone: 'grape' } },
  { key: 'cheap', short: 'tile.cheap', glyph: { icon: 'cash', tone: 'mint' } },
];

/** Set the store filter and announce how many spots match it. */
export function usePickFilter() {
  const { actions } = useStore();
  const spots = useSpots();
  return useCallback(
    (key: FilterKey) => {
      actions.setFilter(key);
      const n = spots.filter((s) => matchesFilter(s, key)).length;
      AccessibilityInfo.announceForAccessibility(t('filter.announce', { n, filter: t(FILTER_LABEL[key]) }));
    },
    [actions, spots],
  );
}
