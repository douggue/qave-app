// The only data entry point for screens. Tonight it reads the fictional sample;
// later each function becomes a Supabase query with the same return shape.

import { B, DROPS, ME, NOTES, PEOPLE, REPORTS, SPOTS, STATUSES, TICKS, WORLD } from './sample';
import type { Business, Drop, LiveStatus, Note, Person, Report, Spot, Tick } from './types';

export { ME, WORLD };

export const getSpots = (): Spot[] => SPOTS;
export const getSpot = (id: string): Spot | undefined => SPOTS.find((s) => s.id === id);
export const getReports = (spotId?: string): Report[] =>
  spotId ? REPORTS.filter((r) => r.spotId === spotId) : REPORTS;
export const getDrops = (): Drop[] => DROPS;
export const getNotes = (): Note[] => NOTES;
export const getPeople = (): Person[] => PEOPLE;
export const getTicks = (): Tick[] => TICKS;
export const getBusiness = (): Business => B;
export const getStatuses = (): LiveStatus[] => STATUSES;
