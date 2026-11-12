import { useClock } from '@/hooks/use-clock';
import { useHydrated } from '@/hooks/use-hydrated';
import { useStore } from '@/state/store';

import { mapPalettes, palettes, type MapPalette, type Palette } from './tokens';

export type ResolvedMode = 'night' | 'day';

/** Night from 7pm to 7am. */
export const isNightHour = (hour: number) => hour >= 19 || hour < 7;

/** The palette for the current theme mode. Auto follows the device clock, checked once a minute. */
export function useTheme(): { mode: ResolvedMode; isNight: boolean; c: Palette; map: MapPalette } {
  const { themeMode } = useStore().state;
  const now = useClock(60_000);
  const hydrated = useHydrated();
  // Auto is night until hydrated: the hero look, and the same on the web pre-render and the client.
  const auto: ResolvedMode = !hydrated || isNightHour(new Date(now).getHours()) ? 'night' : 'day';
  const mode: ResolvedMode = themeMode === 'auto' ? auto : themeMode;
  return { mode, isNight: mode === 'night', c: palettes[mode], map: mapPalettes[mode] };
}
