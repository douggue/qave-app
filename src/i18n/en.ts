// English string table. Keys are grouped by area. Values never contain emoji:
// compose emoji in JSX from src/theme/emoji.ts so strings stay translatable.

export const en = {
  // Splash
  'splash.wordmark': 'Lokal',
  'splash.tagline': 'Only local. No chains.',
  'splash.a11y': 'Lokal. Only local. No chains.',

  // Tabs
  'tab.map': 'Map',
  'tab.drops': 'Drops',
  'tab.report': 'Report',
  'tab.ask': 'Ask',
  'tab.you': 'You',
  'tab.today': 'Today',
  'tab.where': 'Where',
  'tab.goLive': 'Go live',
  'tab.menu': 'Menu',
  'tab.promote': 'Promote',
  'tab.reportA11y': "Report what's happening",
  'tab.reportHint': 'Opens quick report options',
  'tab.eaterA11y': 'Eater tabs',
  'tab.bizA11y': 'Business tabs',

  // Common
  'common.close': 'Close',
  'common.back': 'Back',
  'common.comingNext': 'Coming in the next version',
  'common.demo': 'Demo',
  'common.showOnMap': 'Show on map',
  'common.showOnMapA11y': 'Show {name} on the map',

  // Map home
  'map.title': 'Live near you',
  'map.summary': '{count} local spots near you. {open} open now. 0 chains.',
  'map.you': 'You are here',
  'map.a11y': 'Map of local food spots. Drag to move around.',
  'map.askPill': 'Ask Lokal: "tacos open now under $10"',
  'map.askA11y': 'Ask Lokal',
  'map.askHint': 'Opens the Ask tab',
  'map.bell': 'Notifications, {n} unread',
  'map.toDay': 'Switch to day map',
  'map.toNight': 'Switch to night map',
  'map.themeNight': 'Night map on',
  'map.themeDay': 'Day map on',
  'map.zoomIn': 'Zoom in',
  'map.zoomOut': 'Zoom out',
  'map.recenter': 'Back to you',
  'map.filters': 'Filters',
  'map.ticker': '{handle} {text}',

  // Pins
  'pin.a11y': '{name}, {kind}, {status}, {distance}',
  'pin.a11yMood': '{label}, reported: {mood}',
  'pin.hint': 'Shows details',

  // Status lines
  'status.hereNow': 'Here now · until {until}',
  'status.open': 'Open · until {until}',
  'status.next': 'Next: {until}',
  'status.closesIn': 'Closes in {min} min',
  'status.closingNow': 'Closing now',
  'time.dayAt': '{day} {time}',

  // Freshness (idea A)
  'fresh.you': 'You confirmed it just now',
  'fresh.min': 'Seen {min} min ago',
  'fresh.hr': 'Last seen {hr} hr ago. Still there?',
  'fresh.none': 'No recent reports. Still there?',
  'fresh.yep': 'Yep, still here',
  'fresh.thanks': 'Thanks',
  'fresh.yepA11y': 'Confirm {name} is still here',

  // Distance
  'dist.walk': '{n} min walk',
  'dist.mi': '{d} mi',
  'dist.km': '{d} km',

  // Bottom sheet
  'sheet.title': 'Live near you',
  'sheet.sub': '{count} local spots · {open} open now · 0 chains',
  'sheet.trending': 'Trending right now',
  'sheet.closest': 'Closest to you',
  'sheet.a11y': 'Spot list',
  'sheet.handle': 'Spot list, {state}',
  'sheet.handleHint': 'Double tap to show more',
  'sheet.peek': 'collapsed',
  'sheet.half': 'half open',
  'sheet.full': 'expanded',
  'sheet.hint': "Tap a sticker to see what's cooking",
  'sheet.close': 'Close preview',
  'sheet.noMatch': 'Nothing matches right now. Try another filter.',
  'filter.announce': '{n} spots match {filter}',

  // Spot meta
  'spot.rating': '{r} ({n})',
  'spot.meta': '{r} · {price} · {kind}',
  'spot.metaFull': '{r} ({n}) · {price} · {kind}',
  'spot.ratingA11y': 'Rated {r} out of 5 from {n} reviews',
  'spot.distHood': '{distance} · {hood}',
  'spot.friends1': '{name} loves this',
  'spot.friendsN': '{name} and {n} friends love this',
  'spot.rowA11y': '{name}, {status}, {distance}',
  'spot.openPage': 'See menu, busy times & reviews',
  'spot.loading': 'This spot page lands in the next build.',
  'spot.notFound': 'We could not find that spot.',

  // Actions
  'act.checkIn': 'Check in',
  'act.here': "You're here",
  'act.report': 'Report',
  'act.open': 'Open',
  'act.openA11y': 'Open the page for {name}',
  'act.reportA11y': 'Report what is happening at {name}',
  'act.checkInA11y': 'Check in at {name}',
  'checkin.done': "You're checked in at {spot}",
  'rep.plus': '+{n} rep',

  // Filters
  'filter.all': 'All',
  'filter.open': 'Open now',
  'filter.mobile': 'Trucks & carts',
  'filter.tacos': 'Tacos',
  'filter.bbq': 'BBQ',
  'filter.sweets': 'Sweets & coffee',
  'filter.asian': 'Asian',
  'filter.popup': 'Pop-ups',
  'filter.cheap': '$ Cheap eats',

  // Spot kinds (lowercase, used inside sentences and labels)
  'kind.truck': 'food truck',
  'kind.trailer': 'trailer',
  'kind.cart': 'cart',
  'kind.popup': 'pop-up',
  'kind.restaurant': 'small restaurant',

  // Moods (bubble text over pins)
  'mood.hot': 'Hot right now',
  'mood.line25': '25-min line',
  'mood.newPecan': 'New: pecan croissant',
  'mood.justParked': 'Just parked',
  'mood.sausageOut': 'Sausage sold out',
  'mood.lunchDeal': '$10 lunch deal',
  'mood.seatsLeft': '{n} seats left',
  'mood.wait15': 'About 15 min wait',
  'mood.closing30': 'Closing in 30 min',
  'mood.soldOut': 'Sold out',
  'mood.closed': 'Closed today',
  'mood.amazing': 'Hot right now',
  'mood.line': 'Long line',
  'mood.deal': 'Good deal today',
  'mood.soldOutReport': 'Something sold out',

  // Until labels that are not clock times
  'until.soldOut': 'sold out',
  'until.sunset': 'sunset',

  // Business quick statuses
  'biz.status.wait15': 'About 15 min wait',
  'biz.status.closing30': 'Closing in 30',
  'biz.status.soldOut': 'Sold out',
  'biz.status.closed': 'Closed',

  // Drops (placeholder until C4)
  'drops.title': 'Drops',
  'drops.subtitle': "Limited food from local spots. When it's gone, it's gone.",
  'drops.placeholder': '{count} drops are coming tonight. The full list lands in the next build.',

  // Ask (placeholder until C4)
  'ask.title': 'Ask Lokal',
  'ask.demoNote': 'Canned answers for now. The real guide is coming.',
  'ask.placeholder': 'Ask about tacos, late night or a rainy day. The chat lands in the next build.',

  // You
  'you.title': 'You',
  'you.handle': '@you',
  'you.rep': '{level} · {rep} rep',
  'you.toNext': '{n} rep to {level}',
  'you.maxLevel': 'Top level. Thanks for helping out.',
  'you.repHow': 'You earn rep by helping other eaters: reports, check-ins and confirming what is still true.',
  'you.checkIns': 'Check-ins',
  'you.theme': 'Map look',
  'you.toBiz': 'Switch to Business mode',
  'you.toBizSub': 'Smash Bros. Burgers',
  'theme.auto': 'Auto',
  'theme.night': 'Night',
  'theme.day': 'Day',
  'theme.autoNote': 'Auto: night from 7pm to 7am',
  'theme.a11y': 'Map look: {mode}',

  // Levels
  'level.newcomer': 'Newcomer',
  'level.regular': 'Regular',
  'level.local': 'Local',
  'level.legend': 'Legend',

  // Report (placeholder until C3)
  'report.title': "What's happening?",
  'report.placeholder': 'Quick reports land in the next build: amazing, long line, good deal, sold out.',
  'report.close': 'Close report menu',

  // Toasts
  'toast.comingSoon': 'Coming soon',
  'toast.bizSoon': 'Business mode is coming next',
} as const;

export type StringKey = keyof typeof en;
export type StringTable = Record<StringKey, string>;
