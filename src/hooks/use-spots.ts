import { useMemo } from 'react';

import { getReports, getSpots } from '@/data/repo';
import type { Report, Spot } from '@/data/types';
import { useStore, type FilterKey } from '@/state/store';

/** Sample spots with this session's local changes applied (reports, go-live moves). */
export function useSpots(): Spot[] {
  const { overrides } = useStore().state;
  return useMemo(
    () =>
      getSpots().map((spot) => {
        const o = overrides[spot.id];
        if (!o) return spot;
        return {
          ...spot,
          x: o.x ?? spot.x,
          y: o.y ?? spot.y,
          open: o.open ?? spot.open,
          hot: o.hot ?? spot.hot,
          mood: o.mood !== undefined ? o.mood : spot.mood,
        };
      }),
    [overrides],
  );
}

/** Sample reports plus the ones added this session, newest first. */
export function useAllReports(): Report[] {
  const { reports } = useStore().state;
  return useMemo(() => [...reports, ...getReports()], [reports]);
}

export function matchesFilter(spot: Spot, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'open':
      return spot.open;
    case 'mobile':
      return spot.kind === 'truck' || spot.kind === 'cart' || spot.kind === 'trailer';
    case 'popup':
      return spot.kind === 'popup' || spot.category === 'popup';
    case 'cheap':
      return spot.price === 1;
    default:
      return spot.category === filter;
  }
}
