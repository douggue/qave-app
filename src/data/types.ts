import type { StringKey } from '@/i18n';
import type {
  AvatarKey,
  FoodKey,
  KindKey,
  MoodEmojiKey,
  NoteEmojiKey,
  ReportEmojiKey,
  StatusEmojiKey,
} from '@/theme/emoji';

// Shapes mirror the planned Supabase tables (DEVELOPMENT_PLAN.md), so the sample
// data module can be swapped for real queries without touching screens.

export type SpotKind = KindKey;
export type SpotCategory = 'tacos' | 'bbq' | 'sweets' | 'asian' | 'burgers' | 'caribbean' | 'popup';

/** A local clock time. `day` (0 = Sunday) is set for a time on another day. */
export type ClockTime = { h: number; m: number; day?: number };
export type Until = ClockTime | { key: 'until.soldOut' | 'until.sunset' };

/** Moods are data: an emoji key plus a text key, so screen readers never read emoji. */
export type Mood = { emoji: MoodEmojiKey; key: StringKey; params?: Record<string, string | number> };

export type Friend = { name: string; avatar: AvatarKey };
export type Dish = { name: string; price: number; liked: number };

export type Spot = {
  id: string;
  name: string;
  kind: SpotKind;
  food: FoodKey;
  category: SpotCategory;
  /** Position on the 1400x1800 illustrated world. */
  x: number;
  y: number;
  /** Fictional coordinates, used for the "Go" directions link. */
  lat: number;
  lng: number;
  price: 1 | 2 | 3;
  rating: number;
  reviewCount: number;
  hood: string;
  open: boolean;
  until: Until;
  /** Minutes until closing at app start (idea B, closing soon). */
  closesInMin?: number;
  mood: Mood | null;
  hot: boolean;
  badges: string[];
  owner?: string;
  vibe: string[];
  aiSummary: string;
  dishes: Dish[];
  /** Relative busyness for 16 hourly slots from 8am to 11pm, 0 to 10. */
  busy: number[];
  /** Weekly stops for mobile spots, Monday first; null means off. */
  schedule?: (string | null)[];
  friends?: Friend[];
};

export type ReportType = ReportEmojiKey;

export type Report = {
  id: string;
  spotId: string;
  type: ReportType;
  text: string;
  /** Index into PEOPLE, or 'owner' / 'you'. */
  by: number | 'owner' | 'you';
  /** Minutes ago at app start (sample) or the creation time (new reports). */
  ageMin?: number;
  createdAt?: number;
  votes: number;
};

export type Drop = {
  id: string;
  spotId: string;
  title: string;
  body: string;
  /** Epoch ms when the drop starts. */
  startsAt: number;
  left: number;
  of: number;
};

export type Note = {
  id: string;
  emoji: NoteEmojiKey;
  tint: string;
  text: string;
  ago: string;
  /** A spot id to focus, or 'drops' to open the Drops tab. */
  go?: string;
  unread: boolean;
  createdAt?: number;
};

export type Person = { handle: string; avatar: AvatarKey; tint: string };
export type Tick = { by: number; text: string };

export type MenuItem = { id: string; name: string; price: number; food: FoodKey; soldOut?: boolean };

export type Stop = { id: string; name: string; hood: string; x: number; y: number; current?: boolean };

export type LiveStatusId = 'wait15' | 'closing30' | 'soldOut' | 'closed';
export type LiveStatus = {
  id: LiveStatusId;
  emoji: StatusEmojiKey;
  labelKey: StringKey;
  moodKey: StringKey;
};

export type LiveSession = {
  spotId: string;
  stopId: string;
  until: ClockTime | 'soldOut';
  startedAt: number;
  status: LiveStatusId | null;
};

export type Review = { id: string; by: number; stars: number; text: string; ago: string };

export type Business = {
  spotId: string;
  name: string;
  verified: boolean;
  followers: number;
  stops: Stop[];
  untilOptions: (ClockTime | 'soldOut')[];
  defaultUntil: ClockTime;
  nextStop: { stopId: string; at: ClockTime };
  menu: MenuItem[];
  schedule: { day: number; stopIndex: number | null; hours: string }[];
  reviews: Review[];
  stats: {
    views: number;
    viewsDelta: number;
    checkIns: number;
    checkInsDelta: number;
    followers: number;
    followersDelta: number;
    rating: number;
  };
  nudge: { count: number; food: string; area: string };
};
