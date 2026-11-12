import { Platform } from 'react-native';

import type { Spot } from './types';

/** A maps URL for the spot's (fictional) coordinates. On web it opens Google Maps in a new tab. */
export function directionsUrl(spot: Pick<Spot, 'lat' | 'lng' | 'name'>): string {
  const ll = `${spot.lat},${spot.lng}`;
  const name = encodeURIComponent(spot.name);
  if (Platform.OS === 'ios') return `http://maps.apple.com/?ll=${ll}&q=${name}`;
  if (Platform.OS === 'android') return `geo:${ll}?q=${ll}(${name})`;
  return `https://www.google.com/maps/search/?api=1&query=${ll}`;
}
