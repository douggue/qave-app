// CLEARLY FICTIONAL SAMPLE DATA (Austin, TX). Every spot, person, review and
// number here is made up for the prototype. Ported from design/lokal-mockup-v4.html.
// Screens never import this file: they go through src/data/repo.ts, which will
// switch to Supabase later.

import type { Business, Drop, LiveStatus, MapLabel, Note, Person, Report, ScheduleStop, Spot, Tick } from './types';

/** The world is 1400x1800 units. "You" stand at ME. */
export const WORLD = { width: 1400, height: 1800 } as const;
export const ME = { x: 820, y: 700 } as const;

/** Place names drawn on the illustrated map (proper nouns, not UI copy). */
export const MAP_LABELS: MapLabel[] = [
  { kind: 'hood', text: 'DOWNTOWN', x: 620, y: 520 },
  { kind: 'hood', text: 'EAST AUSTIN', x: 1090, y: 470 },
  { kind: 'hood', text: 'SOUTH CONGRESS', x: 690, y: 1215 },
  { kind: 'hood', text: 'ZILKER PARK', x: 170, y: 1070 },
  { kind: 'hood', text: 'HYDE PARK', x: 560, y: 160 },
  { kind: 'hood', text: 'BOULDIN', x: 420, y: 1240 },
  { kind: 'hood', text: 'HOLLY', x: 1150, y: 1110 },
  { kind: 'hood', text: 'PEASE PARK', x: 90, y: 340 },
  { kind: 'street', text: 'Congress Ave', x: 790, y: 230 },
  { kind: 'street', text: 'E 6th St', x: 1230, y: 590 },
  { kind: 'street', text: 'Cesar Chavez St', x: 80, y: 772 },
  { kind: 'street', text: 'Riverside Dr', x: 1040, y: 1020 },
  { kind: 'street', text: 'S 1st St', x: 630, y: 1560 },
  { kind: 'street', text: 'N Lamar Blvd', x: 392, y: 420, rotate: -87 },
  { kind: 'water', text: 'Lady Bird Lake', x: 200, y: 900 },
  { kind: 'shield', text: '35', x: 1007, y: 263 },
];

// Fictional coordinates spread over central Austin, only for the directions link.
const geo = (x: number, y: number) => ({
  lat: +(30.32 - (y / WORLD.height) * 0.1).toFixed(5),
  lng: +(-97.8 + (x / WORLD.width) * 0.12).toFixed(5),
});

/** Weekly stops for mobile spots: the full name for screen readers, a short one (9 characters or fewer) for the strip. */
const E6TH: ScheduleStop = { name: 'East 6th Street', short: 'E 6th' };
const RAINEY: ScheduleStop = { name: 'Rainey Street', short: 'Rainey' };
const CESAR: ScheduleStop = { name: 'East Cesar Chavez', short: 'Cesar Ch.' };
const DOWNTOWN: ScheduleStop = { name: 'Downtown', short: 'Downtown' };
const SOCO: ScheduleStop = { name: 'South Congress', short: 'SoCo' };
const MARKET: ScheduleStop = { name: 'Saturday market', short: 'Market' };
const ZILKER: ScheduleStop = { name: 'Zilker Park', short: 'Zilker' };
const S1ST: ScheduleStop = { name: 'South 1st Street', short: 'S 1st' };
const TRAIL: ScheduleStop = { name: 'Lady Bird Lake trail', short: 'Trail' };

export const SPOTS: Spot[] = [
  {
    id: 'guera', name: 'Taquería La Güera', kind: 'truck', food: 'taco', category: 'tacos',
    x: 1080, y: 600, ...geo(1080, 600), price: 1, rating: 4.8, reviewCount: 212, hood: 'East 6th',
    open: true, until: { h: 22, m: 0 }, mood: { emoji: 'hot', key: 'mood.hot' }, hot: true,
    badges: ['Family-owned', 'Food truck'], owner: 'Rosa & Miguel', vibe: ['Late night', 'Picnic tables', 'Cash or card'], tags: ['lateNight', 'picnic'],
    aiSummary: 'Locals rave about the al pastor and the green salsa. A short line after 7pm, but it moves fast.',
    dishes: [{ name: 'Al pastor taco', price: 3.5, liked: 96 }, { name: 'Birria plate', price: 13, liked: 91 }, { name: 'Horchata', price: 4, liked: 88 }],
    busy: [1, 1, 2, 3, 5, 4, 3, 3, 4, 6, 8, 9, 7, 5, 3, 2],
    schedule: [E6TH, E6TH, null, E6TH, E6TH, RAINEY, RAINEY],
    friends: [{ name: 'Maya', avatar: 'unicorn' }, { name: 'Ellie', avatar: 'octopus' }, { name: 'Brad', avatar: 'cowboy' }],
  },
  {
    id: 'smoke', name: 'Post Oak Pit BBQ', kind: 'trailer', food: 'bbq', category: 'bbq',
    x: 1130, y: 760, ...geo(1130, 760), price: 2, rating: 4.7, reviewCount: 388, hood: 'East Cesar Chavez',
    open: true, until: { key: 'until.soldOut' }, closesInMin: 25, mood: { emoji: 'line', key: 'mood.line25' }, hot: false,
    badges: ['Trailer', 'Pitmaster-owned'], owner: 'Dez', vibe: ['Worth the wait', 'Shaded seating', 'BYOB'], tags: ['byob', 'shade'],
    aiSummary: 'The brisket is the star: peppery bark, very tender. Lines peak from noon to 1pm, and ribs usually sell out by 2pm.',
    dishes: [{ name: 'Brisket (½ lb)', price: 16, liked: 97 }, { name: 'Pork ribs (3)', price: 14, liked: 90 }, { name: 'Jalapeño mac', price: 5, liked: 85 }],
    busy: [0, 0, 3, 6, 9, 10, 8, 5, 3, 2, 1, 0, 0, 0, 0, 0],
    schedule: [null, null, CESAR, CESAR, CESAR, CESAR, CESAR],
    friends: [{ name: 'Brad', avatar: 'cowboy' }],
  },
  {
    id: 'dough', name: 'Little Dough Bakery', kind: 'restaurant', food: 'croissant', category: 'sweets',
    x: 590, y: 1120, ...geo(590, 1120), price: 1, rating: 4.9, reviewCount: 146, hood: 'Bouldin',
    open: true, until: { h: 15, m: 0 }, mood: { emoji: 'news', key: 'mood.newPecan' }, hot: false,
    badges: ['Women-owned', 'Tiny bakery'], owner: 'June', vibe: ['Morning favorite', 'Dog friendly', 'Cozy'], tags: ['dogFriendly', 'earlyBird'],
    aiSummary: 'Tiny counter, huge flavor. The new pecan croissant is a hit. Come before 10am to see the full case.',
    dishes: [{ name: 'Pecan croissant', price: 5, liked: 98 }, { name: 'Kolache box (6)', price: 14, liked: 92 }, { name: 'Cold brew', price: 4.5, liked: 87 }],
    busy: [6, 9, 10, 8, 6, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    friends: [{ name: 'Ellie', avatar: 'octopus' }, { name: 'Kai', avatar: 'fox' }],
  },
  {
    id: 'pho', name: 'Phở Bà Năm', kind: 'restaurant', food: 'pho', category: 'asian',
    x: 1000, y: 330, ...geo(1000, 330), price: 2, rating: 4.6, reviewCount: 301, hood: 'Cherrywood',
    open: true, until: { h: 21, m: 0 }, mood: null, hot: false,
    badges: ['Family-owned', '12 tables'], owner: 'The Nguyen family', vibe: ['Rainy day pick', 'Quiet', 'Big portions'], tags: ['bigPortions'],
    aiSummary: 'Rich, slow-cooked broth and generous bowls. Grandma still makes the broth every morning.',
    dishes: [{ name: 'Phở tái', price: 13, liked: 95 }, { name: 'Bánh mì', price: 8, liked: 90 }, { name: 'Iced coffee', price: 5, liked: 93 }],
    busy: [0, 0, 1, 3, 6, 7, 4, 2, 2, 4, 6, 7, 5, 3, 1, 0],
  },
  {
    id: 'ember', name: 'Ember & Bun', kind: 'truck', food: 'burger', category: 'burgers',
    x: 780, y: 690, ...geo(780, 690), price: 1, rating: 4.5, reviewCount: 97, hood: 'Downtown',
    open: true, until: { h: 23, m: 0 }, mood: { emoji: 'parked', key: 'mood.justParked' }, hot: false,
    badges: ['Food truck', 'Brothers-owned'], owner: 'Leo & Sam', vibe: ['Late night', 'Fast', 'Cheap eats'], tags: ['lateNight', 'quick'],
    aiSummary: 'Crispy-edged smash burgers and very fast service. A late-night favorite. Skip the fries; get the onion rings.',
    dishes: [{ name: 'Double smash', price: 11, liked: 94 }, { name: 'Onion rings', price: 5, liked: 92 }, { name: 'Fries', price: 4, liked: 71 }],
    busy: [0, 0, 0, 1, 3, 4, 2, 1, 2, 4, 6, 7, 8, 9, 8, 6],
    schedule: [DOWNTOWN, DOWNTOWN, E6TH, DOWNTOWN, SOCO, SOCO, null],
  },
  {
    id: 'kolache', name: 'Kolache Corner', kind: 'restaurant', food: 'kolache', category: 'sweets',
    x: 740, y: 570, ...geo(740, 570), price: 1, rating: 4.4, reviewCount: 80, hood: 'Downtown',
    open: true, until: { h: 13, m: 0 }, closesInMin: 40, mood: { emoji: 'soldOut', key: 'mood.sausageOut' }, hot: false,
    badges: ['Since 1998'], owner: 'Hana', vibe: ['Grab and go', 'Early bird'], tags: ['earlyBird', 'quick', 'cashOnly'],
    aiSummary: 'Classic Czech-Texan kolaches. Fruit ones last all morning; sausage ones sell out by about 10am.',
    dishes: [{ name: 'Fruit kolache', price: 2.5, liked: 90 }, { name: 'Sausage klobasnek', price: 3, liked: 93 }, { name: 'Coffee', price: 2, liked: 80 }],
    busy: [8, 10, 7, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'jerk', name: 'Island Jerk Pit', kind: 'truck', food: 'jerk', category: 'caribbean',
    x: 800, y: 1320, ...geo(800, 1320), price: 2, rating: 4.7, reviewCount: 174, hood: 'South Congress',
    open: true, until: { h: 21, m: 0 }, mood: { emoji: 'deal', key: 'mood.lunchDeal' }, hot: false,
    badges: ['Food truck', 'Immigrant-owned'], owner: 'Andre', vibe: ['Spicy', 'Great value', 'Music on'], tags: ['cashOnly', 'picnic'],
    aiSummary: 'Smoky jerk chicken with real heat. The $10 lunch plate is the best deal on South Congress.',
    dishes: [{ name: 'Jerk chicken plate', price: 14, liked: 96 }, { name: 'Lunch deal', price: 10, liked: 94 }, { name: 'Festival (3)', price: 5, liked: 89 }],
    busy: [0, 0, 2, 5, 8, 7, 4, 2, 2, 3, 5, 6, 4, 2, 0, 0],
    schedule: [SOCO, SOCO, SOCO, null, SOCO, MARKET, MARKET],
    friends: [{ name: 'Maya', avatar: 'unicorn' }],
  },
  {
    id: 'paleta', name: 'Paleta Pop', kind: 'cart', food: 'paleta', category: 'sweets',
    x: 330, y: 1010, ...geo(330, 1010), price: 1, rating: 4.8, reviewCount: 66, hood: 'Zilker',
    open: true, until: { key: 'until.sunset' }, mood: null, hot: false,
    badges: ['Cart', 'Family-owned'], owner: 'Lupe', vibe: ['Kid friendly', 'Park side'], tags: ['kidFriendly', 'dogFriendly', 'cashOnly'],
    aiSummary: 'Fresh fruit paletas; mango-chile is the favorite. Parks by the Zilker entrance on warm days.',
    dishes: [{ name: 'Mango-chile paleta', price: 4, liked: 97 }, { name: 'Strawberry cream', price: 4, liked: 93 }, { name: 'Elote cup', price: 6, liked: 90 }],
    busy: [0, 0, 0, 1, 3, 5, 7, 8, 9, 8, 6, 3, 0, 0, 0, 0],
    schedule: [null, ZILKER, ZILKER, ZILKER, ZILKER, ZILKER, ZILKER],
  },
  {
    id: 'supper', name: 'Sunday Supper Club', kind: 'popup', food: 'supper', category: 'popup',
    x: 1260, y: 1000, ...geo(1260, 1000), price: 3, rating: 4.9, reviewCount: 41, hood: 'Holly',
    open: false, until: { h: 18, m: 0, day: 0 }, mood: { emoji: 'seats', key: 'mood.seatsLeft', params: { n: 8 } }, hot: false,
    badges: ['Pop-up', 'Chef-run'], owner: 'Chef Ama', vibe: ['Book ahead', 'Family style', 'Backyard'], tags: ['bookAhead', 'byob'],
    aiSummary: 'A monthly family-style dinner in a backyard, with a West African and Texan menu. It usually fills up in a day.',
    dishes: [{ name: 'Family dinner', price: 45, liked: 98 }, { name: 'Jollof add-on', price: 8, liked: 95 }],
    busy: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 10, 8, 0, 0, 0],
  },
  {
    id: 'curry', name: 'Curry Cart', kind: 'cart', food: 'curry', category: 'asian',
    x: 640, y: 1290, ...geo(640, 1290), price: 1, rating: 4.6, reviewCount: 58, hood: 'South 1st',
    open: true, until: { h: 20, m: 0 }, mood: null, hot: false,
    badges: ['Cart', 'Vegan options'], owner: 'Priya', vibe: ['Vegan friendly', 'Big bowls'], tags: ['vegan', 'quick'],
    aiSummary: 'Big bowls of chana masala and butter chicken. Very good value, with lots of vegan choices.',
    dishes: [{ name: 'Butter chicken bowl', price: 11, liked: 95 }, { name: 'Chana masala', price: 9, liked: 93 }, { name: 'Mango lassi', price: 4, liked: 91 }],
    busy: [0, 0, 1, 4, 7, 6, 3, 2, 3, 5, 6, 4, 2, 0, 0, 0],
    schedule: [S1ST, S1ST, S1ST, S1ST, S1ST, null, null],
  },
  {
    id: 'dumpling', name: 'Pleat & Steam', kind: 'popup', food: 'dumpling', category: 'asian',
    x: 1210, y: 1250, ...geo(1210, 1250), price: 2, rating: 4.8, reviewCount: 73, hood: 'Saturday market',
    open: false, until: { h: 9, m: 0, day: 6 }, mood: null, hot: false,
    badges: ['Market stall', 'Pop-up'], owner: 'Kenji & Mae', vibe: ['Market only', 'Sells out fast'], tags: ['cashOnly', 'earlyBird'],
    aiSummary: 'Hand-folded pork and chive dumplings at the Saturday market. Arrive early; they often sell out by noon.',
    dishes: [{ name: 'Pork & chive (8)', price: 10, liked: 97 }, { name: 'Chili crisp jar', price: 9, liked: 94 }],
    busy: [4, 8, 10, 9, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    friends: [{ name: 'Hank', avatar: 'panda' }, { name: 'Ellie', avatar: 'octopus' }],
  },
  {
    id: 'bean', name: 'Bean Bike', kind: 'cart', food: 'coffee', category: 'sweets',
    x: 560, y: 640, ...geo(560, 640), price: 1, rating: 4.7, reviewCount: 52, hood: 'Lady Bird Lake',
    open: true, until: { h: 14, m: 0 }, closesInMin: 55, mood: null, hot: false,
    badges: ['Bike cart', 'Solo-owned'], owner: 'Marco', vibe: ['Trail side', 'Oat milk', 'Quick'], tags: ['dogFriendly', 'vegan'],
    aiSummary: 'Cold brew and honey lattes from a bike by the lake trail. A quick, friendly stop on a run or walk.',
    dishes: [{ name: 'Honey latte', price: 5, liked: 95 }, { name: 'Cold brew', price: 4, liked: 92 }],
    busy: [7, 9, 8, 6, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    schedule: [TRAIL, TRAIL, TRAIL, TRAIL, TRAIL, TRAIL, null],
  },
];

export const PEOPLE: Person[] = [
  { handle: '@tacotania', avatar: 'unicorn', tint: '#ffd6ec' },
  { handle: '@brisketbrad', avatar: 'cowboy', tint: '#ffe7b0' },
  { handle: '@ellie.eats', avatar: 'octopus', tint: '#d8f6ea' },
  { handle: '@k.lo', avatar: 'fox', tint: '#ffe0cc' },
  { handle: '@hungryhank', avatar: 'panda', tint: '#e7e4ff' },
  { handle: '@noodle.nina', avatar: 'frog', tint: '#dff5d0' },
];

export const REPORTS: Report[] = [
  { id: 'r-guera-1', spotId: 'guera', type: 'amazing', text: 'Al pastor is on point tonight', by: 0, ageMin: 4, votes: 12 },
  { id: 'r-guera-2', spotId: 'guera', type: 'line', text: 'About 8 people in line', by: 2, ageMin: 15, votes: 5 },
  { id: 'r-smoke-1', spotId: 'smoke', type: 'line', text: '25-min line, worth it', by: 1, ageMin: 6, votes: 9 },
  { id: 'r-smoke-2', spotId: 'smoke', type: 'soldOut', text: 'Ribs are gone already', by: 3, ageMin: 40, votes: 3 },
  { id: 'r-dough-1', spotId: 'dough', type: 'news', text: 'Pecan croissants just came out', by: 'owner', ageMin: 10, votes: 14 },
  { id: 'r-ember-1', spotId: 'ember', type: 'parked', text: 'Just parked on Congress', by: 'owner', ageMin: 2, votes: 7 },
  { id: 'r-kolache-1', spotId: 'kolache', type: 'soldOut', text: 'Out of the sausage ones', by: 4, ageMin: 22, votes: 6 },
  { id: 'r-jerk-1', spotId: 'jerk', type: 'deal', text: '$10 lunch plate today only', by: 'owner', ageMin: 60, votes: 18 },
];

export const TICKS: Tick[] = [
  { by: 0, text: 'reported Hot at Taquería La Güera' },
  { by: 4, text: 'checked in at Kolache Corner' },
  { by: 2, text: 'added a new spot: Pleat & Steam' },
  { by: 1, text: 'says the line at Post Oak Pit is 25 min' },
  { by: 5, text: 'earned the Night Owl badge' },
  { by: 3, text: 'confirmed the $10 deal at Island Jerk Pit' },
];

const MIN = 60_000;
const t0 = Date.now();

export const DROPS: Drop[] = [
  { id: 'd-guera', spotId: 'guera', title: 'Birria drop', body: 'Only 40 portions of birria with consommé, tonight only.', startsAt: t0 + 72 * MIN + 14_000, left: 40, of: 40 },
  { id: 'd-ember', spotId: 'ember', title: 'Free onion rings', body: 'For the next 20 people who show this in the app.', startsAt: t0 - 5 * MIN, left: 12, of: 20 },
  { id: 'd-dough', spotId: 'dough', title: 'Pecan croissants, round two', body: 'A second bake comes out of the oven soon.', startsAt: t0 + 24 * MIN + 40_000, left: 24, of: 24 },
  { id: 'd-supper', spotId: 'supper', title: 'Sunday Supper seats', body: 'West African and Texan family dinner this Sunday.', startsAt: t0 + 2 * 24 * 60 * MIN + 3 * 60 * MIN, left: 8, of: 24 },
];

export const NOTES: Note[] = [
  { id: 'n1', emoji: 'burger', tint: '#ffe7b0', text: 'Ember & Bun just parked 0.3 mi away', ago: '2 min ago', go: 'ember', unread: true },
  { id: 'n3', emoji: 'timer', tint: '#ffe3d1', text: 'Birria drop at La Güera starts in about an hour', ago: '3 hr ago', go: 'drops', unread: false },
  { id: 'n4', emoji: 'dumpling', tint: '#ffe3d1', text: 'New pop-up near you: Pleat & Steam (Sat 9am)', ago: 'Yesterday', go: 'dumpling', unread: false },
];

/** The sample business the demo user owns (mockup `B`). */
export const B: Business = {
  spotId: 'ember',
  name: 'Ember & Bun',
  verified: true,
  followers: 128,
  stops: [
    { id: 'congress', name: 'Congress Ave & 2nd St', hood: 'Downtown', x: 780, y: 690, current: true },
    { id: 'e6th', name: 'E 6th St & Waller', hood: 'East Austin', x: 1150, y: 600 },
    { id: 'rainey', name: 'Rainey St lot', hood: 'Rainey', x: 900, y: 760 },
    { id: 'soco', name: 'S Congress & Elizabeth', hood: 'South Congress', x: 800, y: 1240 },
  ],
  untilOptions: [{ h: 21, m: 0 }, { h: 22, m: 0 }, { h: 23, m: 0 }, { h: 1, m: 0 }, 'soldOut'],
  defaultUntil: { h: 23, m: 0 },
  nextStop: { stopId: 'congress', at: { h: 17, m: 0 } },
  menu: [
    { id: 'm1', name: 'Classic smash', price: 9, food: 'burger' },
    { id: 'm2', name: 'Double smash', price: 11, food: 'burger' },
    { id: 'm3', name: 'Onion rings', price: 5, food: 'rings' },
    { id: 'm4', name: 'Fries', price: 4, food: 'fries' },
    { id: 'm5', name: 'Shake', price: 6, food: 'shake' },
  ],
  schedule: [
    { day: 1, stopIndex: 0, hours: '5–11pm' },
    { day: 2, stopIndex: 0, hours: '5–11pm' },
    { day: 3, stopIndex: 1, hours: '5–11pm' },
    { day: 4, stopIndex: 0, hours: '5–11pm' },
    { day: 5, stopIndex: 2, hours: '6pm–1am' },
    { day: 6, stopIndex: 3, hours: '12–11pm' },
    { day: 0, stopIndex: null, hours: '' },
  ],
  reviews: [
    { id: 'rv1', by: 0, stars: 5, text: 'Best smash burger on Congress. Crispy edges, fast service.', ago: '1 hr' },
    { id: 'rv2', by: 4, stars: 3, text: 'Burger was great but waited 25 minutes at 11pm.', ago: '3 hr' },
    { id: 'rv3', by: 2, stars: 5, text: 'Onion rings are elite. Please never change them.', ago: 'Yesterday' },
  ],
  stats: { views: 412, viewsDelta: 18, checkIns: 86, checkInsDelta: 9, followers: 128, followersDelta: 23, rating: 4.5 },
  nudge: { count: 48, food: 'burgers', area: 'E 6th' },
};

export const STATUSES: LiveStatus[] = [
  { id: 'wait15', emoji: 'wait', labelKey: 'biz.status.wait15', moodKey: 'mood.wait15' },
  { id: 'closing30', emoji: 'closing', labelKey: 'biz.status.closing30', moodKey: 'mood.closing30' },
  { id: 'soldOut', emoji: 'soldOut', labelKey: 'biz.status.soldOut', moodKey: 'mood.soldOut' },
  { id: 'closed', emoji: 'closed', labelKey: 'biz.status.closed', moodKey: 'mood.closed' },
];
