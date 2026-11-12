import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { getBusiness, getNotes } from '@/data/repo';
import type { ClockTime, LiveSession, LiveStatusId, Mood, Note, Report, ReportType, Stop, Until } from '@/data/types';
import { t } from '@/i18n';
import type { MoodEmojiKey } from '@/theme/emoji';

export type ThemeMode = 'auto' | 'night' | 'day';
export type FilterKey = 'all' | 'open' | 'mobile' | 'tacos' | 'bbq' | 'sweets' | 'asian' | 'popup' | 'cheap';

/** Local changes to a spot made in this session (reports, business go-live). */
export type SpotOverride = {
  x?: number;
  y?: number;
  open?: boolean;
  hot?: boolean;
  mood?: Mood | null;
  /** Serving-until time set when a business goes live. */
  until?: Until;
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
  /** Bumped by focusSpot so the map re-centers even when the spot is already selected. */
  focusSeq: number;
  reportOpen: boolean;
  /** When you checked in at each spot this session (not persisted). */
  hereAt: Record<string, number>;
  /** Report ids you have voted on at least once (first vote gives rep). */
  voted: Record<string, true>;
  /** The celebration playing now (rain, rep burst, emoji float). */
  fx: Fx | null;
  /** Claimed drop codes per drop id (this session only). */
  claims: Record<string, { code: string; at: number }>;
  /** Inbox notes added this session (go-live), newest first. Sample notes come from repo. */
  notes: Note[];
  /** Note ids read this session (sample or added). */
  readNotes: Record<string, true>;
  /** The business Go live sheet is open. */
  goLiveOpen: boolean;
};

/** A one-off celebration. `id` changes each time so hosts can restart. */
export type Fx = {
  id: number;
  kind: 'checkIn' | 'report' | 'goLive';
  spotId: string;
  /** Report type for the float and burst emoji. */
  report?: ReportType;
  rep: number;
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
  focusSeq: 0,
  reportOpen: false,
  hereAt: {},
  voted: {},
  fx: null,
  claims: {},
  notes: [],
  readNotes: {},
  goLiveOpen: false,
};

type Persisted = Pick<LokalState, 'rep' | 'checkIns' | 'themeMode' | 'bizMode'>;

type Action =
  | { type: 'hydrate'; data: Partial<Persisted> }
  | { type: 'addRep'; amount: number }
  | { type: 'checkIn'; spotId: string; rep: number; at: number }
  | { type: 'celebrate'; fx: Omit<Fx, 'id'> }
  | { type: 'clearFx'; id: number }
  | { type: 'addReport'; report: Report; mood?: Mood; rep: number }
  | { type: 'vote'; reportId: string; value: 1 | -1; rep: number }
  | { type: 'toggleReminder'; dropId: string }
  | { type: 'claimDrop'; dropId: string; code: string; at: number; rep: number }
  | { type: 'stillHere'; spotId: string; at: number; rep: number }
  | { type: 'setFilter'; filter: FilterKey }
  | { type: 'setThemeMode'; mode: ThemeMode }
  | { type: 'setBizMode'; on: boolean }
  | { type: 'setLiveSession'; session: LiveSession | null }
  | { type: 'overrideSpot'; spotId: string; patch: SpotOverride }
  | { type: 'selectSpot'; spotId: string | null }
  | { type: 'focusSpot'; spotId: string }
  | { type: 'setReportOpen'; open: boolean }
  | { type: 'setGoLiveOpen'; open: boolean }
  | { type: 'goLive'; session: LiveSession; stop: Stop; note: Note }
  | { type: 'setLiveStatus'; status: LiveStatusId | null }
  | { type: 'endService' }
  | { type: 'readNotes'; ids: string[] };

/** What customers see on the pin for each owner quick status (04 spec 2.4). */
const STATUS_MOOD: Record<LiveStatusId, { emoji: MoodEmojiKey; key: Mood['key'] }> = {
  wait15: { emoji: 'wait', key: 'mood.wait15' },
  closing30: { emoji: 'closing', key: 'mood.closing30' },
  soldOut: { emoji: 'soldOut', key: 'mood.soldOut' },
  closed: { emoji: 'closed', key: 'mood.closed' },
};
const JUST_PARKED: Mood = { emoji: 'parked', key: 'mood.justParked' };

function patchSpot(state: LokalState, spotId: string, patch: SpotOverride): LokalState['overrides'] {
  return { ...state.overrides, [spotId]: { ...state.overrides[spotId], ...patch } };
}

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
        hereAt: { ...state.hereAt, [action.spotId]: action.at },
      };
    case 'celebrate':
      return { ...state, fx: { ...action.fx, id: (state.fx?.id ?? 0) + 1 } };
    case 'clearFx':
      return state.fx?.id === action.id ? { ...state, fx: null } : state;
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
      // Only the first vote on a report earns rep; changing it later is free.
      const first = !state.voted[action.reportId];
      return {
        ...state,
        votes,
        voted: first ? { ...state.voted, [action.reportId]: true } : state.voted,
        rep: state.rep + (first ? action.rep : 0),
      };
    }
    case 'toggleReminder': {
      const reminders = { ...state.reminders };
      if (reminders[action.dropId]) delete reminders[action.dropId];
      else reminders[action.dropId] = true;
      return { ...state, reminders };
    }
    case 'claimDrop':
      // Once per drop: a second claim keeps the first code.
      if (state.claims[action.dropId]) return state;
      return {
        ...state,
        rep: state.rep + action.rep,
        claims: { ...state.claims, [action.dropId]: { code: action.code, at: action.at } },
      };
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
      return { ...state, bizMode: action.on, reportOpen: false, goLiveOpen: false };
    case 'setLiveSession':
      return { ...state, liveSession: action.session };
    case 'overrideSpot':
      return {
        ...state,
        overrides: { ...state.overrides, [action.spotId]: { ...state.overrides[action.spotId], ...action.patch } },
      };
    case 'selectSpot':
      return { ...state, selectedSpot: action.spotId };
    case 'focusSpot':
      return { ...state, selectedSpot: action.spotId, focusSeq: state.focusSeq + 1, filter: 'all' };
    case 'setReportOpen':
      return { ...state, reportOpen: action.open };
    case 'setGoLiveOpen':
      return { ...state, goLiveOpen: action.open };
    case 'goLive': {
      const { session, stop, note } = action;
      return {
        ...state,
        goLiveOpen: false,
        liveSession: session,
        overrides: patchSpot(state, session.spotId, {
          x: stop.x,
          y: stop.y,
          open: true,
          hot: true,
          mood: JUST_PARKED,
          until: session.until === 'soldOut' ? { key: 'until.soldOut' } : session.until,
        }),
        notes: [note, ...state.notes],
      };
    }
    case 'setLiveStatus': {
      const live = state.liveSession;
      if (!live) return state;
      // Tapping the selected status again clears it (back to "Just parked").
      const status = live.status === action.status ? null : action.status;
      const mood = status ? { emoji: STATUS_MOOD[status].emoji, key: STATUS_MOOD[status].key } : JUST_PARKED;
      return {
        ...state,
        liveSession: { ...live, status },
        overrides: patchSpot(state, live.spotId, { mood, open: status !== 'closed', hot: status === null }),
      };
    }
    case 'endService': {
      const live = state.liveSession;
      if (!live) return state;
      // The truck stays where it parked; it is just closed now.
      return {
        ...state,
        liveSession: null,
        overrides: patchSpot(state, live.spotId, { open: false, hot: false, mood: null }),
      };
    }
    case 'readNotes': {
      const readNotes = { ...state.readNotes };
      action.ids.forEach((id) => (readNotes[id] = true));
      return { ...state, readNotes };
    }
    default:
      return state;
  }
}

const STORAGE_KEY = 'lokal.state.v1';

function makeActions(dispatch: (action: Action) => void) {
  return {
    addRep: (amount: number) => dispatch({ type: 'addRep', amount }),
    checkIn: (spotId: string, rep: number) => dispatch({ type: 'checkIn', spotId, rep, at: Date.now() }),
    celebrate: (fx: Omit<Fx, 'id'>) => dispatch({ type: 'celebrate', fx }),
    clearFx: (id: number) => dispatch({ type: 'clearFx', id }),
    addReport: (report: Report, rep: number, mood?: Mood) => dispatch({ type: 'addReport', report, rep, mood }),
    vote: (reportId: string, value: 1 | -1, rep = 0) => dispatch({ type: 'vote', reportId, value, rep }),
    toggleReminder: (dropId: string) => dispatch({ type: 'toggleReminder', dropId }),
    claimDrop: (dropId: string, code: string, rep = 0) =>
      dispatch({ type: 'claimDrop', dropId, code, rep, at: Date.now() }),
    confirmStillHere: (spotId: string, rep: number) =>
      dispatch({ type: 'stillHere', spotId, at: Date.now(), rep }),
    setFilter: (filter: FilterKey) => dispatch({ type: 'setFilter', filter }),
    setThemeMode: (mode: ThemeMode) => dispatch({ type: 'setThemeMode', mode }),
    setBizMode: (on: boolean) => dispatch({ type: 'setBizMode', on }),
    setLiveSession: (session: LiveSession | null) => dispatch({ type: 'setLiveSession', session }),
    overrideSpot: (spotId: string, patch: SpotOverride) => dispatch({ type: 'overrideSpot', spotId, patch }),
    selectSpot: (spotId: string | null) => dispatch({ type: 'selectSpot', spotId }),
    /** Select a spot and ask the map to center it (Ask, Drops, inbox). Clears the filter. */
    focusSpot: (spotId: string) => dispatch({ type: 'focusSpot', spotId }),
    openReport: () => dispatch({ type: 'setReportOpen', open: true }),
    closeReport: () => dispatch({ type: 'setReportOpen', open: false }),
    openGoLive: () => dispatch({ type: 'setGoLiveOpen', open: true }),
    closeGoLive: () => dispatch({ type: 'setGoLiveOpen', open: false }),
    /** Owner goes live at a saved stop: moves the pin, opens it, says "Just parked" and adds an inbox note. */
    goLive: (stop: Stop, until: ClockTime | 'soldOut') => {
      const biz = getBusiness();
      const at = Date.now();
      dispatch({
        type: 'goLive',
        stop,
        session: { spotId: biz.spotId, stopId: stop.id, until, startedAt: at, status: null },
        note: {
          id: `n-live-${at}`,
          emoji: 'live',
          tint: '#d8f6ea',
          text: t('note.wentLive', { name: biz.name, place: stop.name }),
          ago: t('note.justNow'),
          go: biz.spotId,
          unread: true,
          createdAt: at,
        },
      });
    },
    setLiveStatus: (status: LiveStatusId | null) => dispatch({ type: 'setLiveStatus', status }),
    endService: () => dispatch({ type: 'endService' }),
    readNotes: (ids: string[]) => dispatch({ type: 'readNotes', ids }),
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

/** Sample notes plus the ones added this session, newest first, with this session's read state. */
export const useNotes = (): Note[] => {
  const { notes, readNotes } = useStore().state;
  return useMemo(
    () => [...notes, ...getNotes()].map((n) => (readNotes[n.id] ? { ...n, unread: false } : n)),
    [notes, readNotes],
  );
};
