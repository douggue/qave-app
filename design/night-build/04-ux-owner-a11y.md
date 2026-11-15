# Night build 04: UX for owners (Business mode) and the accessibility + localization checklist

Owner: UX expert 2 (owners, accessibility, copy length). Audience: the one developer building C1 to C5 tonight on `night-build`.
Builds on: `01-ui-design-system.md` (tokens, contrast table, pin spec) and `02-ui-screens-motion.md` (screens, motion, copy table section 10). Where this file adds a rule, it does not change their values unless it says **Override**.
Scope: tonight's plan only. Business = switch + Today + Go live. Where, Menu, Promote = honest placeholders. Sold-out toggles are P2 (only if C5 finishes early).

---

## 0. Priority list (what matters most tonight)

1. **Mode switch both ways, labeled, never a dead end** (C5). From You: "Switch to Business mode". From Today: a header button "Personal" that switches back. A user who lands in Business mode by accident must get out in one tap.
2. **Go live in two taps max, with safe defaults** (C5). Today "Go live now" (or center tab) opens the sheet with stop and "serving until" pre-selected; "Go live here" sits in the thumb zone. Confirm updates the shared map pin.
3. **Live statuses that customers can read** (C5). Four quick-status buttons, toggle, announce, update the pin bubble. "End service" cannot be hit by accident (two-step tap, section 2.5).
4. **Pins and emoji speak** (C2, C3). Every pin is a labeled button; emoji are hidden from the screen reader and their meaning is in text. Mood is stored as `{ emoji key, text key }`, never as one string with an emoji glued on (section 3.2).
5. **Reduce motion and screen reader paths** (C2 to C5). One `useReduceMotion()` hook gates every loop. Radial becomes a list. Rain becomes fade + toast.
6. **French-ready layout** (every chunk). No fixed widths on text, `minHeight` not `height`, the 30% pad test passes on the screens listed in section 5.4.
7. **Distance in mi or km from one function** (C2). `formatDistance()` in `src/i18n/units.ts`, used everywhere a distance shows (pin label, sheet, spot page, drops, Ask).
8. Contrast and text scaling checks (section 4). Mostly free if 01's pairs are used.

Cut first if behind: Go live celebration particles (keep the toast), the live-card dot pulse, the two-step End service (fall back to an immediate end plus a toast), the Inbox screen, sold-out toggles.

---

## 1. Shared rules for this file

| Rule | Value |
|---|---|
| Touch target, comfortable | **48 x 48** pt for every new pressable in this file (tabs, quick statuses, sheet rows, toggles). Add `export const tapComfort = 48` to `src/theme/tokens.ts` next to `minTap = 44`. |
| Touch target, floor | 44 (`minTap`). Anything visually smaller (bell, zoom +/-, recenter, close x, vote thumbs) gets `hitSlop={hitSlop}` from tokens so the hit area reaches 48. |
| Business primary actions | Go live now / Go live here: `minHeight: 84` (from 02). Quick-status buttons: `minHeight: 56`. End service: `minHeight: 48`. |
| Spacing between destructive and frequent actions | At least `space.xl` (24) between the quick-status grid and End service. |
| Thumb zone | Primary business actions sit in the bottom 45% of the screen or inside a bottom sheet. Nothing an owner needs during service is only reachable at the top. |
| Text | Every visible string through `t()`. Emoji only from `src/theme/emoji.ts`, composed next to the text in JSX, never inside a translation value. |
| Announcements | Every state change that is not a navigation (go live, status set, service ended, report sent, rep gained, mode switched) calls `AccessibilityInfo.announceForAccessibility(message)`. The Toast host already does this (02 section 3), so "show a toast" covers it. |

---

## 2. Business mode journeys (C5)

### 2.1 Data and store (what the developer adds)

In `src/data/sample.ts` (port of mockup `B`, lines 928 to 933), exported through `repo.ts` as `getBusiness()`:

```ts
// Clearly fictional sample business (Austin, TX).
export const BUSINESS = {
  spotId: 'smash',
  name: 'Ember & Bun',
  verified: true,
  followers: 128,
  stops: [
    { id: 'congress', name: 'Congress Ave & 2nd St', hood: 'Downtown',       x: 780,  y: 690,  current: true },
    { id: 'e6th',     name: 'E 6th St & Waller',     hood: 'East Austin',    x: 1150, y: 600 },
    { id: 'rainey',   name: 'Rainey St lot',         hood: 'Rainey',         x: 900,  y: 760 },
    { id: 'soco',     name: 'S Congress & Elizabeth',hood: 'South Congress', x: 800,  y: 1240 },
  ],
  untilOptions: [ {h:21,m:0}, {h:22,m:0}, {h:23,m:0}, {h:1,m:0}, 'soldOut' ],  // times as data, formatted by locale
  defaultUntil: {h:23,m:0},
  nextStop: { stopId: 'congress', at: {h:17,m:0} },
  stats: { views: 412, viewsDelta: 18, checkIns: 86, checkInsDelta: 9, followers: 128, followersDelta: 23, rating: 4.5 },
  nudge: { count: 48, food: 'burgers', area: 'E 6th' },
};
export const STATUSES = [
  { id: 'wait15',   emoji: 'wait',    labelKey: 'biz.status.wait15',   moodKey: 'mood.wait15' },
  { id: 'closing30',emoji: 'closing', labelKey: 'biz.status.closing30',moodKey: 'mood.closing30' },
  { id: 'soldOut',  emoji: 'soldOut', labelKey: 'biz.status.soldOut',  moodKey: 'mood.soldOut' },
  { id: 'closed',   emoji: 'closed',  labelKey: 'biz.status.closed',   moodKey: 'mood.closed' },
] as const;
```

Store (`src/state/store.tsx`), actions for C5:

| Action | Effect |
|---|---|
| `setBizMode(on: boolean)` | sets `bizMode`, persisted (already in the plan). |
| `goLive({ stopId, until })` | `liveSession = { spotId:'smash', stopId, until, startedAt: Date.now(), status: null }`; spot override `{ x, y, open: true, mood: { emoji:'truck', key:'mood.justParked' }, hot: true }`; prepend note `t('note.wentLive', { name, place })`. |
| `setLiveStatus(id \| null)` | toggles `liveSession.status`; sets mood to that status's `moodKey` (or back to `mood.justParked` on clear); `closed` sets `open: false`, any other sets `open: true`. |
| `endService()` | `liveSession = null`; override `{ open: false, mood: null, hot: false }`. Position override stays at the last stop (a parked truck that closed is still there). |

`liveSession` is NOT persisted tonight (a reload ends service; acceptable for a demo, note it in the commit).

### 2.2 Journey A: switch modes

**Eater to Business** (You tab, last card):
- Row component: `ModeSwitchRow` in `src/components/business/ModeSwitchRow.tsx`. Card row, `minHeight: 64`, emoji `emoji.biz.store` (hidden from a11y), title `t('you.switchBiz')`, caption `t('you.switchBizCaption', { name })` = "Ember & Bun", chevron.
- `accessibilityRole="button"`, label `t('you.switchBizA11y', { name })` = "Switch to Business mode for Ember & Bun", hint `t('you.switchBizHint')` = "Shows your business tabs".
- On press: `setBizMode(true)`, then `router.replace('/today')` (check the exact href shape of a route inside `(tabs)` in the SDK 58 Expo Router docs), toast `t('biz.switchedIn')` = "Business mode. Your customers see what you post here."
- Tonight there is no claim flow: the sample user already owns Ember & Bun

**Business to Eater**:
- `BizHeader` (`src/components/business/BizHeader.tsx`) on Today, Where, Menu, Promote: FoodArt 42, name + verified check, `BUSINESS` pill, screen caption, and at the right a pill button `t('biz.toPersonal')` = "Personal" with `emoji.avatar.me`. `minHeight: 48`, `paddingHorizontal: 14`, no fixed width (French "Personnel" fits; the label can wrap under the name on narrow screens because the header row uses `flexWrap: 'wrap'`).
- a11y label `t('biz.toPersonalA11y')` = "Switch to your personal account". On press: `setBizMode(false)`, `router.replace('/')`, toast `t('biz.switchedOut')` = "Back to your personal account".
- **Override (02 section 9.4):** the header right side is the Personal button, not a settings gear. Business settings are Later.

**Tab bar**: `(tabs)/_layout.tsx` keeps one `Tabs` with all 8 routes (`index`, `drops`, `ask`, `you`, `today`, `where`, `menu`, `promote`). The custom `tabBar` renders the eater set or business set from `bizMode`; the hidden set gets `href: null` (or the SDK 58 equivalent; verify in the docs before writing it). Center slot: Report (eater) or Go live (business), both actions, not routes.
- Cold start with `bizMode` persisted true: land on Today. If the first render shows Map and then jumps, render nothing (keep the splash up) until the store has hydrated.
- Tab bar container: `accessibilityRole="tablist"`, and `accessibilityLabel` = `t('tabs.eaterA11y')` "Eater tabs" or `t('tabs.bizA11y')` "Business tabs" so a screen reader user hears which mode they are in.

### 2.3 Journey B: go live (the core owner loop)

Entry points (both open the same `GoLiveSheet`, `src/components/business/GoLiveSheet.tsx`):
1. Today, offline: big mint button `emoji.biz.pin + t('biz.goLiveNow')` "Go live now".
2. Center tab while offline. While live, the center tab goes to Today instead.

Sheet (modal bottom sheet, scrim `scrim`, radius `xl`, from 02 section 7.13). Order top to bottom, which is also the focus order:
1. Title `t('biz.goLiveTitle')` "Go live", `accessibilityRole="header"`. Close button (x, `hitSlop`, label `t('common.close')`).
2. Section label `t('biz.whereServing')` "Where are you serving?" (`accessibilityRole="header"`).
3. Stop rows (`StopOption`), one per stop, `minHeight: 56`, full width, selected = mint border + check. Row 1 caption `t('biz.currentLocation')` "Your current location" (sample: it is the first stop); others `t('biz.savedStop', { hood })` "Saved stop · {hood}". `accessibilityRole="radio"`, `accessibilityState={{ checked }}`, label "{name}, {caption}". Wrapper View `accessibilityRole="radiogroup"`.
4. Section label `t('biz.servingUntil')` "Serving until".
5. Until chips (`Chip`, wrap, `minHeight: 48`): formatted with `formatTime()` (section 5.3), last chip `t('biz.untilSoldOut')` "Until sold out". Radio semantics as above.
6. Primary `t('biz.goLiveHere')` "Go live here", 84 tall, mint, `onMint` text, at the bottom with `paddingBottom: insets.bottom + 16`. Label for a11y: `t('biz.goLiveHereA11y', { place, until })` = "Go live at {place}, serving until {until}".

Defaults: stop = the `current` stop; until = the last value used this session, else `defaultUntil` (11pm). So the fastest path is **Go live now, then Go live here: two taps**. That second tap is deliberate: going live broadcasts to followers, so it must be confirmed with the place visible.

On confirm:
- Close the sheet, `goLive(...)`, Today's `LiveCard` cross-fades to live.
- Toast `t('biz.liveToast', { place })` "You're live at {place}. {count} followers were told." (`count` from sample).
- Small celebration: `EmojiRain` with `count={12}` and emoji `food.burger, biz.truck, fx.sparkle`. Reduce motion: toast only.
- Focus: after the sheet closes, move screen reader focus to the LiveCard heading (`AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref))` on native; on web `ref.current?.focus?.()` guarded). If it fails, the toast announcement is enough.
- The eater map reads the spot override, so switching to Personal shows Ember & Bun at the chosen stop with the bubble "Just parked" and a green live dot.

### 2.4 Journey C: live statuses

`LiveCard` live state (Today), top to bottom:
- Heading `t('biz.live')` "You're live", `accessibilityRole="header"`. Dot: mint with text (never color only).
- Line `t('biz.liveFor', { place, duration, until })` "{place} · live for {duration} · until {until}". Duration from `useClock()`: under 60 min `t('time.min', { n })` "{n} min", else `t('time.hm', { h, m })` "{h} h {m} min". Wrap allowed. For the screen reader, give this Text `accessibilityLiveRegion="none"` (do not announce every minute).
- Quick-status grid (`QuickStatusGrid`): 2 columns, `flexBasis: '48%'`, `flexGrow: 1`, `minHeight: 56`, gap 8, emoji 18 left of the label, label wraps to 2 lines. Selected = `neon` background + `onNeon` text + check mark text (not color only). `accessibilityRole="button"` with `accessibilityState={{ selected }}` (radio semantics would block "clear"; a toggle button is the honest role).

| id | Button label (`biz.status.*`) | What customers see on the pin (`mood.*`) | Pin open? |
|---|---|---|---|
| `wait15` | About 15 min wait | ~15 min wait | open |
| `closing30` | Closing in 30 min | Closing in 30 min | open (also gets the amber Closing-soon label, idea B) |
| `soldOut` | Sold out | Sold out for today | open (the truck is still there; the bubble tells people not to come) |
| `closed` | Closed for today | Closed for today | closed (pin dims) |

- Tap a selected status again to clear it: mood back to "Just parked". Toast `t('biz.statusToast', { status })` "Customers see: {status}" or `t('biz.statusCleared')` "Status cleared".
- **Override (mockup and 02):** "Sold out of fries" becomes plain "Sold out". The per-item sold-out belongs to Menu toggles (P2), and the generic label is shorter in French.
- Stat row below (4 `StatCard`s, `flexBasis: '47%'`, wrap to 2 x 2, never fixed width): number (`title`), label (`micro`), delta in mint (`#0d8a62` on day). a11y label per card: `t('biz.statA11y', { value, label, delta })` "412 views, up 18 percent this week".
- Nudge card: `t('biz.nudge', { count, food, area })` "{count} people nearby searched for {food} in the last hour. Most are around {area}." No link tonight (Where is a placeholder); do not render the "See the heatmap" link.

### 2.5 End service

- Ghost `Button`, full width, `minHeight: 48`, 24 above it, label `t('biz.endService')` "End service".
- Two-step: first tap changes the label to `t('biz.endServiceConfirm')` "Tap again to end service" and the button tone to `hot` outline for 4 s (timer from `useClock`, not a new interval: store `armedAt` and compare). Second tap within 4 s calls `endService()`. Screen reader: the label change is announced via `announceForAccessibility(t('biz.endServiceConfirm'))`.
- After: toast `t('biz.ended')` "Service ended. See you next time.", card goes back to offline, offline line shows the next stop.
- Cut fallback: single tap plus the toast.

### 2.6 Offline Today

- `LiveCard` offline: heading `t('biz.offline')` "You're offline", grey dot + text, line `t('biz.nextStop', { place, time })` "Customers see your next stop: {place}, {time}", then the 84-tall Go live now.
- Stat row and nudge card also show while offline (owners check numbers before service).

### 2.7 Where, Menu, Promote placeholders (C5)

Use 02's `ComingNext` component and copy (section 9.5) with these a11y additions: the title is `accessibilityRole="header"`; the "Coming next" badge reads as text; the screen is not empty for a screen reader (title, body, badge are each focusable text). Add one useful action on each so the screen is not a dead end:

| Screen | Action button (ghost, 48) | Does |
|---|---|---|
| Where | `t('biz.where.action')` "Go live from a saved stop" | opens `GoLiveSheet` (disabled with `t('biz.alreadyLive')` "You're already live" when live) |
| Menu | `t('biz.menu.action')` "See your public page" | `router.push('/spot/smash')` |
| Promote | `t('biz.promote.action')` "See Drops as customers do" | toast `t('common.comingNext')` (Drops tab is hidden in biz mode) |

### 2.8 P2, only if C5 finishes early: Menu sold-out toggles

- Data: `BUSINESS.menu` = Classic smash 9, Double smash 11, Onion rings 5, Fries 4, Shake 6 (mockup line 931), emoji keys in `emoji.ts`.
- Row `MenuItemRow`: `minHeight: 56`, name + price (`formatPrice(9, 'USD')`), a `Switch` from react-native on the right (`trackColor` true = `hot`), the whole row pressable, `accessibilityRole="switch"`, `accessibilityState={{ checked: soldOut }}`, label `t('biz.menu.soldOutA11y', { item })` "{item} sold out today".
- Toggle toasts: `t('biz.menu.markedOut', { item })` "{item} marked sold out" / `t('biz.menu.back', { item })` "{item} is back". The spot page's Top dishes shows a `Sold out today` badge for that item.

### 2.9 One-handed and bright-sun use (owners serving from a truck window)

- All controls used during service (statuses, End service, Go live here) are in the lower half: Today puts `LiveCard` first, but its buttons are large and full width; on phones under 700 pt tall the stat row moves under the card, never above it.
- No swipe-only or long-press-only actions in Business mode. Every action is a single tap on a 48+ target.
- No hover, no tiny text links in Business mode: the nudge has no link tonight; anything tappable is a Button.
- Bright sun: Business mode follows the theme like the rest of the app, and the You theme control already offers Day. For readability outside, in Business screens use `ink` (not `ink2`) for every status line and the live-for line, minimum `ui` 14, and the status labels `heading` 17 on the quick-status buttons. Day palette mint as text must be `#0d8a62` (5.0:1 on `paper`), never `#34e0a1` (1.6:1).
- Do not rely on the glow to show live: the live state always has the words "You're live" plus the mint card border (2 px).

---

## 3. Screen reader labels for pins, emoji and moods

### 3.1 Pin label (C2, `SpotPin`)

Format (01 section 6.8, made concrete): `t('pin.a11y', { name, kind, status, distance, mood })`

- en: `"{name}, {kind}, {status}, {distance}{mood}"` where `mood` is `", " + moodText` or empty.
- Example: "Taquería La Güera, food truck, open until 10 PM, 0.5 miles away, hot right now".
- `kind` from `t('kind.truck')` etc.: food truck, cart, trailer, pop-up, market stall, small restaurant.
- `status`: `t('status.openUntil', { time })` "open until {time}", `t('status.hereUntil', { time })` "here now until {time}" (trucks, carts, trailers), `t('status.closedNext', { time })` "closed, next {time}", `t('status.closingSoon', { time })` "closing soon, at {time}".
- `distance`: `formatDistance(m, { long: true })` "0.5 miles away" / "800 metres away". The visual label uses the short form ("0.5 mi").
- Hint: `t('pin.hint')` "Shows details". Role `button`, `accessibilityState={{ selected }}` for the selected pin.
- Filtered-out pins: `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` (and `pointerEvents="none"`), so the screen reader list matches what is visible.
- Children (emoji Text, kind chip, live dot, mood bubble) are not separately focusable: the pin wrapper is `accessible` and children inherit.

### 3.2 Moods are data, not strings with emoji

The mockup stores `mood: '🔥 Hot right now'`. Tonight store `mood: { emoji: 'hot', key: 'mood.hot' } | null` in sample data and overrides; the bubble renders `emoji.mood[m.emoji]` + `t(m.key)`, and the pin label uses only `t(m.key)`. This keeps emoji out of translations and stops screen readers from reading "fire".

Mood keys from the v4 sample: `mood.hot` Hot right now, `mood.line25` 25-min line, `mood.newPecan` New: pecan croissant, `mood.justParked` Just parked, `mood.sausageOut` Sausage sold out, `mood.lunchDeal` $10 lunch deal, `mood.seatsLeft` {n} seats left, plus the four status moods and the report moods (`mood.amazing`, `mood.longLine`, `mood.goodDeal`, `mood.soldOutReport`).

### 3.3 Emoji everywhere else

- Decorative emoji (food art, list icons, chip icons, tab icons, the rain, bursts): `accessible={false}` and `importantForAccessibility="no"` on native; on web, `aria-hidden` via `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"` on the emoji Text.
- Emoji that carry meaning (report options, quick statuses, the live dot): the meaning is in the parent's text label; the emoji itself stays hidden.
- `emoji.ts` exports a parallel `emojiA11y` map only for the rare emoji shown alone (avatar picker Later). Not needed tonight.
- Star ratings: text "4.8 stars, 212 reviews" as the label (`t('spot.ratingA11y', { r, n })`), the star glyphs hidden.
- Price `$` / `$$`: label `t('price.a11y.1')` "inexpensive", `.2` "moderate", `.3` "pricey".

---

## 4. Accessibility checklist per screen

Legend: **L** label/role, **F** focus order, **T** targets, **C** contrast, **RM** reduce motion, **S** text scaling. "Owner" says which chunk builds it.

| Screen / component | Must-haves |
|---|---|
| Splash (exists) | Already skips to a fade under RM. Do not change. |
| Tab bar (C1, C5) | L: `tablist` with mode label (2.2); tabs `tab` + `selected`; center button `button` with `t('tabs.reportA11y')` / `t('tabs.goLiveA11y')` "Go live" or `t('tabs.liveA11y', { duration })` "You're live for {duration}. Opens Today". F: left to right, center in the middle. T: each slot 48 tall min. S: labels wrap to 2 lines, never shrink. RM: no icon lift, no live pulse. |
| Map top bar (C2) | F: Ask pill, then bell, then day/night toggle, then filter chips, then ticker. L: Ask pill `button` "Ask Lokal"; bell `button` `t('map.bellA11y', { n })` "Notifications, {n} new"; toggle `switch` with `checked` = night, label "Night map". Ticker: `accessibilityLiveRegion="none"`, label is the current line; it must NOT announce every 4 s. RM: ticker swaps text with no slide. |
| Filter chips (C2) | L: `button` + `selected` (or `radio` in a `radiogroup`, pick one and be consistent; 01 uses selected). T: `minHeight: 48` override of 44 for chips over the map. C: selected `onNeon` on `neon` 12.3. S: horizontal ScrollView, chips grow. |
| Map + pins (C2) | Section 3.1. Map canvas: `accessible={false}`, the SVG world hidden from a11y (`importantForAccessibility="no-hide-descendants"`). Zoom +/- and recenter: `button`, labels `t('map.zoomIn')` "Zoom in", `t('map.zoomOut')` "Zoom out", `t('map.recenter')` "Center on me", `accessibilityState={{ disabled }}` at limits. F: pins sorted by distance from ME in render order so swiping through them goes nearest first (selected pin may render last visually; use `zIndex` for the visual order and keep the array sorted for a11y). RM: no bob, no sparks, `animateTo` jumps (or 150 ms). |
| Bottom sheet (C2) | L: grabber is a `button` "Spot list, half open. Double tap to expand" (`t('sheet.handleA11y', { state })`) cycling peek, half, full; `accessibilityActions` increment/decrement as a bonus. F: after a pin tap, focus moves to the preview name. T: action buttons in the preview `minHeight: 48`, `flex: 1`, wrap. RM: snaps without spring (150 ms). Closing-soon label is text "Closing soon" in amber, not color alone. |
| Spot page (C3) | F: Back, name (header), rating, status card, actions (Check in, Report, Go), then the rest. L: Back `t('common.back')`; Go `link` role with `t('spot.goA11y', { name })` "Directions to {name}, opens maps"; vote thumbs `button` with `selected`, labels `t('report.voteUp')` "Still true" / `t('report.voteDown')` "Not anymore". Busy bars: one summary label on the chart View, `t('spot.busyA11y', { now })` "Busy times. Right now: {now}"; individual bars hidden. Dish bar: label "{dish}, {price}, {pct} percent liked it". C: AI badge grape on card 6.1. S: header art scales, name `display` with `maxFontSizeMultiplier 1.6`. |
| Report radial (C3) | Screen reader on (`AccessibilityInfo.isScreenReaderEnabled()` + `screenReaderChanged` listener) or RM: vertical list, each option a 56-tall row. L: overlay `accessibilityViewIsModal` (iOS) and on Android hide the screen behind with `importantForAccessibility="no-hide-descendants"`; title header `t('report.title')` + `t('report.at', { spot })`; close button first in focus order. Escape/back closes it (web `keydown` Escape, Android `BackHandler`). |
| Check-in rain, bursts, floats (C3) | `pointerEvents="none"`, hidden from a11y, unmount when done. RM: fade + toast only. Toast text carries the news: `t('checkin.done', { spot })` + `t('rep.gained', { n })` "+{n} rep". |
| Toast (C1) | Announces. Not focusable. Holds 2.2 s, 3.2 s over 60 characters; **add**: 4.5 s when a screen reader is on (people need time to hear it). |
| Drops (C4) | L: card label "{title}, {spot}, {state}" where state is "starts in 1 hour 12 minutes" (spoken form, not "1:12:14"), or "live now, 12 of 20 left". Countdown Text: `accessibilityLiveRegion="none"`, never announce ticks. Remind me: `button` + `selected`, labels flip. Claim modal: `accessibilityViewIsModal`, focus to its title, close button 48. RM: bar drain is a value change only, burst is a fade. Code: `display` size, `selectable`, letters spaced (`letterSpacing: 2`) and read with spaces `t('drops.codeA11y', { code: 'L K 4 7' })`. |
| Ask (C4) | L: Demo badge is text and sits in the header, `t('ask.demoNote')` is plain text below it. Chips `button`. New bot answers: `accessibilityLiveRegion="polite"` on the latest answer container (Android) + `announceForAccessibility(answerText)` (iOS/web). Input `accessibilityLabel={t('ask.placeholder')}` (placeholder alone is not a label). Send button `button` "Send", disabled state when empty. F: after send, focus stays in the input. |
| You (C4) | Level and rep: one label "Regular, 340 rep, 160 rep to Local". Theme control: `radiogroup` of Auto / Night / Day `radio` + `checked` (02 section 9.3). Mode switch row (2.2). |
| Business Today (C5) | Section 2. F: header (name, Personal), LiveCard heading, live line, Go live / statuses, End service, stats, nudge. |
| Go live sheet (C5) | Section 2.3. Modal semantics as in the radial. |
| Placeholders (C5) | Section 2.7. |

### 4.1 Contrast (use 01 section 1.3 pairs only)

Extra rules for tonight:
- Text over the illustrated map (mood bubbles, ticker, chips) always sits on `glass` or the bubble background, never directly on the map.
- Mood bubble night: `#fff` on `rgba(12,13,26,0.90)` over any map color: worst case about 15:1. Day: `#16172b` on `#fff`.
- Amber "Closing soon" on day: `#a35f00` text (4.6:1 on `#f3f4f8`), not `#ffb020` (1.9:1). **Add** to the day palette as `amber: '#a35f00'` if 01's day value is the bright one.
- Disabled buttons: keep label `ink2` (not `ink3`) so they still read at 5.7:1, and set `accessibilityState={{ disabled: true }}`.
- Focus ring on web: `neon` 2 px outline (01 section 8) on every Pressable, including chips and pins.

### 4.2 Reduce motion (one hook, one table)

`src/hooks/use-reduce-motion.ts`: `AccessibilityInfo.isReduceMotionEnabled()` plus `addEventListener('reduceMotionChanged', ...)`; on web also `window.matchMedia('(prefers-reduced-motion: reduce)')` with a change listener (guard `typeof window`). Returns a boolean. Every `Animated.loop` checks it.

| Motion | Normal | Reduce motion |
|---|---|---|
| Pin bob, sparks, hot ring | loops | none |
| Map `animateTo` | 400 ms ease | jump, or 150 ms |
| Sheet snaps | spring | 150 ms timing |
| Report radial | fan-out stagger | vertical list, fade 150 ms |
| Emoji rain (check-in, go live) | 30 / 12 particles | none; toast only |
| `+5 rep` burst, emoji float | rise + fade | fade in place |
| Drops claim burst | burst | fade |
| Go live shine, live pulse | loops | none; static ring opacity 0.35 |
| Ticker | slide | text swap |
| Tab icon lift | 250 ms | static |

### 4.3 Text scaling

- Keep `allowFontScaling` on everywhere. `maxFontSizeMultiplier={1.6}` on `display` and `title` (01); `2.0` on everything else via the `Text` component default; tab labels `1.4` (they must stay in the bar).
- Never `height` on a container with text; use `minHeight`. Never `numberOfLines` on buttons, chips, toasts, status lines. Allowed: mood bubble (1 line, full text is in the pin label), trending card title (2 lines).
- Test: iOS Larger Text at the second-largest standard size, Android font size "Largest", web browser zoom 200%. Nothing overlaps; the tab bar grows taller instead of clipping.

---

## 5. Localization: French length, units, time

### 5.1 Strings

- All keys from 02 section 10 plus the new keys in section 6 below. `fr-CA.ts` has the same keys with en values tonight.
- Interpolate whole sentences, never concatenate fragments: `t('biz.liveFor', { place, duration, until })`, not `place + ' · ' + t('liveFor')`. French word order differs.
- French punctuation needs a no-break space before `: ? ! ;` and inside « »; put punctuation inside the translation value, never add it in code.
- Plurals: tonight use two keys where a count shows (`drops.leftOne` / `drops.left`), chosen by a tiny `plural(n, one, other)` helper in `src/i18n/index.ts` using `Intl.PluralRules` (built into Hermes and browsers, no library).

### 5.2 Distance (`src/i18n/units.ts`)

```ts
const METERS_PER_WORLD_UNIT = 1609.344 / 600; // mockup: miles = hypot(dx, dy) / 600
export const usesMiles = () => region() === 'US';   // region from Intl.DateTimeFormat().resolvedOptions().locale, e.g. 'en-US', 'fr-CA'; default US
export function formatDistance(meters: number, opts?: { long?: boolean }): string
```

| Region | Under threshold | Otherwise | Long form (a11y) |
|---|---|---|---|
| US | under 0.25 mi: `t('dist.walk', { min })` "{min} min walk" (min = round(miles x 20), at least 1) | `0.5 mi` (1 decimal) | "0.5 miles away" |
| CA / other | under 400 m: same walk form (min = round(m / 80)) | `800 m` under 1 km (round to 50), else `1.2 km` | "800 metres away" / "1.2 kilometres away" |

Numbers through `Intl.NumberFormat(locale, { maximumFractionDigits: 1 })` so fr-CA shows `1,2 km`.

### 5.3 Time and price

- `formatTime({h, m})` with `Intl.DateTimeFormat(locale, { hour: 'numeric', minute: m ? '2-digit' : undefined })`: en-US "10 PM", fr-CA "22 h". Store times in sample data as `{h, m}`, not "10pm" strings. If porting all 12 spots' `until` is too slow tonight, do it for Ember & Bun and the Go live chips (owner-facing), leave the rest as P1.
- `formatPrice(n, currency)` with `Intl.NumberFormat(locale, { style: 'currency', currency })`. Sample spots are in Austin: `USD`.
- Duration for the live timer and Drops via `t()` keys (`time.min`, `time.hm`, `drops.countdownA11y`), not `toLocaleString`.

### 5.4 The 30% pad test (run once per chunk)

Turn on the pad flag from 02 section 10, then check these, which are the tightest:

| Place | en | Plausible fr-CA (for eyeballing, not final copy) |
|---|---|---|
| Tab labels | Promote | Promouvoir |
| Center tab | Go live | Passer en direct |
| Today header button | Personal | Personnel |
| Go live button | Go live here | Passer en direct ici |
| Quick status | Closing in 30 min | Fermeture dans 30 min |
| Quick status | About 15 min wait | Environ 15 min d'attente |
| End service | Tap again to end service | Touchez encore pour terminer le service |
| Until chip | Until sold out | Jusqu'à épuisement |
| Mode row | Switch to Business mode | Passer au mode Entreprise |
| Sheet preview actions | Check in / Report / Open | Je suis ici / Signaler / Ouvrir |
| Filter chip | Trucks & carts | Camions et chariots |
| Stat label | check-ins | visites confirmées |
| Drops | Starts in | Commence dans |

Pass = no clipped word, no overlap, buttons grow taller, tab bar grows taller, nothing scrolls horizontally except the chip row and the trending cards.

---

## 6. New copy keys from this file (add to `en.ts`, copy to `fr-CA.ts`)

| Key | en |
|---|---|
| `you.switchBizCaption` / `you.switchBizA11y` / `you.switchBizHint` | {name} / Switch to Business mode for {name} / Shows your business tabs |
| `biz.switchedIn` / `biz.switchedOut` | Business mode. Your customers see what you post here. / Back to your personal account |
| `biz.toPersonal` / `biz.toPersonalA11y` | Personal / Switch to your personal account |
| `tabs.eaterA11y` / `tabs.bizA11y` | Eater tabs / Business tabs |
| `tabs.goLiveA11y` / `tabs.liveA11y` | Go live / You're live for {duration}. Opens Today |
| `biz.goLiveTitle` / `biz.whereServing` | Go live / Where are you serving? |
| `biz.currentLocation` / `biz.savedStop` | Your current location / Saved stop · {hood} |
| `biz.goLiveHereA11y` | Go live at {place}, serving until {until} |
| `biz.liveToast` (**override 02**) | You're live at {place}. {count} followers were told. |
| `biz.status.wait15` / `.closing30` / `.soldOut` / `.closed` | About 15 min wait / Closing in 30 min / Sold out / Closed for today |
| `mood.wait15` / `mood.closing30` / `mood.soldOut` / `mood.closed` | ~15 min wait / Closing in 30 min / Sold out for today / Closed for today |
| `mood.justParked` / `mood.hot` / `mood.line25` / `mood.newPecan` / `mood.sausageOut` / `mood.lunchDeal` / `mood.seatsLeft` | Just parked / Hot right now / 25-min line / New: pecan croissant / Sausage sold out / $10 lunch deal / {n} seats left |
| `biz.statusCleared` | Status cleared |
| `biz.endServiceConfirm` | Tap again to end service |
| `biz.statA11y` | {value} {label}, {delta} this week |
| `biz.nudge` | {count} people nearby searched for {food} in the last hour. Most are around {area}. |
| `biz.where.action` / `biz.menu.action` / `biz.promote.action` / `biz.alreadyLive` | Go live from a saved stop / See your public page / See Drops as customers do / You're already live |
| `note.wentLive` | {name} just went live at {place} |
| `time.min` / `time.hm` | {n} min / {h} h {m} min |
| `pin.a11y` / `pin.hint` | {name}, {kind}, {status}, {distance}{mood} / Shows details |
| `kind.truck` / `.cart` / `.trailer` / `.popup` / `.stall` / `.restaurant` | food truck / cart / trailer / pop-up / market stall / small restaurant |
| `status.openUntil` / `status.hereUntil` / `status.closedNext` / `status.closingSoon` | open until {time} / here now until {time} / closed, next {time} / closing soon, at {time} |
| `dist.walk` / `dist.miLong` / `dist.mLong` / `dist.kmLong` | {min} min walk / {n} miles away / {n} metres away / {n} kilometres away |
| `map.bellA11y` / `map.zoomIn` / `map.zoomOut` / `map.recenter` / `map.nightA11y` | Notifications, {n} new / Zoom in / Zoom out / Center on me / Night map |
| `sheet.handleA11y` | Spot list, {state}. Double tap to change size |
| `sheet.state.peek` / `.half` / `.full` | collapsed / half open / expanded |
| `spot.ratingA11y` / `spot.goA11y` / `spot.busyA11y` | {r} stars, {n} reviews / Directions to {name}, opens maps / Busy times. Right now: {now} |
| `price.a11y.1` / `.2` / `.3` | inexpensive / moderate / pricey |
| `report.voteUp` / `report.voteDown` | Still true / Not anymore |
| `rep.gained` | +{n} rep |
| `drops.countdownA11y` / `drops.codeA11y` | starts in {h} hours {m} minutes / Your code: {code} |
| `ask.send` | Send |
| `biz.menu.soldOutA11y` / `biz.menu.markedOut` / `biz.menu.back` (P2) | {item} sold out today / {item} marked sold out / {item} is back |

---

## 7. Acceptance checks for the supervisor (add to C5's done list)

1. With VoiceOver (iOS Safari on the dev server) or TalkBack, or the web a11y tree in Chrome DevTools: tab through Map; every pin reads "name, kind, status, distance"; no emoji names are spoken.
2. You, then "Switch to Business mode", lands on Today; the tab bar reads "Business tabs"; "Personal" returns to Map. Reload in Business mode lands on Today.
3. Go live now, then Go live here (two taps, defaults). Toast announces the place. Personal mode: Ember & Bun pin at the chosen stop, "Just parked", open.
4. Each quick status changes the bubble and announces "Customers see: ...". Tapping it again clears. Closed for today dims the pin.
5. End service needs two taps within 4 s; the pin goes closed.
6. Device reduce motion on: no bob, no rain, radial is a list, no live pulse.
7. Pad flag on: Today, Go live sheet, tab bars (both), sheet preview, You pass section 5.4.
8. Set the browser locale to `fr-CA` (or temporarily force the locale in `src/i18n/index.ts`): distances show km with a decimal comma; Go live chips show "22 h" style times.
9. Every new pressable measures at least 48 (check in the web inspector) or has `hitSlop`.
10. Tap pin opens preview: on web, click 3 different stickers; each shows the sheet preview at half within 250 ms and its pin lifts (scale 1.2, up 5). Clicking empty map closes the preview.

---

## Later (not tonight)

- Claim and verify flow, add a business, multiple trucks, team roles, business settings gear.
- Where heatmap with an accessible list alternative ("Top areas right now" as text), weekly stops editor.
- Promote: drop composer (name, portions, start time with a 48-pt stepper, followers-first toggle), follower messaging with the 3-per-week limit shown as text, link-in-bio and QR.
- Snap-a-menu, review replies with AI suggestion (label it AI), insights screen with chart text summaries.
- Persist `liveSession`; "Still serving?" reminder at the `until` time; auto end service.
- High-contrast "Sun mode" for Business (pure white background, black text, 2 px borders), triggered from Today.
- Real fr-CA copy by a native Canadian French speaker; full pluralization; 24-hour times everywhere; CAD prices for Canadian spots.
- Dynamic Type audit at the accessibility sizes (up to 310%), switch control and keyboard-only pass on web, Android TalkBack custom actions on pins (Check in, Report, Open).
- Haptics on go live and status change (needs expo-haptics, a native module).
