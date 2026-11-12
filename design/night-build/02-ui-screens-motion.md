# Night build: screens and motion spec (UI expert 2)

Owner: UI expert 2 (sheet, cards, spot page, plus the motion spec for the whole app).
For: the one developer building chunks C1 to C5 tonight on `night-build`.
Sources: mockups v3/v4 (`design/lokal-mockup-v3.html`, `design/lokal-mockup-v4.html`), `design/DESIGN_LOG.md`, the supervisor's plan.
Everything here works with **React Native `Animated`, `PanResponder`, `react-native-svg` and `expo-linear-gradient` only**. No new dependencies.

Where this spec and the mockup disagree, follow this spec. It is the mockup "but better": softer motion, less glass, stickers instead of circle pins, room for French.

---

## 0. Priority list (read this if you read nothing else)

1. **Shared motion tokens first** (`src/theme/motion.ts`, section 2). Every animation reads from it, and every animation has a reduce-motion branch. That costs 10 lines in C1 and saves an hour of rework.
2. **Map home + bottom sheet (C2)**: the sheet's three snaps, the preview card, and the selected-pin lift are what people touch most. Get the sheet spring right before anything decorative.
3. **Spot page (C3)**: hierarchy, the "Not a chain" badge, the live status card with "Yep, still here", and the action row. Busy bars and dishes can be plain.
4. **Report radial + check-in rain (C3)**: this is the "fun" moment. The stagger and the burst matter; the exact particle physics do not.
5. **Tab bar with the raised center button (C1)**: visible on every screen.
6. Drops, Ask and You (C4), then Business Today + Go live (C5).
7. Cut first, in this order: pin sparks, the Go-live shine sweep, the drop bar drain, the bob on non-hot pins, the day/night cross-fade.

---

## 1. Global layout rules

| Rule | Value |
|---|---|
| Side gutter | `space.lg` = 16 |
| Gap between stacked cards | `space.md` = 12 (mockup used 14; 12 is on the scale) |
| Card padding | 16 (`space.lg`), radius `radius.lg` = 22 |
| Small card / list row radius | `radius.md` = 16 |
| Buttons, chips, icon buttons | min height `minTap` = 44. Primary buttons 50 tall. Chips 36 visual, with `hitSlop` of 4 top and bottom to reach 44 |
| Pills, chips, badges | `radius.pill` = 999 |
| Text widths | Never a fixed `width` on anything that holds text. Use `flexShrink: 1`, `flexWrap: 'wrap'` on rows, `minWidth: 0` where needed. Horizontal card rails use a fixed **card** width (168) but the text inside wraps to 2 lines (`numberOfLines={2}`) |
| Truncation | Only names in horizontal rails and the Ask pill placeholder may use `numberOfLines`. Everything else wraps. Test with the 30% padded string (see section 9) |
| Safe area | Every screen goes through `Screen` (safe area + `palette.paper` background). The map screen ignores the top inset for the map itself, but its top bar adds `insets.top + 8` |
| Numbers | Countdowns, timers and rep use `fontVariant: ['tabular-nums']` so they do not jitter |

### Radius scale (C1 `tokens.ts`)

`radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 }`. `xl` is only for the bottom sheet's top corners and modals.

### Type scale (C1 `tokens.ts`)

Only `Unbounded_800ExtraBold` and `Figtree_700Bold` are loaded, so hierarchy comes from **size and color**, not weight.

| Variant | Font | Size / line height | Letter spacing | Use |
|---|---|---|---|---|
| `display` | Unbounded | 28 / 34 | -0.5 | Spot name on the spot page, "You're offline", claim code |
| `title` | Unbounded | 20 / 26 | -0.3 | Screen titles (Drops, Ask Lokal), sheet preview name, section heroes |
| `heading` | Figtree | 17 / 22 | 0 | Card titles ("Busy times", "Top dishes"), list row names |
| `body` | Figtree | 15 / 22 | 0 | Paragraphs, AI summary, chat bubbles |
| `ui` | Figtree | 14 / 19 | 0 | Buttons, chips, status lines |
| `caption` | Figtree | 12.5 / 17 | 0.1 | Meta text (rating count, distance, "4 min ago") in `ink2` |
| `micro` | Figtree | 11 / 14 | 0.3 | Tab labels, BUSINESS pill, stat labels |

`Text` takes `variant` and `tone` (`ink`, `ink2`, `sun`, `mint`, `chili`, `onAccent`). Default tone is `ink`. Allow `allowFontScaling` (default true) and cap with `maxFontSizeMultiplier={1.6}` on `display`/`title` only.

### Color use (tokens from C1)

| Role | Night | Day |
|---|---|---|
| Screen background | `paper` #0d0e19 | `paper` #f3f4f8 |
| Card | `card` #171a2c | `card` #ffffff |
| Inset / second-level card, vote buttons, busy bar track | `card2` #1f2338 | `card2` #f0f0f6 |
| Hairline | `line` rgba(255,255,255,.09) | rgba(22,23,43,.10) |
| Glass (map overlays) | `glass` rgba(16,18,34,.86) | rgba(255,255,255,.90) |
| Primary text | `ink` #f5f2ff | #16172b |
| Secondary text | `ink2` #9d9abb | #62607f |
| Selected chip, "today", active tab dot | `sun` #ffcc33 with text #1a1300 | same |
| Open / live / Check in | `mint` #34e0a1, text on mint #062a1d; mint as text on day: #0d8a62 | |
| Report / hot / primary CTA gradient | `grill` #ff7a45 → `chili` #ff2d6f, text #fff | same |
| AI / Demo | `grape` #a585ff (day text #6a48e8) | |
| You dot, verified check | `sky` #4aa8ff | |
| Closing soon (amber) | text `sun`, bg rgba(255,204,51,.15) | text #8a6500, bg rgba(255,204,51,.22) |

Add `glass` and `line` to both palettes in `tokens.ts` (same keys in night and day). Tinted badge backgrounds are the accent at 15% alpha; define them as `tint.mint`, `tint.sun`, `tint.chili`, `tint.grape` in the palette so day mode can override.

Backdrop blur (`backdrop-filter`) does not exist in RN without a native module: glass surfaces are just the high-alpha `glass` color plus a hairline border. That is why `glass` is .86 instead of the mockup's .78.

---

## 2. Motion tokens (`src/theme/motion.ts`)

```ts
import { Easing, Platform } from 'react-native';

export const ease = {
  soft: Easing.bezier(0.45, 0, 0.25, 1),   // default for everything
  out: Easing.bezier(0.25, 0.8, 0.25, 1),  // things arriving (same as splash)
  in: Easing.bezier(0.5, 0, 0.75, 0),      // things leaving, gravity
};

export const dur = { instant: 120, fast: 180, base: 240, slow: 360, float: 1600, rain: 2400 };

// Springs: gentle. Overshoot is small on purpose (no "boing").
export const spring = {
  sheet: { stiffness: 220, damping: 26, mass: 1 },   // ~2% overshoot
  pop:   { stiffness: 260, damping: 18, mass: 0.9 }, // pins, bubbles, radial items: ~8% overshoot
  press: { stiffness: 400, damping: 30, mass: 1 },   // button press scale
};

export const native = Platform.OS !== 'web'; // pass as useNativeDriver
```

Rules:

- Use `useNativeDriver: native` for `opacity` and `transform` only. Width/height/color animations use `useNativeDriver: false` and stay rare (the drop bar only).
- Every component that animates calls `useReduceMotion()` and takes the fallback listed in its row of section 8. Under reduce motion: **no loops, no travel, no springs**. Fades of 150 ms or less are allowed.
- Loops (`Animated.loop`) are started in `useEffect` and stopped in its cleanup. A loop must never run on an unmounted or off-screen screen: stop map loops when the Map tab blurs (`useFocusEffect` from expo-router).
- Press feedback on every `Button`, `Chip`, list row and card: scale 1 → 0.97 on press in, back on press out, `spring.press`. Under reduce motion: opacity 1 → 0.7 instead.

---

## 3. Navigation shell (C1)

### Eater tab bar (`src/components/tabbar/LokalTabBar.tsx`, passed as `tabBar` to `Tabs`)

```
┌───────────────────────────────────────────────┐  card bg, top hairline
│  🗺️      ⏳        ( ⚡ )        ✨       😋  │  icons 22, ink2 at .55 opacity when inactive
│  Map    Drops     Report       Ask      You   │  micro labels, 2 lines max, centered
│   •                                           │  5px sun dot under the active tab
└───────────────────────────────────────────────┘  paddingBottom = insets.bottom + 6
```

- Bar: height 60 + `insets.bottom`, `backgroundColor: palette.card`, `borderTopWidth: StyleSheet.hairlineWidth`, `borderTopColor: palette.line`. Five equal `flex: 1` slots; each slot is a `Pressable` with `minHeight: 44`.
- Active tab: icon opacity 1, translateY -2 and scale 1.08 (240 ms `ease.soft`), label `ink`, sun dot 5×5 under the label. Inactive: icon opacity .55, label `ink2`.
- **Raised center button**: `LinearGradient` 62×62, radius 31, colors `[grill, chili]` at 135°, emoji ⚡ 28 (from `emoji.ts`). It sits `marginTop: -22` so its center is above the bar's top edge. Ring: wrap it in a 72×72 View with `backgroundColor: palette.paper` and radius 36 (that is the 5px "cutout" ring). Glow: iOS `shadowColor: chili, shadowOpacity: .7, shadowRadius: 14`; Android/web: a 72px `chili` circle at opacity .25 behind it, scaled 1.15. Label "Report" under it in `micro`.
- When the radial is open the ⚡ rotates to an × (rotate 0 → 45deg using a "+" glyph, or cross-fade ⚡ → ✕) in `dur.fast`.
- a11y: each tab `accessibilityRole="tab"`, `accessibilityState={{ selected }}`, `accessibilityLabel={t('tabs.map')}` etc. Center button `accessibilityRole="button"`, label `t('tabs.reportA11y')` = "Report what's happening at a spot".

### Business tab bar (C5)

Same component, different item set: Today 📊, Where 🧭, center **Go live** 📍, Menu 📋, Promote 📣.

- Center Go live: solid `mint` 62px circle, glyph 📍 26, text color #062a1d, mint glow. When live: background `chili`, glyph a white 14px dot, label "Live", plus the **go-live pulse** (section 7.9).
- Tapping Go live when offline opens the Go live sheet; when live it jumps to Today.

### Toast (`ToastHost` + `useToast`)

- Position: top, `insets.top + 64` (below the map top bar), centered, `maxWidth: '88%'`, `paddingHorizontal: 16, paddingVertical: 10`, radius 14, bg `moon` #f5f2ff, text #16172b `ui`. Text wraps, center aligned.
- One at a time, a new toast replaces the old one. In: opacity 0 → 1 and translateY -10 → 0, `dur.base` `ease.out`. Hold 2200 ms (3200 ms if the string is over 60 characters). Out: opacity to 0, `dur.fast`.
- `pointerEvents="none"`, and always `AccessibilityInfo.announceForAccessibility(message)`.
- Reduce motion: opacity only, no translate.

---

## 4. Map home (C2) — `src/app/(tabs)/index.tsx`

Layers, back to front:

1. `LokalMap` fills the screen (UI expert 1 owns the world drawing and pins).
2. **Top bar** (absolute, `top: insets.top + 8`, `left/right: 12`, `gap: 8`, `pointerEvents="box-none"`):
   - Row: **Ask pill** (flex 1, height 50, radius 17, `glass`, hairline, ✨ 18 + `t('map.askPlaceholder')` in `ui` `ink2`, `numberOfLines={1}`) then **bell** icon button (44×44, radius 15, `glass`). Unread badge: 18px min, `chili`, white `micro` number, top -4 right -4.
   - **Filter chips**: horizontal `ScrollView` (`showsHorizontalScrollIndicator={false}`, `contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}`, negative margin -12 so it bleeds to the edges). Chips 36 tall, padding 0 14, `glass` + hairline, `ui` text. Selected: `sun` bg, #1a1300 text, no border, glow (iOS shadow sun .6 r 10).
   - **Ticker** (align self flex-start, `maxWidth: '100%'`): `glass` pill, padding 5 12 5 5, avatar circle 24 with emoji 14, then the line in `caption` `ink`, `numberOfLines={1}`. Rotates every 4 s from `useClock` (section 7.4).
3. **Right rail** (absolute, `right: 12`, `bottom: sheetPeekHeight + 12`, column, `gap: 8`): day/night toggle (☀️ or 🌙), zoom + , zoom −, recenter 📍. All 44×44 `glass` icon buttons, radius 15. Stretch: **Surprise me** 🎲 at the top of the rail. When the sheet moves above peek, the rail fades out (opacity tied to the sheet position: visible at peek, 0 at half).
4. **BottomSheet** (section 5).

Day/night toggle: tapping cycles the map between night and day immediately and sets `themeMode` (night or day, not auto). The full auto/night/day control lives on You. Toast once: `t('map.themeNight')` / `t('map.themeDay')`.

Bell: if Inbox is not built, toast `t('common.comingNext')`.

### Pins (owned by UI expert 1; motion here)

Sizes at zoom level 1 on screen (pins counter-scale so they keep screen size at every zoom):
emoji sticker 34, anchor dot 8 (white night / #16172b day, 4 px under the sticker), kind chip 20 round (#141832 night, #ffffff day) with a 12 kind emoji at the sticker's bottom-left (offset -4, -2), live dot 10 `mint` with a 2px `paper` border at top-right. Halo (Android/web glow): two concentric circles behind the sticker, 48px at the food glow color .18 opacity and 34px at .30. iOS uses `shadowColor: glow, shadowOpacity: .9, shadowRadius: 12` on the sticker wrapper instead.
Hit area: the pin `Pressable` is 56×64 even though the art is smaller.

Mood bubble: above the sticker (bottom = 52), `rgba(12,13,26,.9)` night / #fff day, hairline, radius pill, padding 4 10, `caption` white/ink, `numberOfLines={1}` but max width 180.

---

## 5. Bottom sheet (C2) — `src/components/sheet/BottomSheet.tsx`

### Geometry

`H` = window height minus the tab bar height.

| Snap | Visible height | Content shown |
|---|---|---|
| `peek` | 156 | Handle, title row ("Live near you" + count line), the "Trending right now" header peeking |
| `half` | `round(H * 0.5)` | Trending rail + the first ~3 "Closest" rows |
| `full` | `H - insets.top - 56` | Everything; body scrolls |

Implementation: the sheet is absolutely positioned with height `full`, and it moves with `translateY` (native driver) between `full - visible`. Corners `radius.xl` on top, bg `paper`, top hairline, iOS shadow (#000, .5, r 24, y -8), Android `elevation: 16`.

- **Handle area** (height 28, full width, owns the `PanResponder`): a 42×5 bar, radius 3, color `line` (night) / rgba(22,23,43,.18) (day).
- **Pan**: `onMoveShouldSetPanResponder` when `|dy| > 6 && |dy| > |dx|`. Follow the finger 1:1, clamp between full and peek, with 0.3× rubber band beyond each end.
- **Release**: project `target = current + vy * 140`, pick the nearest snap. Fast flick (`|vy| > 1.2`) moves one snap in the flick direction. Animate with `Animated.spring(y, { toValue, ...spring.sheet, velocity: vy, useNativeDriver: native })`.
- Body `ScrollView` scrolls only at `full` (`scrollEnabled={snap === 'full'}`); at peek and half, a drag on the body also moves the sheet (attach the same responder to a header strip that includes the title row).
- **Accessible control**: the handle area is a `Pressable` with `accessibilityRole="adjustable"`, label `t('sheet.a11y')` "Spot list", value = current snap name, and `accessibilityActions` increment/decrement that step snaps. A tap on the handle cycles peek → half → full → peek. This also gives a keyboard/mouse path on web.
- Reduce motion: snaps use `Animated.timing` `dur.fast` `ease.soft`, no spring, no velocity.
- Web: the sheet wrapper and the map wrapper set `style={{ touchAction: 'none' }}` (web only) so dragging never scrolls the page.

### Explore state (no spot selected)

```
[ handle ]
Live near you                                   ( + Add )   ← title variant; Add = small chili gradient button, toasts "coming next"
12 local spots · 3 trucks just parked · 0 chains            ← caption ink2, wraps
🔥 Trending right now                                         ← heading
[card 168] [card 168] [card 168] →                            ← horizontal ScrollView, gap 12, snapToInterval 180
Closest to you                                                ← heading
[row] [row] [row] …
```

**TrendCard** (`src/components/cards/TrendCard.tsx`): width 168. `FoodArt` 168×112 radius 18 (section 6.1), then name `heading` (2 lines), then mood or status `caption` `ink2` (2 lines). Press → focus the spot (same as a pin tap).

**SpotRow** (`src/components/cards/SpotRow.tsx`): row, `paddingVertical: 10`, hairline between rows, `gap: 12`.
- Left: `FoodArt` 56×56 radius 16.
- Middle (flex 1, `minWidth: 0`): name `heading`; status line (green dot 8 + `ui` mint "Here now · until 10pm" / grey "Next: Sat 9am"); meta `caption` "★ 4.8 · $ · Food truck".
- **Closing soon (idea B)**: rows whose close time is within 45 minutes sort first, and get an amber pill on its own line under the name: `t('spot.closingSoon', { time })` "Closing soon · 9:30pm" (amber tokens from section 1). Optional pulse: the pill's dot fades .4 ↔ 1 over 1200 ms loop; off under reduce motion.
- Right: distance `caption` `ink2`, right aligned, `flexShrink: 0`.
- `accessibilityRole="button"`, label `"{name}, {status}, {distance}"`.

### Preview state (a spot selected)

Transition: content cross-fades (out 120 ms, in 180 ms, `ease.soft`) and the sheet springs to `half` if it was at peek. The map calls `animateTo(spot.x, spot.y - 120 / zoom, zoom)` so the pin sits above the sheet.

```
[FoodArt 72]  Taquería La Güera                       (✕)
              ★ 4.8 (212) · $ · Food truck
              ● Here now · until 10pm
🔥 Hot right now        0.4 mi · East 6th            ← chili tint badge for mood, then caption
✓ Still there · confirmed 4 min ago                   ← freshness label (idea A)
🦄🐙🤠 Maya and 2 friends love this                    ← FriendsRow
[ 📍 Check in ] [ ⚡ Report ] [ 🧭 Go ]                ← ActionRow, 3 equal, 44 tall
[        See menu, busy times and reviews        ]    ← full-width primary (ink bg, paper text), 50 tall → spot page
```

- Name `title` (wraps), meta `caption`, status `ui`.
- Close ✕: 44×44 icon button, `card2` bg, label `t('common.close')`; returns to explore and peek.
- **Freshness label (idea A)**: `FreshnessLabel` component, used here and on the spot page. Fresh (≤ 30 min): mint text "✓ Still there · confirmed {min} min ago". Stale (> 30 min): `ink2` "Last confirmed {min} min ago". Never seen: `ink2` "No one has confirmed yet". The minutes read from `useClock`, so they update live.
- Closed spots: status grey, Check in button disabled (opacity .4, `accessibilityState={{ disabled: true }}`), toast on press is not needed.

---

## 6. Spot page (C3) — `src/app/spot/[id].tsx`

Stack push, header hidden (`Stack.Screen options={{ headerShown: false }}`), scroll view on `paper`. The map screen keeps its state because it stays mounted under the stack.

### 6.1 `FoodArt` (`src/components/cards/FoodArt.tsx`)

Reused everywhere a "photo" would go. Props: `spot`, `width`, `height`, `size` (main emoji size), `radius`, `variant`.
- `LinearGradient` from `spot.col[0]` to `spot.col[1]`, start {x: .2, y: 0}, end {x: .8, y: 1}.
- A "plate": a circle 72% of the smaller side, `rgba(255,255,255,.22)`, centered.
- Main dish emoji at `size`, centered; two side emoji at `size * .42` (bottom-left 9%/10%) and `size * .36` (top-right 10%/12%).
- A top sheen: second `LinearGradient` absolute fill, `['rgba(255,255,255,.14)', 'transparent', 'rgba(0,0,0,.18)']` at locations `[0, .35, 1]`.
- `accessible={false}` (decorative). The emoji come from `emoji.ts` via the spot's food key.

### 6.2 Layout

```
┌────────────────────────────────────────┐
│ FoodArt full width × 260, radius 0     │  header art, size 110
│ (‹)                        (📤)(+Follow)│  overlay at insets.top + 8, 44px glass buttons
└────────────────────────────────────────┘
 Taquería La Güera                          display, wraps
 ★★★★★ 4.8 (212) · $ · 🚚 Food truck · 0.4 mi    ui, row with flexWrap, gap 6/12
 🦄🐙🤠 Maya and 2 friends love this          FriendsRow
 [Family-owned] [Food truck] [🚫 Not a chain]   Badges, wrap; Not a chain is ALWAYS last and always present
 Run by Rosa & Miguel                         caption ink2 (only when spot.own)

 ┌ Live status card ───────────────────────┐
 │ ● Here now · until 10pm       East 6th  │
 │ ✓ Still there · confirmed 4 min ago     │
 │ [ 👍 Yep, still here  +2 ]              │  ghost button; after tap → "✓ Thanks for checking" disabled
 │ Mon Tue Wed Thu Fri Sat Sun             │  7-day strip (trucks, carts, trailers only)
 │ E6th E6th  —  E6th E6th Rainey Rainey   │
 │ Usual spots, updated by Rosa & Miguel.  │  caption
 └─────────────────────────────────────────┘
 ┌ ✨ What people say   [AI summary]        ┐  grape tinted card
 │ Locals rave about the al pastor…        │
 └─────────────────────────────────────────┘
 [ 📍 Check in ] [ ⚡ Report ] [ 🧭 Go ]     ActionRow (same component as the sheet)
 ┌ Busy times          [Busier than usual] ┐
 │ ▁▁▂▃▅▄▃▃▄▆█▇▅▃▂▁   (now = chili)        │
 │ 8a    12p    4p    8p    11p            │
 └─────────────────────────────────────────┘
 ┌ Top dishes ─────────────────────────────┐
 │ Al pastor taco                   $3.50  │
 │ ▓▓▓▓▓▓▓▓▓▓▓▓▓░  96% liked it            │
 └─────────────────────────────────────────┘
 (Late night) (Picnic tables) (Cash or card)   vibe chips, wrap, non-interactive
 ┌ Live reports ───────────────────────────┐
 │ 🦄 🔥 Al pastor is on point tonight   [👍 12][👎] │
 │    @tacotania · 4 min ago               │
 └─────────────────────────────────────────┘
 Owners update hours, menu and specials.     caption, centered, bottom padding insets.bottom + 24
```

Details:
- Content padding 16, gap 12. Header art height 260 (220 if window height < 700).
- **Back** ‹: `router.back()`, label `t('common.back')`. Share 📤 toasts `t('common.comingNext')`. Follow: small pill button (chili gradient "+ Follow" / ghost "✓ Following"), toggles a store flag if one exists, otherwise local state is fine tonight.
- **Stars**: five ★ in `sun`, `accessibilityLabel={t('spot.ratingA11y', { rating, count })}` "Rated 4.8 out of 5 from 212 reviews".
- **Badges**: `Badge` with tones cycling mint, sun, chili; "🚫 Not a chain" uses the grape tone. `paddingHorizontal: 10, paddingVertical: 4`, `caption`.
- **Schedule strip**: 7 equal `flex: 1` cells, gap 5, radius 11, `card2` bg, day name `micro` `ink2`, place under it `micro` at 10.5 with `numberOfLines={2}` (cells are narrow; two lines is the honest fix for French). Today: `sun` bg, #1a1300 text.
- **AI card**: bg `tint.grape` with a 1px border `rgba(165,133,255,.3)`, radius 20, padding 14. Title row: "✨ What people say" in `heading` grape, then a small `Badge` "AI summary" (grape). Body `body`.
- **ActionRow**: three `Button`s `flex: 1`, gap 10, height 44, radius 14. Check in = mint bg, text #062a1d ("✓ You're here" ghost after check-in). Report = ghost. Go = ghost, opens `Linking.openURL` with the maps URL (UI expert note: on web this opens a new tab).
- **Busy bars**: 16 bars, `flex: 1`, gap 2, max height 88, `height = max(4, v * 8.8)`, top radius 4. Normal bars `rgba(165,133,255,.45)` (day #c9c0f5), "now" bar `chili` with glow. Axis labels `micro` `ink2`, `justifyContent: 'space-between'`. Each bar `accessibilityLabel` "8pm: busy". The whole chart also has one summary label for screen readers: "Busy times. Right now: busier than usual."
- **Dish row**: name `heading` flex 1 wraps, price `ui` right (`flexShrink: 0`). Under it: track 6 tall `card2` radius 3, fill `mint` at `liked%` width, then `caption` "96% liked it".
- **Report row**: avatar 36 circle (avatar bg color), then text column (flex 1): `ui` "🔥 Al pastor is on point tonight", `caption` "@tacotania · 4 min ago". Votes on the right: two 44-tall pills (`card2`, hairline, radius 12, padding 0 10) "👍 12" and "👎". Selected: `sun` bg. Labels: "Still true, 12 votes" / "Not anymore". New reports added from the radial appear at the top with "You · just now", fading in (opacity 0 → 1, `dur.base`).
- Empty reports: `caption` `t('spot.noReports')` "No live reports yet. Be the first: +5 rep."

---

## 7. Motion spec, item by item

All values below assume `motion.ts`. "RM" = the reduce-motion fallback.

### 7.1 Pin bob (C2)

- Two shared `Animated.Value`s at the map level, `bobA` and `bobB`, each an `Animated.loop` of `timing 0 → 1` (1200 ms, `ease.soft`) then `1 → 0` (1200 ms, `ease.soft`). `bobB` starts 600 ms after `bobA`. Pins alternate between A and B by index. That gives 2 loops for the whole map instead of 12.
- Each pin: `translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, hot ? -5 : -2.5] })`. Apply to the sticker and the mood bubble, **not** the anchor dot (the dot stays planted, which reads as "hovering").
- Stop both loops when the Map tab loses focus.
- RM: no loop; values stay at 0.

### 7.2 Pin select / deselect

- Selected: sticker `scale` 1 → 1.2 and `translateY` 0 → -6 with `spring.pop`; the halo opacity × 1.4. Other pins do nothing.
- Deselect: back to 1 / 0 with `Animated.timing` `dur.fast` `ease.soft`.
- Hot ring (mood "🔥"): optional ring around the sticker, scale .85 → 1.45, opacity 1 → 0, 1800 ms `ease.out`, loop. Cut with sparks.
- RM: selected pin scales to 1.15 instantly (no travel), no ring.

### 7.3 Filter dim

- Non-matching pins: opacity → 0.3 over `dur.base` `ease.soft`; matching ones → 1. Dimmed pins stay pressable (the map is never "empty"), but sort below matching ones (`zIndex`).
- RM: same, but `dur.instant`.

### 7.4 Ticker

- On each 4 s tick (from `useClock`, `tick % 4 === 0`): out = opacity 1 → 0 and translateY 0 → -8 in `dur.fast` `ease.in`; swap the text; in = opacity 0 → 1 and translateY 10 → 0 in `dur.base` `ease.out`.
- Pause rotation while a screen reader is on (it would interrupt), and keep `accessibilityLiveRegion="none"` on the ticker.
- RM: instant swap, opacity dip to .4 and back in 120 ms total, or no animation at all.

### 7.5 Map camera (`animateTo`)

- Pan and zoom tween together: `Animated.parallel` of `tx`, `ty`, `scale`, each `timing` 420 ms `ease.soft`. Zoom levels: 0.7, 1, 1.4 (plus/minus step through them).
- Recenter: same tween to ME (820, 700) at the current zoom. The "you" dot pulse: a sky ring scale 1 → 2.6, opacity .5 → 0, 2000 ms loop.
- RM: camera moves in `dur.fast`; no you-dot pulse (static ring at .3 opacity).

### 7.6 Mood bubble pop

- When a spot's mood changes (report, go live, quick status): bubble `scale` .6 → 1 with `spring.pop`, `opacity` 0 → 1 in `dur.fast`. Key the animation on the mood string.
- RM: opacity only, `dur.fast`.

### 7.7 Report radial (C3) — `ReportRadial.tsx`

Layout (overlay above the tabs screen, below the toast):
- Backdrop: absolute fill `rgba(5,6,14,.72)`, pressable to close (label `t('common.close')`).
- Hint at 24% from the top, centered: `title` white "What's happening?" and `ui` white .9 "at Taquería La Güera 🌮".
- Origin: the center of the tab bar's Report button (bottom = tab bar height + insets.bottom - 22 + 31).
- Six items, angles 180°, 144°, 108°, 72°, 36°, 0° (left to right). `R = min(132, (windowWidth - 2*16 - 78) / 2)`. Offset: `x = cos(a) * R`, `y = -sin(a) * R * 1.25 - 70`. Item: 62×62 circle `#1d2036`, 1px `rgba(255,255,255,.2)` border, emoji 29, sun glow; label under it `caption` white, `width: 88`-wide **container** (the text itself wraps to 2 lines, `textAlign: 'center'`).
- Order and copy: Amazing 🔥, Long line ⏳, Good deal 💸, Sold out 🛑, Photo 📸, New spot ➕.

Motion:
- Open: backdrop opacity 0 → 1, `dur.fast`. Items `Animated.stagger(40, ...)` of `spring.pop` from `{ translate: 0,0, scale: .2, opacity: 0 }` to `{ translate: x,y, scale: 1, opacity: 1 }` (drive all three from one 0 → 1 value per item via `interpolate`; clamp opacity). Center button rotates to ×.
- Press-in on an item: scale 1 → 1.12 (`spring.press`).
- Close (backdrop, ×, or after a pick): all items together back to origin, scale .2, opacity 0, `dur.fast` `ease.in`; backdrop fades in `dur.fast`; unmount on completion.
- **Screen reader on OR reduce motion**: no arc. A bottom card (`radius.xl` top corners, `paper`, padding 16) with the hint, then six full-width rows (44+ tall, emoji 24 + label `heading`), then Cancel. Fades in `dur.fast`. Focus moves to the hint (`AccessibilityInfo.setAccessibilityFocus` on its node).

### 7.8 Report feedback, rep burst, emoji float (C3)

On pick (not "New spot"):
1. Close the radial (7.7).
2. **Emoji float** from the target pin (only if the Map tab is visible): 3 copies of the report emoji, 26 px, starting 70 px above the pin. Each: translateY 0 → -120, translateX 0 → (-26, 0, +26), scale .4 → 1.2 (at 20%) → .9, opacity 0 → 1 (at 15%) → 0. Duration `dur.float` 1600 ms, `ease.out`, stagger 120 ms. Render them inside the map's overlay layer so they move with the map.
3. **Rep burst** (`RepBurst.tsx`, absolute, centered at 44% of screen height, `pointerEvents="none"`): emoji 46 above a pill "+5 rep" (`ui` sun text on `rgba(12,13,26,.88)`, padding 3 10). Timeline 1300 ms total: 0–320 ms scale .4 → 1.15 and opacity 0 → 1 (`ease.out`); 320–1300 ms translateY 0 → -90, scale → 1, opacity → 0 (`ease.soft`). Unmount on finish.
4. Mood bubble pop on the pin (7.6), toast `t('report.thanks', { spot })` "Thanks, your report is live at {spot}".
- RM: no float; the burst becomes a 600 ms fade in/out with no travel; the toast stays.

### 7.9 Check-in emoji rain (C3) — `EmojiRain.tsx`

- Mount at the root of the tabs layout (above screens, below toast), `pointerEvents="none"`, absolute fill.
- 30 particles, built once in a `useMemo` with a seeded random: `x` 0..width, start y `-40 - rand * 0.5 * height`, size 20..40, drift ±30, spin ±40°, duration 1800..2600, delay 0..500. Emoji: the spot's food emoji (60%), its 2 side emoji (30%), ✨ (10%).
- One `Animated.Value` per particle 0 → 1, `Easing.in(Easing.quad)` (gravity); `translateY` to `height + 60`, `translateX` 0 → drift, `rotate` 0 → spin. Opacity 1 until 85%, then → 0.
- Run them with `Animated.parallel`; on the finish callback, call `onDone` and unmount. Nothing is left behind.
- At the same time: rep burst "+10 rep" (7.8 step 3) with 📍, toast `t('checkin.done', { spot })` "You're checked in at {spot}".
- RM: no particles. One food emoji, 72 px, centered, fades in 150 ms, holds 500 ms, fades out 250 ms; then the toast.

### 7.10 Bottom sheet

See section 5: `spring.sheet` with release velocity; content cross-fade 120/180 ms; RM = timing 180 ms.

### 7.11 Drops (C4)

- Countdown text updates once per second from `useClock` (no animation; tabular numbers).
- When a drop goes live: card border turns `rgba(255,90,60,.5)` and a "LIVE NOW" pill appears; the pill's white dot blinks opacity 1 ↔ .2, 1000 ms loop. RM: static dot.
- Portions bar drain: width tween to the new value, 600 ms `ease.soft`, `useNativeDriver: false`. RM: jump.
- **Claim**: rep burst with the drop's food emoji (7.8), then the claim modal (7.12).

### 7.12 Modals (claim code, celebrations)

- Backdrop `rgba(5,6,14,.7)` fade `dur.fast`. Box: `card`, radius 28, padding 24/20, centered with 24 margin; scale .92 → 1 and opacity 0 → 1, `dur.base` `ease.out`. No "boing".
- Close: reverse in `dur.fast`.
- RM: opacity only.

### 7.13 Go live (C5)

- **Go live big button** (Today, offline): 84 tall, radius 26, `mint`, `title`-style text #062a1d "📍 Go live now", mint glow. Optional shine: a 40%-wide white gradient strip (`LinearGradient` transparent → rgba(255,255,255,.45) → transparent) moving translateX `-width → width`, 2200 ms linear loop, 1500 ms pause between runs. Cut this first if short on time. RM: no shine.
- **Go live sheet**: same sheet visuals as a modal sheet (scrim + bottom card, radius `xl`, slide translateY 40 → 0 and opacity, `dur.base` `ease.out`).
- **On confirm**: sheet closes, the live card cross-fades into its live state, a small celebration: 12-particle `EmojiRain` with 🍔 🚚 ✨ (reuse the component with a `count` prop), toast `t('biz.liveToast', { place })` "You're live at {place}". RM: toast only.
- **Go-live pulse** (center tab button while live, and the 14px dot on the live card): a ring view behind it, scale 1 → 1.6, opacity .6 → 0, 1600 ms `ease.out`, loop. RM: no loop; a static ring at opacity .35.
- Live timer: text from `useClock`, updated each minute boundary (render on every tick is fine, it is one Text).

### 7.14 Tab switch and stack push

- Tabs: no screen animation tonight (avoid jank); only the active icon lift (section 3).
- Spot page push: default native stack animation. On web it is instant; that is fine.

---

## 8. Reduce-motion table (one place to check)

| Motion | Normal | Reduce motion |
|---|---|---|
| Pin bob | 2 shared loops, -2.5 / -5 px | Off |
| Hot ring, sparks | Loops | Off |
| Pin select | Spring scale 1.2 + lift 6 | Instant scale 1.15 |
| Filter dim | 240 ms fade to .3 | 120 ms fade |
| Ticker | Slide out/in | Instant swap |
| Camera animateTo | 420 ms tween | 180 ms tween |
| You-dot pulse | Loop | Static ring |
| Mood bubble | Spring pop | Fade 180 ms |
| Bottom sheet | Spring with velocity | Timing 180 ms |
| Report radial | Arc with 40 ms stagger | Plain list card (also when a screen reader is on) |
| Emoji float | 3 emoji rise 120 px | Off |
| Rep burst | Pop + rise | 600 ms fade in place |
| Check-in rain | 30 particles | One emoji fade + toast |
| Drop live dot | Blink loop | Static |
| Drop bar | 600 ms tween | Jump |
| Modals | Scale .92 → 1 + fade | Fade |
| Go live shine | Sweep loop | Off |
| Go-live pulse | Ring loop | Static ring |
| Toast | Slide + fade | Fade |
| Button press | Scale .97 | Opacity .7 |

---

## 9. Other screens

### 9.1 Drops (C4) — `src/app/(tabs)/drops.tsx`

```
Drops                              [⏳ Live specials]    title + sun tint pill
Limited food from local spots. When it's gone, it's gone.   body ink2
┌ DropCard ────────────────────────────────────┐
│ [FoodArt 64] Birria drop                      │  heading
│              Taquería La Güera · 0.4 mi       │  caption
│ Only 40 portions of birria with consommé…     │  body
│ Starts in  1:12:04            40 of 40 left   │  ui ink2 + title-size timer (Unbounded 20, tabular)
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (grill → sun gradient)  │  8 tall track card2
│ [ 🔔 Remind me              ] [ 🗺️ ]           │  flex-1 button + 44 icon button (Show on map)
└──────────────────────────────────────────────┘
```
- Card gap 12; live drops show "LIVE NOW" pill (chili, white `micro`) instead of the countdown, and the main button becomes "I'm on my way" (chili gradient) = claim.
- Remind me toggled: ghost "✓ We'll ping you", toast "We'll ping you 15 min before".
- Countdown format: `1d 3h`, `1:12:04`, `24:40`. Put the formatter in `src/lib/format.ts` (not in a screen).
- The timer row wraps: if French makes it too wide, "x of y left" drops to its own line (`flexWrap: 'wrap'`, `rowGap: 4`).
- **Claim modal**: `display` emoji 56, `title` "Saved one for you", `body` "Show this at the truck.", the code in a `card2` box: Unbounded 32, letter spacing 4, e.g. "LK-4827", then a primary "Done". Code accessibility label spells it out: "Code L K 4 8 2 7".

### 9.2 Ask Lokal (C4) — `src/app/(tabs)/ask.tsx`

```
✨ Ask Lokal                         [DEMO]          title + grape pill "Demo"
Real AI answers are coming. These are sample answers.   caption ink2 (always visible)
┌ messages (FlatList, newest at bottom) ───────┐
│ bot bubble (card, radius 20, bottom-left 6)  │
│                    me bubble (grill→chili) ─┐│
│ AnswerCard: [FoodArt 48] name, why, [Show on map] │
└──────────────────────────────────────────────┘
(Cheap tacos open now) (Rainy day) (Late night)  → horizontal chips (card bg, not glass)
[ What are you craving?              ] ( ↑ )      composer: input 48 tall radius 16, send 48×48 grape
```
- Bubbles `maxWidth: '86%'`, padding 10/14, `body`. Typing indicator: 3 dots 7px, each opacity .4 ↔ 1, 1000 ms loop, stagger 150 ms, shown 600 ms before a canned answer. RM: static "…".
- AnswerCard: row of `FoodArt` 48 + name `heading` + one reason line `caption`, then a ghost "🗺️ Show on map" button full width (44). It sets `selectedSpot` and routes to the Map tab.
- Wrap the screen in `KeyboardAvoidingView` (`behavior="padding"` on iOS).
- Opening message: `t('ask.hello')` "Hey! I know the local spots in Austin, and no chains, ever. What are you craving?"
- Fallback: `t('ask.fallback')` "I don't have a good match for that yet. Try tacos, BBQ, coffee, sweets or late night."

### 9.3 You (C4) — `src/app/(tabs)/you.tsx`

```
   (😋)  @you                                  avatar 92 circle, avatar bg, sun ring (3px paper + 2px sun)
         Austin · Hungry                       caption
         [✦ Regular] [340 rep]                 badges: sun tone level, grape tone rep (quiet, not huge)
┌ 12 ┐ ┌ 3 ┐ ┌ 2 ┐                           stat cards: title number, caption label; wrap to 2 rows if needed
 Spots tried  Check-ins  Reports
 160 rep to Local                              caption + a thin 6px sun progress bar
┌ Map look ────────────────────────────────┐
│ [ Auto ] [ Night ] [ Day ]                │  segmented chips, selected = sun; caption under: "Auto: night from 7pm to 7am"
└───────────────────────────────────────────┘
┌ 🏪 Switch to Business mode            ›  ┐  card row, label + caption "Smash Bros. Burgers"
└───────────────────────────────────────────┘
```
- Levels and thresholds live in one place (`src/data/levels.ts` or the store): Newcomer 0, Regular 100, Local 250, Legend 1000 (the plan lists four; the mockup's "Insider 500" is LATER).
- Rep changes animate the number? No: just re-render. The burst elsewhere already celebrates.
- The theme chips: `accessibilityRole="radio"` with `accessibilityState={{ checked }}` inside a `radiogroup` View.

### 9.4 Business Today (C5) — `src/app/(tabs)/today.tsx` (business set)

```
[FoodArt 42] Smash Bros. Burgers (✓)   [BUSINESS]    header row; ✓ = 18px sky circle; pill mint tint micro
             Today                                   caption
┌ LiveCard (offline) ───────────────────────────┐
│ ● You're offline                               │  grey 14px dot, display variant
│ Customers see your next stop: Congress Ave…   │  caption
│ [        📍 Go live now (84 tall)          ]   │
└───────────────────────────────────────────────┘
┌ LiveCard (live) ── mint radial tint + mint border ┐
│ ● You're live                                  │  pulsing mint dot (7.13)
│ Congress Ave & 2nd St · live for 12 min · until 11pm │ caption, wraps
│ [⏳ ~15 min wait] [⏰ Closing in 30]            │  2-column grid of quick-status buttons, 44+ tall,
│ [🛑 Sold out   ] [🌧️ Closed today ]            │  card2 bg, selected = sun bg
│ [            End service (ghost)            ]  │
└───────────────────────────────────────────────┘
┌ 412 ┐┌ 86 ┐┌ 128 ┐┌ 4.5 ┐                    stat row: 4 cards flex 1, number title, label micro, delta micro mint
 views check-ins followers rating               wrap to 2×2 when the window is < 360 wide
🍔 48 people nearby searched for burgers in the last hour. Most are around E 6th.   nudge card: grill/sun tint, border grill .35
```
- Live-card tint: `LinearGradient` from `rgba(52,224,161,.22)` (top-right) to transparent over `card`.
- Quick status tap: toggles (tap the selected one again to clear back to "Just parked"); toast `t('biz.statusToast', { status })` "Customers see: {status}". "Closed today" sets the pin closed.
- End service: confirm is not needed tonight; toast "Service ended. See you next time." and the card cross-fades back to offline.

**Go live sheet**: title "Go live", then location options (each a `card` row, 56+ tall, radius 16, hairline; selected = mint border + ✓): first "📍 Congress Ave & 2nd St / Your current location", then saved stops "🅿️ {name} / Saved stop · {hood}". Then `caption` heading "Serving until" and chips 9pm, 10pm, 11pm, 1am, Until sold out (wrap). Then the 84-tall "📍 Go live here". Bottom padding `insets.bottom + 16`.

### 9.5 Where, Menu, Promote placeholders (C5)

One shared `ComingNext` component: centered column, padding 24, gap 12: emoji 56, `title`, `body` `ink2`, and a `Badge` "Coming next". Never blank, works in both themes.
- Where 🧭: "Where people are hungry" / "Soon: a live map of where people near you are searching, so you know where to park."
- Menu 📋: "Your menu" / "Soon: add dishes, mark them sold out in one tap, or snap a photo of your menu board."
- Promote 📣: "Promote" / "Soon: post drops and send a few messages a week to the people who follow you."

---

## 10. Copy strings for tonight (English; fr-CA copies these for now)

| Key | en |
|---|---|
| `tabs.map` / `tabs.drops` / `tabs.report` / `tabs.ask` / `tabs.you` | Map / Drops / Report / Ask / You |
| `tabs.today` / `tabs.where` / `tabs.goLive` / `tabs.live` / `tabs.menu` / `tabs.promote` | Today / Where / Go live / Live / Menu / Promote |
| `map.askPlaceholder` | Ask Lokal: "tacos open now under $10" |
| `map.themeNight` / `map.themeDay` | Night map on / Day map on |
| `filter.all` … `filter.cheap` | All / Open now / Trucks & carts / Tacos / BBQ / Sweets & coffee / Asian / Pop-ups / $ Cheap eats |
| `sheet.title` | Live near you |
| `sheet.summary` | {count} local spots · {parked} trucks just parked · 0 chains |
| `sheet.trending` / `sheet.closest` | Trending right now / Closest to you |
| `sheet.a11y` | Spot list |
| `spot.hereNow` / `spot.open` / `spot.next` | Here now · until {time} / Open · until {time} / Next: {time} |
| `spot.closingSoon` | Closing soon · {time} |
| `spot.stillThere` / `spot.lastConfirmed` / `spot.neverConfirmed` | ✓ Still there · confirmed {min} min ago / Last confirmed {min} min ago / No one has confirmed yet |
| `spot.yepStillHere` / `spot.thanksChecking` | Yep, still here / Thanks for checking |
| `spot.friends` | {name} and {count} friends love this |
| `spot.notChain` | Not a chain |
| `spot.runBy` | Run by {owner} |
| `spot.whatPeopleSay` / `spot.aiBadge` | What people say / AI summary |
| `spot.busy` / `spot.busier` | Busy times / Busier than usual |
| `spot.topDishes` / `spot.liked` | Top dishes / {pct}% liked it |
| `spot.reports` / `spot.noReports` | Live reports / No live reports yet. Be the first: +5 rep. |
| `spot.seeAll` | See menu, busy times and reviews |
| `action.checkIn` / `action.checkedIn` / `action.report` / `action.go` | Check in / You're here / Report / Go |
| `report.title` / `report.at` | What's happening? / at {spot} |
| `report.amazing` … `report.newSpot` | Amazing / Long line / Good deal / Sold out / Photo / New spot |
| `report.thanks` | Thanks, your report is live at {spot} |
| `checkin.done` | You're checked in at {spot} |
| `rep.plus` | +{n} rep |
| `drops.title` / `drops.subtitle` | Drops / Limited food from local spots. When it's gone, it's gone. |
| `drops.startsIn` / `drops.liveNow` / `drops.left` | Starts in / LIVE NOW / {left} of {total} left |
| `drops.remind` / `drops.reminded` / `drops.remindToast` | Remind me / We'll ping you / We'll ping you 15 min before |
| `drops.claim` / `drops.claimTitle` / `drops.claimBody` | I'm on my way / Saved one for you / Show this at the truck. |
| `ask.title` / `ask.demo` / `ask.demoNote` | Ask Lokal / Demo / Real AI answers are coming. These are sample answers. |
| `ask.placeholder` / `ask.showOnMap` | What are you craving? / Show on map |
| `you.level.*` | Newcomer / Regular / Local / Legend |
| `you.toNext` | {n} rep to {level} |
| `you.theme` / `you.themeAuto` / `you.themeNight` / `you.themeDay` / `you.themeAutoNote` | Map look / Auto / Night / Day / Auto: night from 7pm to 7am |
| `you.switchBiz` / `you.switchEater` | Switch to Business mode / Switch to your personal account |
| `biz.offline` / `biz.live` / `biz.nextStop` | You're offline / You're live / Customers see your next stop: {place}, {time} |
| `biz.goLiveNow` / `biz.goLiveHere` / `biz.servingUntil` / `biz.untilSoldOut` | Go live now / Go live here / Serving until / Until sold out |
| `biz.liveFor` | {place} · live for {min} min · until {time} |
| `biz.endService` / `biz.ended` | End service / Service ended. See you next time. |
| `biz.liveToast` / `biz.statusToast` / `biz.justParked` | You're live at {place} / Customers see: {status} / Just parked |
| `common.close` / `common.back` / `common.comingNext` | Close / Back / Coming in the next version |

Emoji are never inside these strings: compose them in JSX from `emoji.ts` (for example `<Text>{emoji.report.amazing} {t('report.amazing')}</Text>`). That keeps the strings translatable and the emoji swappable.

### Length test

Add a dev-only switch in `src/i18n/index.ts` (for example `globalThis.__LOKAL_PAD__ = true` in the web console, or a constant) that pads every value by 30% with "·" characters. Check: tab labels (2 lines OK), chips (grow, never clip), sheet preview action row (labels wrap inside 44-tall buttons: give buttons `minHeight: 44` not `height`), schedule strip cells, the drop timer row, quick-status buttons, and the stat row.

---

## 11. Accessibility checklist for these screens

- Every pressable: `accessibilityRole`, a `t()` label, and `accessibilityState` for selected/disabled/checked.
- Decorative emoji and `FoodArt`: `accessible={false}` or `importantForAccessibility="no"`; the parent carries the meaning.
- Color is never the only signal: open/closed has text, the "now" busy bar has the label, selected chips also change text color.
- Contrast: `ink2` on `card` at night is about 6:1, fine; do not put `ink2` on `card2` for body text below 14 px. Mint as text on day backgrounds must be #0d8a62, not #34e0a1.
- Toasts announce. Rain, bursts and floats are `pointerEvents="none"` and hidden from screen readers.
- The bottom sheet is operable without dragging (section 5), and the radial becomes a list with a screen reader on (7.7).

---

## 12. Later (not tonight)

- Pinch zoom, clustering at low zoom, name labels on pins at high zoom.
- Moving trucks along paths and truck trails; foodie avatars on the map.
- Photo gallery with page dots on the spot page; busy-bar tooltip on press; follow notifications.
- Shared-element transition from the sheet's `FoodArt` to the spot page header (needs Reanimated).
- Haptics on check-in, report and go live (needs expo-haptics, a native module).
- Real blur glass (needs expo-blur), Skia particles for the rain.
- Business Where heatmap, Menu sold-out toggles, Promote drop composer, review replies, insights screen.
- You: food map, taste profile, lists, week-in-food share card, avatar and mood picker, Insider level and perks.
- Level-up celebration modal with the medal shine.
