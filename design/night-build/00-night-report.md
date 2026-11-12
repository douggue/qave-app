# Lokal night build: supervisor report

Branch: `night-build`. It is not merged and not pushed to main. Expo SDK 58, RN 0.88, React 19.3, npm (package-lock.json).

## Gates (supervisor sign-off)

- `npx tsc --noEmit`: pass
- `npx expo lint`: pass
- No changes to app.json, eas.json or package.json/package-lock.json. No ios/ or android/ directories. No new dependencies.
- No emoji characters outside `src/theme/emoji.ts` and `src/data/sample.ts`.
- No secrets or API keys in the diff. The sample data is fictional.
- Last verified with `npx expo export -p web`, which succeeds and pre-renders `/spot/[id]` for every sample spot.

## Commits

1. `fbe0843` Night build 1: foundations and tab shell
2. `7a20ee6` Night build 2: map home, pins, filters, sheet
3. `02f85b4` Night build 3: spot page, report radial, check-in
4. `7f45fea` Night build 4: drops, ask, you
5. `33933e3` Night build 5: business mode go-live loop
6. `bca5e0f` Night build: UI and UX expert specs
7. `3b5d675` Night build 6: supervisor fix list (glow, pin taps, first view, hydration)
8. This report

## What was built

- **Foundations**:
  - theme tokens for night and day, the type scale, spacing, radius, minTap 44 and tapComfort 48
  - `use-theme`: auto mode follows the device clock, with a manual override
  - a single emoji map
  - the i18n `t()` layer, with en plus fr-CA using the same keys
  - typed sample data behind `src/data/repo.ts`
  - a context and reducer store, persisted to AsyncStorage
  - a shared 1s clock, reduce-motion and hydration hooks
  - a UI kit: Text, Chip, Button, Card, Badge, Toast, Screen, Skeleton and LiveText
- **Map home**:
  - an illustrated SVG world of 1400x1800 in night and day palettes
  - PanResponder pan with clamping, 3 zoom levels and recenter
  - sticker pins with glow, bob, mood bubbles and accessibility labels
  - tapping a pin hit-tests it and opens the preview
  - filter chips that dim non-matches to 30%
  - the TICKS ticker, the Ask pill, the bell with unread count, and the day/night toggle
  - a 3-snap bottom sheet: Trending, Closest (closing-soon first, with an amber label), and the preview with the freshness label
- **Spot page** (`/spot/[id]`):
  - a gradient header, a 'Not a chain' badge, friends, a live card with 'Yep, still here' (+2 rep), and a 7-day schedule strip
  - an AI-labelled summary, Check in / Report / Go (opens maps via Linking)
  - busy bars, top dishes, vibe chips, and live reports with votes
- **Report radial**: a staggered arc with six options, which becomes a plain list under a screen reader or reduce motion. A report sets the mood bubble, gives +5 rep, plays a float and burst, and shows a toast.
- **Check-in**: EmojiRain, which becomes a fade plus toast under reduce motion. It increments checkIns and rep.
- **Drops**: countdowns on the shared clock, a draining portions bar, Remind me, and a Claim modal with a code.
- **Ask**: a canned chat, labelled Demo, with prompt chips, keyword answers, a fallback, and 'Show on map'.
- **You**: avatar, rep and level, check-ins, the theme control, and the Business mode switch.
- **Business mode**:
  - swapped tab set: Today, Where, Go live, Menu, Promote
  - Today: an offline card and a Go live sheet with stop and until choices
  - going live moves the pin, sets 'Just parked' and open, adds an inbox note and plays a celebration
  - a live timer, quick statuses, End service and a stats row
  - Where, Menu and Promote are 'coming next' placeholders
- **Extras**:
  - an Inbox screen for the bell; read state persists
  - a branded 404
  - a hydration-safe web render, so there is no locale or time mismatch on the pre-rendered pages

## Screens

| Route | Mode | Notes |
|---|---|---|
| `/` (tabs/index) | Eater | Map home with the sheet |
| `/drops` | Eater | Drops list |
| `/ask` | Eater | Canned Ask Lokal (Demo) |
| `/you` | Eater | Profile, theme, Business switch |
| Report (center) | Eater | Action that opens the radial; not a screen |
| `/today` | Business | Offline/live loop |
| Go live (center) | Business | Action that opens the Go live sheet |
| `/where`, `/menu`, `/promote` | Business | Placeholders |
| `/spot/[id]` | Stack | Spot page |
| `/inbox` | Stack | Notes from the bell |
| `+not-found` | Stack | 'This spot moved on' |

## What is left or not verified

- No real browser or device was available. These still need a manual check:
  - React #418 is gone on `/`, `/spot/guera` and `/spot/smoke`
  - the preview opens within 250 ms of a pin tap
  - 6 stickers are visible at 390x844 (this was only computed from geometry)
  - glow corners on web
- The Business recaptures were not taken: /today, the Go live sheet, live with a status selected, End service armed, and /where, /menu, /promote.
- The fr-CA strings added tonight are machine-authored and need a native-speaker review.
- Web visitors with a non-English locale get one remount after hydration.
- The busy-chart axis times and weekday names use the server's Intl data in the pre-rendered HTML.
- Not built (stretch): Surprise me on the map rail.

## Deferred review items (next session)

- Inbox notes as t()-keyed data with formatDistance and an ago helper (issue 38).
- Right rail slimming: move the theme toggle to the top bar, segmented +/- pill (19).
- Sheet peek 132 with a heading-size title. This must be retuned together with the PEEK/topInset first-view math (20).
- Rep and level pill colors; Ask 'Demo · real AI coming' badge (23).
- FoodArt hero plate, side emoji and sheen; '+ Follow' pill; fix or hide the share button (27, 46).
- Freshness 'idea A' copy and the 'Yep, still here' ghost button with a count (29).
- Live reports row layout (30).
- Business LiveCard: danger variant, a11y heading, 17 pt quick statuses, live-duration a11y label (42).
- Ask suggestion cards and send disabled styling; You progress track; Drops subtitle copy (45, 47).
- Toast minimum hold with a screen reader on; focus move after Go live; remember the 'until' choice (48).
- Back chevron in SVG (46).

## Next steps

1. Do a manual QA pass on web (Chrome, 390x844) and in Expo Go (iOS and Android), following the full definition of done, and capture the screens listed above.
2. Work through the deferred list, starting with the sheet peek and first-view retune, then the LiveCard a11y work.
3. Get the fr-CA strings reviewed, then run the 30%-longer string pass again.
4. Plan the backend phase (Supabase, auth, real reports), plus real map tiles and geolocation. Each of these needs an explicit dependency and app.json review first.
