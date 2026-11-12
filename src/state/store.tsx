import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { LiveSession, Mood, Report } from '@/data/types';

export type ThemeMode = 'auto' | 'night' | 'day';
export type FilterKey = 'all' | 'open' | 'mobile' | 'tacos' | 'bbq' | 'sweets' | 'asian' | 'popup' | 'cheap';

/** Local changes to a spot made in this session (reports, business go-live). */
export type SpotOverride = {
  x?: number;
  y?: number;
  open?: boolean;
  hot?: boolean;
  mood?: Mood | null;
};

export type LokalState = {
  hydrated: boolean;
  rep: number;
  /** Check-in count per spot id. */
  checkIns: Record<string, number>;
  reports: Report[];
  /** Your vote per report id. */
  votes: Record<string, 1 | -1>;
  /** Drop ids with a reminder on. */
  reminders: Record<string, true>;
  /** Last "Yep, still here" time per spot id. */
  stillHere: Record<string, number>;
  filter: FilterKey;
  themeMode: ThemeMode;
  bizMode: boolean;
  liveSession: LiveSession | null;
  overrides: Record<string, SpotOverride>;
  selectedSpot: string | null;
  reportOpen: boolean;
};

const initialState: LokalState = {
  hydrated: false,
  rep: 0,
  checkIns: {},
  reports: [],
  votes: {},
  reminders: {},
  stillHere: {},
  filter: 'all',
  themeMode: 'auto',
  bizMode: false,
  liveSession: null,
  overrides: {},
  selectedSpot: null,
  reportOpen: false,
};

type Persisted = Pick<LokalState, 'rep' | 'checkIns' | 'themeMode' | 'bizMode'>;

type Action =
  | { type: 'hydrate'; data: Partial<Persisted> }
  | { type: 'addRep'; amount: number }
  | { type: 'checkIn'; spotId: string; rep: number }
  | { type: 'addReport'; report: Report; mood?: Mood; rep: number }
  | { type: 'vote'; reportId: string; value: 1 | -1; rep: number }
  | { type: 'toggleReminder'; dropId: string }
  | { type: 'stillHere'; spotId: string; at: number; rep: number }
  | { type: 'setFilter'; filter: FilterKey }
  | { type: 'setThemeMode'; mode: ThemeMode }
  | { type: 'setBizMode'; on: boolean }
  | { type: 'setLiveSession'; session: LiveSession | null }
  | { type: 'overrideSpot'; spotId: string; patch: SpotOverride }
  | { type: 'selectSpot'; spotId: string | null }
  | { type: 'setReportOpen'; open: boolean };

function reducer(state: LokalState, action: Action): LokalState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.data, hydrated: true };
    case 'addRep':
      return { ...state, rep: state.rep + action.amount };
    case 'checkIn':
      return {
        ...state,
        rep: state.rep + action.rep,
        checkIns: { ...state.checkIns, [action.spotId]: (state.checkIns[action.spotId] ?? 0) + 1 },
      };
    case 'addReport': {
      const spotId = action.report.spotId;
      const overrides = action.mood
        ? { ...state.overrides, [spotId]: { ...state.overrides[spotId], mood: action.mood } }
        : state.overrides;
      return { ...state, rep: state.rep + action.rep, reports: [action.report, ...state.reports], overrides };
    }
    case 'vote': {
      const votes = { ...state.votes };
      if (votes[action.reportId] === action.value) delete votes[action.reportId];
      else votes[action.reportId] = action.value;
      return { ...state, votes, rep: state.rep + action.rep };
    }
    case 'toggleReminder': {
      const reminders = { ...state.reminders };
      if (reminders[action.dropId]) delete reminders[action.dropId];
      else reminders[action.dropId] = true;
      return { ...state, reminders };
    }
    case 'stillHere':
      return {
        ...state,
        rep: state.rep + action.rep,
        stillHere: { ...state.stillHere, [action.spotId]: action.at },
      };
    case 'setFilter':
      return { ...state, filter: action.filter };
    case 'setThemeMode':
      return { ...state, themeMode: action.mode };
    case 'setBizMode':
      return { ...state, bizMode: action.on, reportOpen: false };
    case 'setLiveSession':
      return { ...state, liveSession: action.session };
    case 'overrideSpot':
      return {
        ...state,
        overrides: { ...state.overrides, [action.spotId]: { ...state.overrides[action.spotId], ...action.patch } },
      };
    case 'selectSpot':
      return { ...state, selectedSpot: action.spotId };
    case 'setReportOpen':
      return { ...state, reportOpen: action.open };
    default:
      return state;
  }
}

const STORAGE_KEY = 'lokal.state.v1';

function makeActions(dispatch: (action: Action) => void) {
  return {
    addRep: (amount: number) => dispatch({ type: 'addRep', amount }),
    checkIn: (spotId: string, rep: number) => dispatch({ type: 'checkIn', spotId, rep }),
    addReport: (report: Report, rep: number, mood?: Mood) => dispatch({ type: 'addReport', report, rep, mood }),
    vote: (reportId: string, value: 1 | -1, rep = 0) => dispatch({ type: 'vote', reportId, value, rep }),
    toggleReminder: (dropId: string) => dispatch({ type: 'toggleReminder', dropId }),
    confirmStillHere: (spotId: string, rep: number) =>
      dispatch({ type: 'stillHere', spotId, at: Date.now(), rep }),
    setFilter: (filter: FilterKey) => dispatch({ type: 'setFilter', filter }),
    setThemeMode: (mode: ThemeMode) => dispatch({ type: 'setThemeMode', mode }),
    setBizMode: (on: boolean) => dispatch({ type: 'setBizMode', on }),
    setLiveSession: (session: LiveSession | null) => dispatch({ type: 'setLiveSession', session }),
    overrideSpot: (spotId: string, patch: SpotOverride) => dispatch({ type: 'overrideSpot', spotId, patch }),
    selectSpot: (spotId: string | null) => dispatch({ type: 'selectSpot', spotId }),
    openReport: () => dispatch({ type: 'setReportOpen', open: true }),
    closeReport: () => dispatch({ type: 'setReportOpen', open: false }),
  };
}

export type LokalActions = ReturnType<typeof makeActions>;
type StoreValue = { state: LokalState; actions: LokalActions };

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useMemo(() => makeActions(dispatch), []);

  // Load what we kept from last time. Storage can fail (private mode, full disk): start fresh then.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let data: Partial<Persisted> = {};
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) data = JSON.parse(raw) as Partial<Persisted>;
      } catch {
        data = {};
      }
      if (!cancelled) dispatch({ type: 'hydrate', data });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { hydrated, rep, checkIns, themeMode, bizMode } = state;
  useEffect(() => {
    if (!hydrated) return;
    const data: Persisted = { rep, checkIns, themeMode, bizMode };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {
      // Not saved this time; the next change tries again.
    });
  }, [hydrated, rep, checkIns, themeMode, bizMode]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}

/** Total check-ins across all spots. */
export const totalCheckIns = (state: LokalState) =>
  Object.values(state.checkIns).reduce((sum, n) => sum + n, 0);
