# Night build 03: UX, eater flows

Owner: UX expert 1 (eater journeys, report, celebrations, accessibility, reduce motion).
Audience: the one developer building C1 to C5 tonight on `night-build`.
Inputs: `DEVELOPMENT_PLAN.md`, `design/DESIGN_LOG.md`, `design/lokal-mockup-v3.html`, `design/lokal-mockup-v4.html`, and the visual spec `design/night-build/01-ui-design-system.md` (tokens, component sizes, toast keys). This file gives behavior, decisions and copy. It does not repeat the visual values in 01. Where the two files disagree on copy, use this file. Where they disagree on visuals, use 01.

Voice: a local friend who knows every truck. Short, warm, specific, never salesy. Use "spot" (not "venue" or "business") and "rep" (not "points" or "XP"). Avoid exclamation marks, with one exception: the "Be the first!" prompts.

---

## 0. Priority list (what matters most tonight)

1. **Map to pin to sheet preview to spot page and back, with state kept** (C2/C3). This is the core loop. If only one thing is polished, polish this one.
2. **One-tap Report radial with its honest result** (C3). The target spot name is always shown, the mood bubble updates on the map, the report appears on the spot page, and the toast confirms it. The list fallback must work for screen readers and reduce motion.
3. **Check-in with the emoji rain, the rep and the "You're here" state** (C3). It plays once per spot, it never blocks taps, and it cleans up after itself.
4. **"Still there?" freshness label plus "Yep, still here"** (idea A, C2/C3). This is what makes the map feel live and trustworthy.
5. **Accessibility basics on every flow** (all chunks). Pins are labeled buttons, the sheet works by button, the radial has a list fallback, nothing loops under reduce motion, and emoji are hidden from the screen reader.
6. **Drops countdown, Remind me and Claim code** (C4).
7. **Ask (canned, labeled Demo) with Show on map** (C4).
8. **You tab: rep, level and theme control** (C4).

Cut first if behind: the Ask typing animation, the Copy code button in the claim modal, the level-up toast, the first-launch hint chip, and the "+5 rep" burst (the toast still confirms the action).

---

## 1. Rules shared by every flow

### 1.1 Rep (quiet, earned only by helping other eaters)

All numbers live in one file, `src/state/rep.ts`. The store and the You tab import from it, and nothing else hard-codes a rep value.

```ts
export const REP = {
  report: 5,        // radial pick, except Photo and New spot (those give 0 tonight; nothing is posted)
  checkIn: 10,      // first check-in at a spot per session
  stillHere: 2,     // "Yep, still here", once per spot per 30 min
  vote: 2,          // first vote on a given report (changing your vote later gives 0)
  claimDrop: 0,     // claiming is a perk, not a contribution
} as const;

export const LEVELS = [
  { key: 'newcomer', min: 0 },
  { key: 'regular',  min: 100 },
  { key: 'local',    min: 300 },
  { key: 'legend',   min: 1000 },
] as const; // labels via t('level.newcomer') etc.

export const STILL_HERE_COOLDOWN_MS = 30 * 60_000;
export const REPORT_DEDUPE_MS = 10 * 60_000;   // same type, same spot, by you
```

- A new user starts at 0 rep (Newcomer). Do not seed the mockup's 340: the You tab must show what this session actually earned (that is a C4 done-when).
- Never animate the number counting up. Just swap the value and show the "+N rep" burst once.
- Level-up (stretch): a single toast, `toast.levelUp` "You're a {level} now. Thanks for helping out." No modal and no confetti.

### 1.2 Distance, time and status text (one helper, `src/data/format.ts`)

- Distance: `miles = hypot(dx, dy) / 600` on the 1400x1800 world from ME (820,700), as in the mockup. Under 0.25 mi, show `"{n} min walk"` with n = max(1, round(miles*20)); otherwise `"{d} mi"` with 1 decimal. If the locale region is CA, show km instead (`miles*1.609`, `"{d} km"`). Read the region from `Intl.DateTimeFormat().resolvedOptions().locale`.
- Status (open): trucks, carts and trailers read "Here now · until {until}". Restaurants read "Open · until {until}". Status (closed): "Next: {until}". Tonight the sample's `open` flag is static. Do not compute it from the clock, otherwise the map is empty at 3am.
- **Closing soon (idea B):** add `closesInMin` to the sample spots that close soonest (features builder: Post Oak Pit 25, Kolache Corner 40, Bean Bike 55). Compute the minutes left as `closesInMin - minutesSinceAppStart` from `use-clock`. The label shows when 0 < left <= 60: amber "Closes in {min} min". At 0 or below, show "Closing now". Sort the "Closest to you" list as closing-soon first (fewest minutes first), then by distance.
- **Freshness (idea A)**, computed from the newest report or still-here confirmation for that spot (sample reports carry an age in minutes):

| Newest confirmation | Label (`fresh.*`) | Tone |
|---|---|---|
| By you, under 2 min ago | "You confirmed it just now" | mint |
| Under 15 min | "Seen {min} min ago" | mint |
| 15 to 60 min | "Seen {min} min ago" | ink2 |
| Over 60 min | "Last seen {hr} hr ago. Still there?" | amber |
| None | "No recent reports. Still there?" | ink2 |

  The "Yep, still here" button shows in the sheet preview and on the spot page only when the spot is open. After a tap it reads "Thanks" (disabled) until the cooldown ends. A second tap inside the cooldown is not possible, so there is nothing to farm.

### 1.3 Toasts

Use one at a time (queue them), with no action buttons tonight. All copy goes through `t()`. Keys from 01 are reused; keys new in this file are marked NEW in section 9.

### 1.4 Accessibility contract (applies to every flow below)

- Emoji are decorative: wrap them in a Text with `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"` (web: `aria-hidden`). The label carries the meaning.
- Every Pressable has `accessibilityRole`, an `accessibilityLabel`, `accessibilityState` (selected, disabled, checked) where relevant, and a 44pt minimum target (or `hitSlop`).
- Announce results that happen away from focus with `AccessibilityInfo.announceForAccessibility(text)`: report saved, check-in, pin selected, drop claimed. Use the same string as the toast, so there is no double wording.
- `useReduceMotion()` gates every loop and every spring. `useScreenReader()` is a tiny hook next to it: `AccessibilityInfo.isScreenReaderEnabled()` plus the `screenReaderChanged` listener. It gates the radial layout.
- Map panning is not accessible by nature. The accessible path to every spot is the sheet's "Closest to you" list, which contains all matching spots, not a top 5.

### 1.5 Reduce motion table (one place to check)

| Animation | Normal | Reduce motion |
|---|---|---|
| Pin bob, hot ring, live-dot pulse, you-dot pulse | loop | static |
| Sheet snap | spring | 150 ms timing |
| Radial fan-out | 35 ms stagger spring | list sheet, 150 ms fade |
| "+5 rep" burst and emoji float | rise 40 px, 900 ms | fade in and out in place, 600 ms |
| Emoji rain | 30 emoji, ~1.8 s | no rain: a 150 ms fade of one big emoji in the center (600 ms hold), plus the toast |
| Drop claim burst | burst | fade |
| Ticker | cross-fade every 4 s | swap with no fade, every 4 s; screen reader: not live (no announcements) |
| Go live celebration (C5) | small burst | fade plus toast |
| Closing-soon pulse | optional loop | static |

---

## 2. First launch

**Steps**
1. The native splash, then `AnimatedSplash` (unchanged), cross-fades into the Map tab. There is no onboarding tonight.
2. The map opens centered on ME (820,700) at the middle zoom level, with the sheet at **peek**.
3. About 400 ms after the splash finishes, one toast: `toast.welcome` "{count} local spots near you. 0 chains." (count = spots in the sample). It shows once per app launch, from a module-level flag, not persisted.
4. Peek sheet header: "Live near you" / subline "{count} local spots · {live} open now · 0 chains".
5. Hint chip (stretch, until the first pin tap of the session) inside the peek sheet, under the header: "Tap a sticker to see what's cooking". It hides after the first tap.

**Decisions**
- No location permission prompt: tonight "you" is a fixed sample point. Do not show a fake permission dialog.
- No sign-in, no craving picker (out of scope).
- Theme: auto (night 19:00 to 06:59). If the device hour is daytime, the day map shows. That is correct, and the toggle is one tap away.

**Errors**
- AsyncStorage read fails or is empty: start with defaults (0 rep, auto theme, eater mode) with no message. A failed write is caught silently.

---

## 3. Browsing the map

**Steps**
1. Drag pans the map (clamped to the world). The plus and minus buttons step through 3 zoom levels. The recenter button animates to ME.
2. Ticker under the chips: rotates TICKS every 4 s from `use-clock`. Format: avatar plus "{handle} {text}", for example "@tacotania reported Hot at Taquería La Güera".
3. Top bar:
   - The Ask pill "Ask Lokal: tacos open now under $10" routes to the Ask tab.
   - The bell shows the unread count from NOTES. Tap: if there is no inbox screen yet, `toast.inboxSoon` "Your inbox is coming next".
   - The day/night toggle cycles night and day (not auto; auto lives on the You tab). Toast `toast.nightOn` "Night map on" or `toast.dayOn` "Day map on".
4. Tap a pin:
   - `animateTo(spot.x, spot.y + 120)` so the pin sits above the half sheet.
   - The sheet goes to **half** with the preview.
   - Announce "{name} selected. Details below."
5. Tap empty map (a tap with no drag, under 8 px of movement): clear the selection and send the sheet back to peek.

**Sheet, explore state (no selection)**
- "Trending right now": horizontal cards of spots with `hot` or a mood, at most 6. Tap opens the **preview** (not the spot page), so the map context stays.
- "Closest to you": every matching spot, closing-soon first, then by distance. A row shows the name, status line, amber closing label when present, "★ {r} · {p} · {kind}" and the distance. Tap does the same as a pin tap.
- Bottom of the list, always: the quiet-area card (section 4.2).

**Sheet, preview state (spot selected)**
- Header: name (wraps), "★ {r} ({rv}) · {p} · {kind}", the status line, and a close button labeled "Close preview".
- Friends line when present: "Maya and 2 friends love this".
- Mood badge plus "{distance} · {hood}".
- Freshness label plus the "Yep, still here" button (section 1.2).
- Action row: **Check in** (mint), **Report**, **Go**. Then the full-width **Open** button: "See menu, busy times & reviews" (FR long, see section 10).
- "In short" AI line, with the grape AI badge "AI summary".

**Sheet accessibility**
- The header grabber is a button. Its label is "Sheet, {state}" ("Sheet, peek", "Sheet, half", "Sheet, full") and its hint is "Double tap to show more". A tap cycles peek, half, full, peek.
- When the preview opens, focus moves to the spot name (set an `accessibilityLabel` on the name heading with `accessibilityRole="header"`).

**Decisions**
- Selection is kept in the store (`selectedSpotId`), not in component state, so returning from the spot page, Ask's "Show on map" and the radial all agree on it.
- A filter change clears the selection, unless the selected spot still matches the filter.

---

## 4. Filtering and quiet areas

### 4.1 Filters

Chips: All · Open now · Trucks & carts · Tacos · BBQ · Sweets & coffee · Asian · Pop-ups · $ Cheap eats.

- Single select. Tapping the selected chip again returns to All.
- Non-matching pins fade to 0.3 and stop taking taps. Matching pins stay full. The map is never blank: even with zero matches, all pins stay visible, dimmed.
- Mapping (fields from sample): open = `open`; trucks = kind in {truck, cart, trailer}; tacos = `c==='tacos'`; bbq = `c==='bbq'`; sweets = `c==='sweets'`; asian = `c==='asian'`; popup = kind `popup`; cheap = `p==='$'`.
- The sheet subline updates to "{n} match · {filterLabel}" and "Closest to you" shows only the matches.
- Chip a11y: `accessibilityRole="button"` with `accessibilityState={{ selected }}`, and the label is the plain chip text with no emoji. Announce "{n} spots match {filter}".

### 4.2 Quiet-area and empty states (design for every city, even tonight)

Austin sample data never runs empty, but build the states so the Supabase swap does not need new UX:

| Case | Where | Copy (`empty.*`) | Action |
|---|---|---|---|
| Filter has 0 matches | Closest list | "Nothing like that open nearby right now." / "Try another filter, or check back tonight." | Ghost button "Show all" sets the filter to All |
| Fewer than 3 trucks or carts in view | Card at the bottom of "Closest to you" | "No trucks reported here yet. Be the first!" / "Know a truck or pop-up we're missing? Add it in a few taps." | Button "Add a spot" shows `toast.newSpotSoon` "Adding new spots is coming next" |
| Always (bottom of the list) | Same card, when the case above does not apply | "Know a spot we're missing?" | Same button |
| Spot with no reports | Spot page, live reports | "No reports yet. Be the first to say what's happening." | Ghost button "Report" opens the radial for this spot |

---

## 5. Opening a spot

**Steps**
1. From the preview, "See menu, busy times & reviews" runs `router.push('/spot/' + id)`. Trending cards in the sheet open the preview first. Only the Open button pushes the page.
2. The spot page sections, in order (layout owned by UI 2):
   - art header
   - name and meta
   - "Not a chain" and "Run by {own}"
   - friends line
   - live status card: status, freshness, "Yep, still here"
   - 7-day schedule (trucks, carts and trailers only; '—' reads "Off")
   - "What people say" with the AI badge
   - action row: Check in, Report, Go
   - busy-time bars
   - top dishes
   - vibe chips
   - live reports with votes
3. Back (header back button, Android back, browser back) returns to the map with the same pan, zoom, filter, selection and sheet snap. Keep the map mounted: the spot page is a stack push over `(tabs)`, so it never unmounts.

**Decisions and copy**
- "Not a chain" badge: always shown, with the a11y label "Not a chain. Lokal only lists independent spots."
- "Run by {own}", for example "Run by Rosa & Miguel".
- Busy bars: 16 bars, 8am to 11pm. "Now" is the bar for the current device hour, clamped to 8 to 23 (outside that range no bar is highlighted and the caption reads "Usually closed at this hour"). Caption: "Now: {busyWord}" with busyWord = as busy as it gets / usually busy / a little busy / usually quiet / closed (thresholds 9 / 6 / 3 / >0 / 0, from the mockup). Bars are one accessible element: "Busy times. Now: usually busy. Busiest around {peakHour}."
- Top dishes: "{name} · ${price}" and "{pct}% liked it". Use the price currency symbol from the sample; CAD comes later.
- Vote buttons per report: thumbs up "Still true" and thumbs down "Not anymore" (labels; the visible text is the emoji plus a count). State is held in the store as `votes[reportId] = 1 | -1`. Tapping the same vote again removes it. The first vote gives +2 rep with `toast.voteThanks` "Thanks for confirming · +2 rep". Changes after that are silent. Votes are radio-like: `accessibilityState={{ selected }}`.
- **Go:**
  - iOS: `http://maps.apple.com/?ll={lat},{lng}&q={name}`
  - Android: `geo:{lat},{lng}?q={lat},{lng}({name})`
  - Web: `https://www.google.com/maps/search/?api=1&query={lat},{lng}`, which opens a new tab through `Linking.openURL`.
  - Sample spots need fictional `lat`/`lng` near Austin (features builder: map x/y linearly onto 30.22 to 30.30 N, -97.78 to -97.70 W).
  - Label: "Get directions to {name}".

**Errors**
- Unknown id (deep link or a stale route): an EmptyState with the title "This spot isn't on the map anymore", the body "It may have moved or closed." and a button "Back to the map" (`router.replace('/')`).
- `Linking.openURL` rejects: `toast.mapsError` "Couldn't open maps on this device."

---

## 6. Checking in

**Where:** the preview's Check in button and the spot page's Check in button (the same handler, `useCheckIn()` in `src/hooks/`).

**Steps**
1. Tap "Check in" on an open spot.
2. Store: add `{spotId, at}` to `checkIns`, add 10 rep, persist.
3. `EmojiRain` with the spot's food emoji (about 30 pieces; 3 of every 10 can be its first `side` emoji for variety), 1.8 s. `pointerEvents="none"` so the user can keep tapping. It unmounts on finish.
4. The "+10 rep" burst rises from the button.
5. Toast and announcement: `toast.checkedIn` "Checked in at {spot} · +{rep} rep".
6. The button becomes "You're here" with a check, disabled, `accessibilityState={{ disabled: true }}` and the label "Checked in at {spot}".
7. The You tab check-in count and rep update right away.

**Decisions**
- One check-in per spot per app session. On reload, persisted check-ins older than 4 hours no longer count as "here", but they still count in the You total.
- Closed spot: the button stays enabled but gives no rep and no rain. Show `toast.checkInClosed` "{spot} is closed right now. Check in when it opens." Do not disable it silently, because people should know why.
- A second rain while one is playing: ignore it (one EmojiRain at a time).
- Business mode on: the eater Check in is not shown.

---

## 7. Reporting (center tab, radial)

**Steps**
1. Tap the center Report tab. The radial overlay opens over whatever tab is showing (it is not a route).
2. Target: the selected spot (from the preview or the spot page, which sets `selectedSpotId` on mount), else the spot nearest to ME. The top line reads "Reporting at" / "{name}" (the name wraps).
3. Six options fan out with a 35 ms stagger, in this order: Amazing · Long line · Good deal · Sold out · Photo · New spot.
4. Pick one of the first four:
   - store `addReport({spotId, type, by:'you', at: now})` at the top of that spot's list
   - `spotOverrides[spotId].mood = type`, so the bubble shows on the map
   - +5 rep
   - the radial closes
   - an emoji float rises from the pin if the map is visible, otherwise from the center tab, with the "+5 rep" burst
   - toast and announcement: `toast.reportLive` "Thanks, your report is live at {spot}"
5. Photo: closes, `toast.photoSoon` "Photo reports are coming next", 0 rep.
6. New spot: closes, `toast.newSpotSoon` "Adding new spots is coming next", 0 rep.
7. Close: tap the backdrop, the Android back button (`BackHandler` while open), Escape on web, or the center button again (its icon rotates 45 degrees into an X while open).

**Report types (keys `report.*`, mood bubble text = emoji plus the bubble copy)**

| Type | Option label | Bubble on map | Report line on spot page |
|---|---|---|---|
| amazing | Amazing | "Hot right now" | "Amazing right now" |
| line | Long line | "Long line" | "Long line right now" |
| deal | Good deal | "Good deal today" | "Good deal today" |
| soldout | Sold out | "Something sold out" | "Something's sold out" |
| photo | Photo | (none) | (none) |
| newspot | New spot | (none) | (none) |

Your reports show "You · just now", then "You · {min} min ago" from `use-clock`.

**Decisions**
- Dedupe: if you report the same type at the same spot within 10 min, close the radial and show `toast.alreadyReported` "You already reported that. Thanks." with 0 rep. This keeps rep honest.
- No "change target" control tonight. Always showing the name makes it clear which spot the report goes to. For another spot, tap its pin first.
- Reporting a closed spot is allowed ("Sold out" on a closed pop-up is still useful).
- Business mode: the center button is Go live (C5). The radial is eater only.

**Accessibility (list mode)**
- When the screen reader is on or reduce motion is on, render a bottom list (Card rows 56 high) instead of the arc. Its header is "What's happening at {name}?" and there is a "Cancel" row at the bottom.
- Each option's label: "Report {option} at {name}". Photo and New spot add the hint "Coming next".
- On open, move focus to the header (`AccessibilityInfo.setAccessibilityFocus` on its node handle, guarded for web). On close, return focus to the Report tab.
- The overlay has `accessibilityViewIsModal` (iOS) and `importantForAccessibility="yes"` on the overlay, with the content behind it `no-hide-descendants` (Android).

---

## 8. Drops (C4)

**Card states** (from `getDrops()`, time from `use-clock`):

| State | Condition | Main line | Button |
|---|---|---|---|
| Upcoming | `at > now` | "Starts in {countdown}" | "Remind me" / "Reminder on" (toggle) |
| Live | `at <= now && left > 0` | "Live now · {left} of {of} left" + draining bar | "Claim one" |
| Gone | `left === 0` | "All gone. Next time." | disabled "All gone" |

- Countdown format: under 1 hour "m:ss"; under 1 day "h:mm:ss"; otherwise "{d}d {h}h". Use tabular nums. Each card's a11y label uses words that update once a minute, not every second: "Birria drop at Taquería La Güera. Starts in 1 hour 12 minutes." Do not use a live region on the countdown, because it would read every tick.
- Draining (live only): on each clock tick, with 25% chance, `left -= 1`, stopping at 2 (never drains to 0 by itself). It is driven by the shared clock, not a new interval.
- A secondary map button on every card, "Show on map", focuses the spot (same as Ask, section 9).
- **Remind me:** toggles in the store. Copy must be honest because there are no notifications tonight. On: `toast.remindOn` "Reminder saved. Phone alerts are coming soon." (this overrides the 01 copy). Off: `toast.remindOff` "Reminder off". `accessibilityRole="switch"` with `accessibilityState={{ checked }}`.
- **Claim one:** once per drop. `left -= 1`, then a burst (fade under reduce motion), then a modal:
  - title "Saved one for you"
  - the code, big: `LOKAL-{first 4 of spot id, upper}-{3 digits from a hash of drop id}`, for example `LOKAL-GUER-417`
  - body "Show this at the truck. It's yours for the next 30 minutes."
  - buttons "Copy code" (expo-clipboard, `toast.codeCopied` "Code copied") and "Done"
  - After that the card button reads "Show my code" and reopens the modal. 0 rep (section 1.1).
- Empty: EmptyState "No drops tonight" / "Follow a few spots and check back later." There is no follow feature tonight, so keep it to that body.

---

## 9. Ask Lokal (C4, canned, Demo)

**Screen**
- Header "Ask Lokal" with a grape badge "Demo". Under it, small: "Canned answers for now. The real guide is coming." (`ask.demoNote`).
- First bot message: "Hey. I know the local spots around here, and no chains, ever. What are you craving?"
- Suggested chips above the composer: "Cheap tacos open now" · "Rainy day" · "Late night" · "Something sweet" · "BBQ without a long line".
- Composer placeholder "What are you craving?". The send button is disabled while the input is empty (label "Send").

**Answer logic** (`src/data/ask.ts`, pure function `answer(q): { key, params, spotIds }`)

Lowercase the question, then test the keyword groups in order. Return the first match. If a question says "open", "now" or "late", keep only open spots.

| Order | Keywords (regex) | Answer key / English | Spots |
|---|---|---|---|
| 1 | `taco\|mex\|burrito\|birria` | `ask.a.tacos` "{name} is hot right now, with a fresh report {min} min ago. Get the al pastor." | guera, (curry as a cheap backup) |
| 2 | `rain\|cold\|soup\|cozy` | `ask.a.rainy` "Rainy day? Warm bowls: {name} has rich broth and big portions." | pho, curry |
| 3 | `late\|night\|midnight` | `ask.a.late` "Still open late near you: Ember & Bun until 11pm and La Güera until 10pm." | smash, guera |
| 4 | `sweet\|dessert\|bak\|croissant\|ice\|paleta` | `ask.a.sweet` "For a sweet tooth: Little Dough's pecan croissant, or a paleta if you want something cold." | dough, paleta |
| 5 | `bbq\|brisket\|rib\|smok` | `ask.a.bbq` "Post Oak Pit has the best brisket, but the line is about 25 min. Island Jerk Pit is smoky and faster." | smoke, jerk |
| 6 | `coffee\|latte\|lake` | `ask.a.coffee` "Bean Bike is by the lake trail until 2pm. The honey latte is the move." | bean, dough |
| 7 | `spic\|hot\|jerk\|heat` | `ask.a.spicy` "Real heat: Island Jerk Pit, with a $10 lunch plate today." | jerk, guera |
| 8 | `burger` | `ask.a.burger` "Ember & Bun just parked downtown. Get the onion rings." | smash |
| 9 | `pho\|noodle\|asian\|curry\|dumpling` | `ask.a.asian` "Warm bowls nearby. Pleat & Steam is only at the Saturday market." | pho, curry, dumpling |
| 10 | `cheap\|\$\|budget\|under` | `ask.a.cheap` "Big flavor, small price. All of these have mains under $12." | jerk, curry, guera |
| none | | `ask.a.fallback` "Hmm, I don't know that one yet. Try tacos, late night or rainy day." | (no cards; show the chips again) |

"Cheap tacos open now" hits row 1. That is intended, because tacos is the stronger signal.

**Behavior**
- Show the user bubble, then a typing indicator for 600 ms (static dots under reduce motion; cut first), then the answer bubble and spot cards (name, "★ {r} · {p} · {distance}", status).
- Each card has the button "Show on map" (label "Show {name} on the map"). It sets `selectedSpotId`, clears the filter (All), then `router.navigate('/')` (the map tab). The map sees the selection, calls `animateTo` and opens the preview at half.
- Keep the chat in memory only (it resets on reload). This is fine for a demo.
- New answers are announced through the bubble being a live region on Android; on iOS, use `announceForAccessibility(answerText)`.

---

## 10. You tab (C4)

**Layout, top to bottom**
1. Avatar (😋 from emoji map), "@you", "Austin".
2. The rep line, quiet: "{level} · {rep} rep". Under it: "{toNext} rep to {nextLevel}" (hidden at Legend). One line of explanation: "You earn rep by helping other eaters: reports, check-ins and confirming what's still true." (`you.repHow`).
3. Stats row (wrapping cards): "Check-ins" {checkIns.length} · "Reports" {count of reports by you} · "Confirmed" {still-here taps plus first votes}.
4. Theme: a segmented control "Auto" · "Night" · "Day" with `accessibilityRole="radiogroup"`; each option is `radio` with `checked`. Under Auto, a caption: "Night from 7pm to 7am".
5. Business row: "Switch to Business mode" / "Ember & Bun". Until C5, tapping shows `toast.bizSoon` "Business mode is coming next". In C5, the switch swaps the tabs and shows the toast "You're in Business mode". In business mode, the same row on Today reads "Switch to eater mode".

**Decisions**
- No streaks, no daily goals, no leaderboard tonight (section 11).
- Never show negative states ("You haven't checked in!"). With 0 check-ins the stats show 0 and the rep line explains how to earn.

---

## 11. Habit-forming without being manipulative

What brings people back tonight, and what is deliberately left out:

**Do**
- **The map changes when you come back.** The ticker, mood bubbles, freshness labels and closing-soon labels give a real reason to look. All of them are tied to real data (sample data tonight).
- **The loop is short.** Seeing a spot and contributing to it takes one tap. Each contribution has an immediate, visible effect on the shared map (the bubble changes) and says who it helps ("your report is live").
- **Rep rewards helping others,** never consuming. Claims and app opens give 0 rep.
- **Useful urgency only.** Closing soon and drop countdowns reflect real times. Remind me is opt-in and honest about alerts not existing yet.

**Don't**
- No streaks, no loss-aversion copy ("Don't lose your streak"), no fake scarcity, no countdowns that reset.
- No unread counts that are not real notes. No red badge on the You tab.
- No confetti for trivial actions. Rain is only for check-ins, a burst only for reports, claims and go-live.
- No prompts to turn on notifications or share tonight.

---

## 12. String table (keys for `src/i18n/en.ts`)

The column FR marks strings likely to run long in Canadian French (over ~20% longer, or awkward to shorten). Layouts holding these strings must wrap. Rough French hints are given to size layouts only. Do not ship them: fr-CA values copy en tonight, and a native speaker reviews later.

| Key | English | FR |
|---|---|---|
| `tab.map` / `tab.drops` / `tab.report` / `tab.ask` / `tab.you` | Map / Drops / Report / Ask / You | Ask = "Demander" (long), You = "Moi" |
| `tab.reportA11y` | Report what's happening | |
| `toast.welcome` | {count} local spots near you. 0 chains. | FR |
| `map.askPill` | Ask Lokal: tacos open now under $10 | FR (wraps, 2 lines max) |
| `map.bell` | Notifications, {n} unread | |
| `map.toggleTheme` | Switch to {mode} map | |
| `map.you` | You are here | |
| `map.recenter` / `map.zoomIn` / `map.zoomOut` | Back to you / Zoom in / Zoom out | |
| `pin.a11y` | {name}, {kind}, {status}, {distance} | |
| `pin.a11yMood` | , reported: {mood} | |
| `filter.all` … `filter.cheap` | All · Open now · Trucks & carts · Tacos · BBQ · Sweets & coffee · Asian · Pop-ups · $ Cheap eats | FR: "Camions et chariots", "Ouvert maintenant", "Sucré et café" |
| `filter.announce` | {n} spots match {filter} | |
| `sheet.title` | Live near you | |
| `sheet.sub` | {count} local spots · {open} open now · 0 chains | FR |
| `sheet.trending` / `sheet.closest` | Trending right now / Closest to you | FR: "Les plus proches de vous" |
| `sheet.handle` | Sheet, {state} | |
| `sheet.handleHint` | Double tap to show more | |
| `sheet.hint` | Tap a sticker to see what's cooking | FR |
| `sheet.close` | Close preview | |
| `spot.open` | See menu, busy times & reviews | FR long (~45 chars): full-width button, wraps |
| `status.hereNow` / `status.open` / `status.next` | Here now · until {until} / Open · until {until} / Next: {until} | Time format: "22 h" in FR later |
| `status.closesIn` / `status.closingNow` | Closes in {min} min / Closing now | FR: "Ferme dans {min} min" |
| `fresh.you` / `fresh.min` / `fresh.hr` / `fresh.none` | You confirmed it just now / Seen {min} min ago / Last seen {hr} hr ago. Still there? / No recent reports. Still there? | FR long |
| `fresh.yep` / `fresh.thanks` | Yep, still here / Thanks | FR: "Oui, toujours là" |
| `act.checkIn` / `act.here` / `act.report` / `act.go` | Check in / You're here / Report / Go | FR: check in has no short equivalent, "Je suis ici" |
| `act.goA11y` | Get directions to {name} | |
| `spot.notChain` / `spot.notChainA11y` | Not a chain / Not a chain. Lokal only lists independent spots. | FR: "Pas une chaîne" |
| `spot.runBy` | Run by {own} | |
| `spot.friends1` / `spot.friendsN` | {name} loves this / {name} and {n} friends love this | plural rules differ in FR: keep both keys |
| `spot.schedule` / `spot.off` | This week / Off | |
| `spot.whatPeopleSay` / `spot.aiBadge` | What people say / AI summary | FR: "Résumé IA" |
| `spot.busy` / `spot.busyNow` / `spot.busyClosed` | Busy times / Now: {word} / Usually closed at this hour | FR |
| `busy.peak` / `busy.busy` / `busy.little` / `busy.quiet` / `busy.closed` | as busy as it gets / usually busy / a little busy / usually quiet / closed | FR long |
| `spot.dishes` / `spot.liked` | Top dishes / {pct}% liked it | |
| `spot.vibe` / `spot.reports` | The vibe / Live reports | |
| `vote.up` / `vote.down` | Still true / Not anymore | FR: "Plus maintenant" |
| `spot.byYou` / `spot.justNow` / `spot.minAgo` | You / just now / {min} min ago | |
| `spot.missing` / `spot.missingBody` / `spot.backToMap` | This spot isn't on the map anymore / It may have moved or closed. / Back to the map | |
| `report.title` / `report.at` | What's happening? / Reporting at | |
| `report.listTitle` | What's happening at {name}? | FR long |
| `report.amazing` … `report.newspot` | Amazing / Long line / Good deal / Sold out / Photo / New spot | FR: "Longue file", "Bon prix", "Épuisé", "Nouvel endroit" |
| `report.optA11y` | Report {option} at {name} | |
| `report.close` / `report.cancel` | Close report menu / Cancel | |
| `mood.amazing` / `mood.line` / `mood.deal` / `mood.soldout` | Hot right now / Long line / Good deal today / Something sold out | FR long; the bubble is maxWidth 180, 1 line, the a11y label has the full text |
| `toast.reportLive` | Thanks, your report is live at {spot} | FR long |
| `toast.alreadyReported` (NEW) | You already reported that. Thanks. | |
| `toast.photoSoon` (NEW) | Photo reports are coming next | |
| `toast.newSpotSoon` | Adding new spots is coming next | |
| `toast.checkedIn` | Checked in at {spot} · +{rep} rep | |
| `toast.checkInClosed` (NEW) | {spot} is closed right now. Check in when it opens. | FR long |
| `toast.stillHere` | Thanks for confirming · +2 rep | |
| `toast.voteThanks` (NEW) | Thanks for confirming · +2 rep | |
| `toast.levelUp` (NEW) | You're a {level} now. Thanks for helping out. | |
| `toast.mapsError` (NEW) | Couldn't open maps on this device. | |
| `toast.inboxSoon` (NEW) | Your inbox is coming next | |
| `toast.nightOn` / `toast.dayOn` (NEW) | Night map on / Day map on | |
| `toast.remindOn` (CHANGED from 01) / `toast.remindOff` | Reminder saved. Phone alerts are coming soon. / Reminder off | FR long |
| `toast.codeCopied` | Code copied | |
| `toast.bizSoon` | Business mode is coming next | |
| `empty.filter` / `empty.filterBody` / `empty.showAll` | Nothing like that open nearby right now. / Try another filter, or check back tonight. / Show all | FR long |
| `empty.quiet` / `empty.quietBody` / `empty.addSpot` | No trucks reported here yet. Be the first! / Know a truck or pop-up we're missing? Add it in a few taps. / Add a spot | FR long |
| `empty.missing` | Know a spot we're missing? | |
| `empty.noReports` | No reports yet. Be the first to say what's happening. | FR long |
| `drops.title` / `drops.sub` | Drops / Limited specials from local spots | |
| `drops.startsIn` / `drops.live` / `drops.gone` | Starts in {time} / Live now · {left} of {of} left / All gone. Next time. | |
| `drops.remind` / `drops.reminderOn` / `drops.claim` / `drops.showCode` / `drops.goneBtn` | Remind me / Reminder on / Claim one / Show my code / All gone | FR: "Me le rappeler", "Rappel activé" |
| `drops.codeTitle` / `drops.codeBody` / `drops.copy` / `drops.done` | Saved one for you / Show this at the truck. It's yours for the next 30 minutes. / Copy code / Done | FR long |
| `drops.empty` / `drops.emptyBody` | No drops tonight / Follow a few spots and check back later. | |
| `common.showOnMap` / `common.showOnMapA11y` | Show on map / Show {name} on the map | FR: "Voir sur la carte" |
| `ask.title` / `ask.demo` / `ask.demoNote` | Ask Lokal / Demo / Canned answers for now. The real guide is coming. | FR long |
| `ask.hello` | Hey. I know the local spots around here, and no chains, ever. What are you craving? | FR long |
| `ask.placeholder` / `ask.send` | What are you craving? / Send | |
| `ask.chip.*` | Cheap tacos open now / Rainy day / Late night / Something sweet / BBQ without a long line | FR long: chips wrap |
| `ask.a.*` | (section 9 table) | FR long |
| `you.handle` / `you.city` | @you / Austin | |
| `you.rep` / `you.toNext` / `you.repHow` | {level} · {rep} rep / {n} rep to {level} / You earn rep by helping other eaters: reports, check-ins and confirming what's still true. | FR long |
| `you.checkIns` / `you.reports` / `you.confirmed` | Check-ins / Reports / Confirmed | FR: "Visites", "Signalements", "Confirmations" (long) |
| `you.theme` / `theme.auto` / `theme.night` / `theme.day` / `theme.autoNote` | Map look / Auto / Night / Day / Night from 7pm to 7am | |
| `you.toBiz` / `you.toBizSub` / `you.toEater` | Switch to Business mode / Ember & Bun / Switch to eater mode | FR long: "Passer au mode Entreprise" |
| `level.newcomer` / `level.regular` / `level.local` / `level.legend` | Newcomer / Regular / Local / Legend | FR: "Nouveau venu", "Habitué", "Local", "Légende" |

**Test:** with the dev `PAD_STRINGS` flag from 01 section 8 on, walk sections 2 to 10 once. Nothing should clip mid-word; the radial labels wrap to 2 lines; the sheet buttons wrap.

---

## 13. Acceptance walk for UX (run after C3 and again after C4)

1. Cold start: splash, map, welcome toast. The peek sheet shows the count.
2. Tap Post Oak Pit BBQ: it centers, the preview appears and shows amber "Closes in 25 min" plus the freshness label.
3. "Yep, still here": +2, "Thanks", the label reads "You confirmed it just now".
4. Open, then the spot page: every section is there and "Not a chain" is visible. Back returns to the same map.
5. Check in at La Güera: rain, +10, "You're here". Check in again: nothing happens.
6. Report tab with La Güera selected: "Reporting at Taquería La Güera". Pick Long line: the bubble changes, the toast shows, and the spot page lists "You · just now". Report Long line again: the "already reported" toast, 0 rep.
7. Turn reduce motion on (OS setting, or the web devtools media emulation): no bob, the radial is a list, the check-in is a fade.
8. VoiceOver / TalkBack / web a11y tree: pins read "name, kind, status, distance"; the sheet handle cycles; the radial list is reachable and closable.
9. You: rep = 17 (2+10+5), Newcomer, "83 rep to Regular", 1 check-in, 1 report.
10. Ask "Late night": answer plus 2 cards. "Show on map" lands on the map with Ember & Bun selected.
11. Drops: countdowns tick in sync. Remind me toggles. Claim on the live drop shows the code.

---

## Later (not tonight)

- Add a spot in 3 steps with the chain check ("Is it part of a chain? Lokal only lists independent spots."), then "First to find" credit.
- Real location permission flow with plain-language consent (Quebec Law 25), plus "Not near you" check-in rules.
- Onboarding and the craving picker; follows and real reminders through push with quiet hours.
- Undo on reports (a toast action), changing the report target, report expiry.
- Invite-a-truck link in quiet areas; the "Be the first" state tied to real coverage (idea I).
- You tab: food map, taste profile, lists, weekly recap card; neighborhood fog (G); quests (K).
- Ask: real AI through Edge Functions, voice input, answers limited to tool results.
- Locale formats: 24 h times and "22 h" in fr-CA, CAD prices, Dynamic Type at 200%.
