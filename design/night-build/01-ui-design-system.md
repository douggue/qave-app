# Night build 01: UI design system

Owner: UI expert 1 (design system, map world, pins). Audience: the one developer building C1 to C5 tonight.
Source of truth for values: `design/lokal-mockup-v4.html` (CSS variables on lines 8 to 17 and component CSS), adjusted here where the mockup fails contrast or does not translate to React Native.
Everything below is meant to be pasted. Where the mockup uses CSS, the RN equivalent is given.

---

## 0. Priority list (what matters most tonight)

1. **`src/theme/tokens.ts` exactly as in section 1 to 4** (C1). Every component reads tokens; no hex literal in a component file except the map world palette in `LokalMap`.
2. **Sticker pin** (section 6.8, C2). It is the product's signature: emoji with no circle, glow, anchor dot, navy kind chip, live dot. Get this right before any other polish.
3. **Map world night palette** (section 5, C2). Glowing avenues, dark blocks, the map must look like "night street food" on first open.
4. **Tab bar with raised center Report** (section 6.7, C1) and **bottom sheet** (section 6.6, C2).
5. **Button, Chip, Card, Text** (sections 6.1 to 6.4, C1). Built once, used everywhere.
6. Toast, Badge, Avatar, empty/loading states (C1 to C4). Simple, but must exist so no screen is blank.
7. Day palette last. It must exist with the same keys (auto theme depends on it), but night is the hero and gets the visual QA time.

Cut first if behind: pin sparks, the Android/web blurred glow (fall back to the solid soft halo in 6.8), the Go live sweep shine, card press scale.

---

## 1. Color tokens

### 1.1 Night palette (default, hero)

| Token | Value | Use |
|---|---|---|
| `paper` | `#0d0e19` | Screen background, sheet background |
| `card` | `#171a2c` | Cards, tab bar, input fields |
| `card2` | `#1f2338` | Nested surfaces, tracks, vote buttons, schedule cells |
| `line` | `rgba(255,255,255,0.09)` | 1 px borders, dividers, sheet grabber |
| `glass` | `rgba(16,18,34,0.86)` | Floating controls over the map (chips, ask pill, icon buttons, ticker). Mockup is .78 with backdrop blur; RN has no blur here, so opacity is raised to .86 |
| `scrim` | `rgba(5,6,14,0.70)` | Radial and modal backdrop |
| `ink` | `#f5f2ff` | Primary text (= brand moon) |
| `ink2` | `#9d9abb` | Secondary text, inactive tab labels |
| `ink3` | `#77748f` | Disabled and "closed" indicator dots only, never body text |
| `hot` | `#ff5a3c` | Live pill, unread dot, "now" bar, hot ring. Decorative and large elements |
| `hot2` | `#ff2d6f` | Second stop of the hot gradient (= brand chili) |
| `neon` | `#ffcc33` | Selected chip, active tab dot, rep pill, focus ring (= brand sun) |
| `mint` | `#34e0a1` | Open/live status, Go live, success |
| `grape` | `#a585ff` | AI and Demo surfaces, info badges |
| `sky` | `#4aa8ff` | "You" dot, verified mark, links |
| `amber` | `#ffb020` | Closing-soon label (idea B) |
| `onNeon` | `#1a1300` | Text on `neon` |
| `onMint` | `#062a1d` | Text on `mint` |
| `onGrape` | `#140c33` | Text on `grape` |
| `onHot` | `#ffffff` | Text on the button gradient (see 1.4) |
| `focus` | `#ffcc33` | 2 px focus outline on web |

### 1.2 Day palette (same keys)

| Token | Value |
|---|---|
| `paper` | `#f3f4f8` |
| `card` | `#ffffff` |
| `card2` | `#f0f0f6` |
| `line` | `rgba(22,23,43,0.10)` |
| `glass` | `rgba(255,255,255,0.92)` |
| `scrim` | `rgba(22,23,43,0.45)` |
| `ink` | `#16172b` |
| `ink2` | `#5a5876` (mockup `#62607f` passes on white but is darker here for margin on `paper`) |
| `ink3` | `#9b99b0` |
| `hot` | `#c23c0a` (text-safe on day; mockup bright hot is only for fills, see `hotFill`) |
| `hot2` | `#c9174f` |
| `neon` | `#ffcc33` (fills only; text in neon is never used on day) |
| `mint` | `#0b7f56` (text/dots); fills use `mintFill` |
| `grape` | `#6b46d9` |
| `sky` | `#1769c4` |
| `amber` | `#a15c00` |
| `onNeon` | `#1a1300` |
| `onMint` | `#ffffff` on `#0b7f56`; on `mintFill` use `#062a1d` |
| `onGrape` | `#ffffff` |
| `onHot` | `#ffffff` |
| `focus` | `#16172b` |

Add two fill-only keys to both palettes so day fills stay bright while day text stays dark:

| Token | Night | Day |
|---|---|---|
| `mintFill` | `#34e0a1` | `#34e0a1` |
| `hotFill` | `#ff5a3c` | `#ff5a3c` |

### 1.3 Contrast-checked text pairs (WCAG 2.x, computed)

Use only these pairs for text. AA body = 4.5, AA large/UI = 3.0.

| Text on background | Ratio | OK for |
|---|---|---|
| night `ink` on `paper` / `card` / `card2` | 17.4 / 15.6 / 14.0 | everything |
| night `ink2` on `paper` / `card` / `card2` | 7.1 / 6.4 / 5.7 | body, captions |
| night `mint` on `card` | 10.1 | status text |
| night `neon` on `card` | 11.4 | rep pill, labels |
| night `amber` on `card` | 9.4 | Closing soon |
| night `grape` on `card` | 6.1 | AI label |
| night `sky` on `card` | 6.8 | links |
| night `hot` on `card` | 5.6 | warning text |
| night `hot2` (chili) on `card` | 4.8 | text only at 14 px bold or larger |
| `onNeon` on `neon` | 12.3 | selected chip |
| `onMint` on `mint` | 9.1 | Go live button |
| `onGrape` on `grape` | 6.6 | AI bar |
| `#ffffff` on button gradient `#d93a26 → #d81b5a` | 4.6 to 5.0 | primary button label |
| day `ink` on `paper` / `card` | 16.0 / 17.6 | everything |
| day `ink2` on `paper` | 6.2 | body |
| day `mint` / `grape` / `sky` / `hot` / `hot2` / `amber` on `paper` | 4.6 / 5.5 / 5.0 / 4.8 / 5.1 / 4.7 | status text |

Do NOT use: white on the mockup gradient `#ff5a3c → #ff2d6f` for text (3.1 to 3.6, fails). The bright gradient stays for the icon-only center Report button and for glows; the labeled primary Button uses the darker text-safe gradient in 1.4. `ink3` on `card` is 3.8: dots and disabled only.

### 1.4 Gradients (expo-linear-gradient, `start={{x:0,y:0}} end={{x:1,y:1}}` = 135deg)

```ts
export const gradients = {
  brand:   ['#ffcc33', '#ff7a45', '#ff2d6f'], // logo, splash, level ring
  hotIcon: ['#ff5a3c', '#ff2d6f'],            // center Report button, chat "me" bubble bg is hotBtn
  hotBtn:  ['#d93a26', '#d81b5a'],            // Button variant="primary" (white label passes AA)
  aiCard:  ['rgba(165,133,255,0.16)', 'rgba(74,168,255,0.08)'],
  perk:    ['rgba(255,204,51,0.16)', 'rgba(255,90,60,0.12)'],
  liveOn:  ['rgba(52,224,161,0.28)', 'rgba(52,224,161,0)'], // live card wash, start {x:1,y:0} end {x:0.4,y:0.6}
  artShade:['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.18)'], // overlay on food art, vertical, locations [0,0.35,1]
} as const;
```

Food art (spot page header, trending card, drop card): `LinearGradient colors={glow pair from emoji.ts}` start `{x:0.2,y:0.1}` end `{x:1,y:1}`, then a centered "plate" View: width 72% aspect 1, radius 999, `backgroundColor: 'rgba(255,255,255,0.18)'`, then the emoji, then the `artShade` overlay.

### 1.5 Brand re-export

```ts
import { brand } from '@/constants/brand'; // sun #ffcc33, grill #ff7a45, chili #ff2d6f, night #0b0c18, moon #f5f2ff
```
Root Stack `contentStyle.backgroundColor = brand.night` so the splash cross-fade has no color shift (DESIGN_LOG). Screens then paint `paper` (#0d0e19), which is visually identical.

---

## 2. Typography

Fonts are already loaded in `src/app/_layout.tsx`: `Unbounded_800ExtraBold`, `Figtree_700Bold`. Only these two families tonight. On Android, never combine `fontFamily` with `fontWeight` (it falls back to system); set `fontWeight` only on web if needed. Set `allowFontScaling` default true and `maxFontSizeMultiplier: 1.6` on `Text`.

```ts
export const type = {
  display: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  title:   { fontFamily: 'Unbounded_800ExtraBold', fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  heading: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 18, lineHeight: 24 },
  ui:      { fontFamily: 'Figtree_700Bold', fontSize: 15, lineHeight: 20 },
  body:    { fontFamily: 'Figtree_700Bold', fontSize: 15, lineHeight: 22 },
  label:   { fontFamily: 'Figtree_700Bold', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'Figtree_700Bold', fontSize: 12, lineHeight: 16 },
  micro:   { fontFamily: 'Figtree_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 0.4 }, // tab labels, BUSINESS pill (uppercase only here)
} as const;
export const emojiSize = { xs: 14, sm: 18, md: 24, lg: 32, xl: 48, hero: 72 } as const;
```

`Text` component: `variant` (`display|title|heading|ui|body|label|caption|micro`, default `body`), `tone` (`ink|ink2|mint|neon|amber|grape|sky|hot|onNeon|onMint|onGrape|onHot`, default `ink`). Never set `numberOfLines` on body or labels tonight (French). Exceptions allowed: spot name in a trending card `numberOfLines={2}`, mood bubble `numberOfLines={1}`.

Numbers that tick (countdowns, live timer, rep): add `fontVariant: ['tabular-nums']` so digits do not jitter.

---

## 3. Spacing, radius, elevation, glow, sizes

```ts
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const minTap = 44;
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const; // for anything visually < 44
export const screenPad = 16;
```

Radius mapping from the mockup: buttons 16 (`md`), small buttons 14, cards 22 (`lg`), sheets 28 (`xl`), icon buttons 15, chips/pills 999.

Elevation (one object per level; RN shadow props for iOS/web, `elevation` for Android):

```ts
export const elevation = {
  e0: {},
  e1: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8,  shadowOffset: { width: 0, height: 4 },  elevation: 3 },  // chips, icon buttons over map
  e2: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8 },  // cards that float, toasts
  e3: { shadowColor: '#000', shadowOpacity: 0.6,  shadowRadius: 24, shadowOffset: { width: 0, height: -10 }, elevation: 16 }, // bottom sheet (shadow upward)
} as const;
// Day: same shapes, shadowColor '#16172b', opacity x0.5.
```

Glow helper (night only; day returns `elevation.e1` tinted):

```ts
export const glow = (color: string, r = 16, o = 0.8) => ({
  shadowColor: color, shadowOpacity: o, shadowRadius: r, shadowOffset: { width: 0, height: 0 },
});
```
On Android `shadowColor` does not glow. Where glow matters (pins, center button, selected chip), render a sibling halo View behind the element: same shape, `backgroundColor: color`, `opacity: 0.35`, scaled 1.25. On web, the `shadow*` props work via react-native-web; tolerable as-is.

Motion tokens (Animated):

```ts
export const motion = {
  fast: 150, base: 250, slow: 400,
  spring: { friction: 6, tension: 80, useNativeDriver: true },      // pops, radial fan-out
  sheetSpring: { friction: 10, tension: 70, useNativeDriver: false }, // height is not native-driver capable; prefer translateY + native driver
  stagger: 35, // ms between radial items (mockup value)
  bob: { distance: 3, duration: 1200 }, // each way, ease in-out, loop
} as const;
```
Under reduce motion: no loops (bob, pulse, sweep, live-dot ring), springs become 150 ms opacity fades.

---

## 4. Map world palette (LokalMap only)

From mockup lines 10 and 16. Lives in `src/theme/tokens.ts` as `mapNight` / `mapDay`, consumed only by `LokalMap`.

| Key | Night | Day |
|---|---|---|
| `bg` (outside blocks) | `#0d0e19` | `#f3f4f8` |
| `road` | `#262a46` | `#fdfdfb` |
| `block` | `#151829` | `#eceee4` |
| `bldg` | `#1b1f36` | `#e0e3d4` |
| `park` | `#13291f` | `#cfe9b9` |
| `tree` | `#1d4632` | `#a9d68d` |
| `water` | `#0e2546` | `#a8dcf5` |
| `bank` | `#133158` | `#d3edf9` |
| `ave` (avenue fill) | `#d9a134` | `#ffd866` |
| `aveO` (avenue casing) | `#8f6417` | `#efbd3c` |
| `hwy` (I-35) | `#ff7a45` | `#ff9f59` |
| `hwyO` | `#9c3f17` | `#e57f35` |
| `label` (hood labels) | `#68668c` | `#86839e` |
| `wl` (water label) | `#4e86c4` | `#4f95bf` |

SVG text: hood labels Figtree_700Bold 15, letterSpacing 4, uppercase, `fill=label`; street labels 12; water label 15, `fontStyle="italic"`. Night avenue glow: draw the avenue path twice, first at strokeWidth +10 with `stroke=ave` and `strokeOpacity=0.18`, then the normal stroke. Same for I-35 with `hwy`. No SVG filters (slow on Android).

You dot (ME at 820,700): 24x24, radius 12, `backgroundColor: sky`, `borderWidth: 4`, `borderColor: '#fff'`; pulse ring 24 to 56 px, opacity 0.6 to 0, 2 s loop (off under reduce motion). a11y label `t('map.you')` = "You are here".

---

## 5. Emoji module contract (`src/theme/emoji.ts`)

Only file with emoji characters (besides `src/data/sample.ts`). Shape:

```ts
export const food = { tacos: '🌮', bbq: '🍖', sweets: '🥐', asian: '🍜', burgers: '🍔', caribbean: '🍗', popup: '🍲', ... };
export const kind = { truck: '🚚', trailer: '🛻', cart: '🛒', popup: '🎪', restaurant: '🏠' };
export const report = { amazing: '🔥', line: '⏳', deal: '💸', soldOut: '🛑', photo: '📸', newSpot: '🆕' };
export const status = { parked: '🚚', wait: '⏳', closingSoon: '⌛', soldOut: '🛑', closed: '💤', live: '🟢' };
export const tab = { map: '🗺️', drops: '🎁', report: '➕', ask: '✨', you: '🙂', today: '📊', where: '📍', golive: '📡', menu: '📋', promote: '📣' };
export const avatar = ['🦊', '🐻', '🐸', '🐼', '🦝', '🐯'];
export const ui = { bell: '🔔', sun: '☀️', moon: '🌙', star: '⭐', recenter: '🎯', sparkles: '✨', dice: '🎲', plus: '+', minus: '−', check: '✓' };
// Glow pair per spot id, from mockup `col` (c1 = light, c2 = glow color)
export const glow: Record<string, [string, string]> = {
  guera: ['#ffb48f', '#ff6f4f'], smoke: ['#d9a77c', '#8a4b2a'], dough: ['#ffe6a3', '#f5b94e'],
  pho: ['#bfe2ff', '#5ea8e8'],   smash: ['#ffd68a', '#ff9f2e'], kolache: ['#ffd9b8', '#f0995a'],
  jerk: ['#b7ec9f', '#3fb36b'],  paleta: ['#ffc2de', '#ff7fb3'], supper: ['#d9c8ff', '#8f6bff'],
  curry: ['#ffe1a1', '#f2a33a'], dumpling: ['#ffe3d1', '#ff9f80'], bean: ['#e9d3bd', '#a8774f'],
};
export const glowFallback: [string, string] = ['#ffe0cc', '#ff9f80'];
```
Note `smoke` glow `#8a4b2a` is too dark to read as glow on the night map: use `c1` (`#d9a77c`) as the pin glow when `c2` luminance is below 0.12; simplest: pins always glow with `c2` except `smoke` and `bean`, which use `c1`. Emoji are decorative: wrap every emoji `Text` in `accessibilityElementsHidden` / `importantForAccessibility="no"` and put meaning in the parent label.

---

## 6. Component specs (`src/components/ui/` unless noted)

### 6.1 Button (`Button.tsx`)

Props: `variant: 'primary' | 'mint' | 'ghost' | 'soft'`, `size: 'md' | 'sm'`, `label: string` (already translated), `icon?: string` (emoji from map), `onPress`, `disabled?`, `accessibilityHint?`, `fullWidth?` (default true).

| | md | sm |
|---|---|---|
| minHeight | 50 | 44 |
| paddingHorizontal | 20 | 14 |
| paddingVertical | 12 | 10 (so wrapped French labels grow, never clip) |
| radius | 16 | 14 |
| text | `ui` 15 | `label` 14 (fontSize 14, lineHeight 18) |
| gap icon/label | 8 | 6 |

Variants:
- `primary`: `LinearGradient gradients.hotBtn` 135deg, label `#ffffff`, `glow('#ff3c50', 14, 0.6)` offset y 8. Use for Check in, Go live here, Claim.
- `mint`: bg `mintFill`, label `onMint` (night) / `#062a1d` (day), `glow(mint, 12, 0.6)`. Use for Go live, "Yep, still here".
- `ghost`: transparent, `borderWidth: 1.5`, `borderColor: line`, label `ink`. Use for Report, Open, End service.
- `soft`: bg `card2`, border 1 `line`, label `ink`. Quick-status buttons, votes.
- Pressed: `transform: [{ scale: 0.97 }]` 100 ms (skip under reduce motion); opacity 0.9.
- Disabled: `opacity: 0.4`, `accessibilityState={{ disabled: true }}`.
- Always `accessibilityRole="button"`, `accessibilityLabel={label}`. Label `textAlign: 'center'`, no `numberOfLines`.
- Action rows (Check in / Report / Open): `flexDirection: 'row', flexWrap: 'wrap', gap: 8`, each button `flexGrow: 1, flexBasis: 100` (wraps to 2 lines of buttons in French instead of shrinking text).

### 6.2 Chip (`Chip.tsx`)

Props: `label`, `icon?`, `selected?`, `onPress`, `tone?: 'glass' | 'solid'` (glass over the map, solid on screens).
- minHeight 36, visual; wrap the Pressable with `hitSlop={{top:4,bottom:4}}` to reach 44. paddingHorizontal 14, paddingVertical 8, radius pill, gap 6, borderWidth 1, borderColor `line`.
- glass: bg `glass`; solid: bg `card`. Text `label` 13 `ink`.
- selected: bg `neon`, text `onNeon`, borderColor transparent, `glow(neon, 12, 0.7)` night only.
- `accessibilityRole="button"`, `accessibilityState={{ selected }}`. No width, no `numberOfLines`.
- Filter row: horizontal `ScrollView`, `contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}`, `showsHorizontalScrollIndicator={false}`.
- Wrapping chip groups (vibe chips, Ask suggestions, serving-until): `flexDirection: 'row', flexWrap: 'wrap', gap: 8`.

Filter copy (i18n keys `filter.*`): All, Open now, Trucks & carts, Tacos, BBQ, Sweets, Asian, Pop-ups, $.

### 6.3 Card (`Card.tsx`)

- bg `card`, borderWidth 1, borderColor `line`, radius 22, padding 14, gap 10 (column).
- Variants: `default`; `ai` (LinearGradient `aiCard`, border `rgba(165,133,255,0.30)`, radius 20, padding 12/14); `live` (default + `liveOn` wash overlay, border `rgba(52,224,161,0.45)`, `glow(mint, 18, 0.35)`); `hot` (border `rgba(255,90,60,0.50)`, `glow(hot, 16, 0.35)`, for live drops).
- Pressable cards: `accessibilityRole="button"` with a full sentence label; press scale 0.98.

Trending card (sheet): width 168 (this is a card width, text inside wraps; set `flexShrink` on texts), art 168x110 radius 18, then name `ui` 14 / lineHeight 18 `numberOfLines={2}`, then status line.
List row (Closest to you): row, gap 12, paddingVertical 9, divider 1 `line` between rows; art 52x52 radius 16; text column `flex: 1`; distance `label` 12 `ink2` right-aligned.

### 6.4 Badge (`Badge.tsx`)

- paddingHorizontal 9, paddingVertical 4, radius pill, gap 4, text `caption` 12.
- Tones: `grape` (bg `rgba(165,133,255,0.16)`, text `grape`), `mint` (bg `rgba(52,224,161,0.14)`, text `mint`), `neon` (bg `rgba(255,204,51,0.14)`, text `neon`), `amber` (bg `rgba(255,176,32,0.14)`, text `amber`), `hot` (bg `hotFill`, text `#fff`, use 12 bold only for short "LIVE"/"Sold out"), `neutral` (bg `card2`, text `ink2`).
- **Not a chain** badge: tone `mint`, icon `ui.check`, copy `t('spot.notChain')` = "Not a chain". Always shown on spot page, first in the badge row.
- **Closing soon** (idea B): tone `amber`, copy "Closes in {min} min". Optional pulse: opacity 1 to 0.6, 1 s loop, off under reduce motion.
- **Freshness** (idea A): tone `neutral`, copy "Seen {min} min ago" / "Seen {hours} h ago"; if older than 3 h, tone `amber` + "Still there? Not sure".
- **Demo** (Ask): tone `grape`, copy "Demo · real AI coming".
- **BUSINESS** pill: tone `mint`, `micro` uppercase.
- Live pill: bg `hotFill`, white `micro`, leading 7x7 white dot (blink 1 s, off under reduce motion), `glow(hot, 10, 0.7)`.

### 6.5 Text status lines

- Open: 8x8 dot `mint` with `glow(mint,6,0.9)` + text `label` 13 `mint`: "Open · until {time}".
- Closed: dot `ink3`, text `ink2`: "Closed · opens {when}".
- Rating: `ui.star` + "{rating}" `label` `ink` + " ({count})" `ink2`.
- Distance: "{n} mi" en-US / "{n} km" fr-CA (format in i18n, not in components).

### 6.6 Bottom sheet (`src/components/sheet/BottomSheet.tsx`)

- Container: absolute, left/right 0, bottom 0 (above tab bar), bg `paper`, `borderTopLeftRadius: 28`, `borderTopRightRadius: 28`, `borderTopWidth: 1`, `borderColor: line`, `elevation.e3`.
- Snaps as fraction of the available height (screen minus top safe area minus tab bar): `peek = 132 px` (fixed: grabber + title + one row), `half = 0.48`, `full = 0.88`. Animate `translateY` (native driver), not height.
- Grabber zone: paddingTop 10, paddingBottom 6, full width, is the PanResponder area. Grabber bar 42x5, radius 3, bg `line` (night use `rgba(255,255,255,0.18)` so it is visible).
- Header row (inside grab zone, below bar): title `heading` 18 + a 44x44 snap button on the right: `accessibilityRole="button"`, label "Sheet: {state}. Tap to expand" / "Tap to collapse". Cycles peek > half > full > peek.
- Body: `ScrollView`, paddingHorizontal 16, paddingBottom 20, gap 14. `scrollEnabled` only at `full`.
- Release logic: velocity |vy| > 0.5 picks the next snap in that direction, otherwise nearest snap. Spring `motion.sheetSpring` with native driver on translateY.
- Section titles: `heading` 18 "Trending right now", "Closest to you".
- Preview state (pin tapped): art 64x64 radius 18 + column (name `title` 22 wraps, rating line, status line, freshness badge, distance) + action row (Check in `primary`, Report `ghost`, Open `ghost`) + close button 44x44 top-right "Back to list".
- Web: set `style={{ touchAction: 'none' }}` on the grab zone via `Platform.OS === 'web'` to stop page scroll.

### 6.7 Tab bar (`src/app/(tabs)/_layout.tsx` custom `tabBar`, component in `src/components/nav/TabBar.tsx`)

- Bar: bg `card`, `borderTopWidth: 1`, `borderTopColor: line`, paddingTop 6, paddingHorizontal 6, paddingBottom `max(insets.bottom, 8)`, `flexDirection: 'row'`, `alignItems: 'flex-end'`. Bar content height 56.
- Tab item: `flex: 1`, minHeight 48, alignItems center, gap 3, paddingVertical 4. Icon emoji 22; label `micro` 11 (no uppercase, no letterSpacing for tab labels) `ink2`, `textAlign: 'center'`, allowed to wrap to 2 lines (French "Demander").
  - Inactive: icon opacity 0.5.
  - Active: label `ink`, icon opacity 1, `translateY: -2, scale: 1.08` (250 ms; static under reduce motion), 5x5 dot `neon` 4 px below label, `glow(neon,6,0.9)`.
  - `accessibilityRole="tab"`, `accessibilityState={{ selected }}`, `accessibilityLabel` = tab name. Container `accessibilityRole="tablist"`.
- Center Report (eater): wrapper `marginTop: -16` (raised). Circle 62x62 radius 31, `LinearGradient gradients.hotIcon`, emoji `tab.report` 28, ring: outer View 72x72 radius 36 bg `paper` around it (= mockup 5 px paper ring), plus `glow('#ff3c5a', 20, 0.9)` (Android: halo View). Label under it "Report" `micro` `ink2`. When the radial is open, rotate the icon 45deg (250 ms). `accessibilityRole="button"`, label "Report what's happening", hint "Opens quick report options".
- Center Go live (business): same geometry, bg `mintFill`, emoji `tab.golive` 26; while live bg `hotFill`, label "Live", glow pulses 1.6 s (off under reduce motion). Label "Go live" / "Live · {min} min".
- Eater tabs: Map, Drops, (Report), Ask, You. Business tabs: Today, Where, (Go live), Menu, Promote.

### 6.8 Sticker pin (`src/components/map/SpotPin.tsx`)

Absolute View positioned so the **anchor dot center** sits on the spot's (x, y): `left: x - 30`, `top: y - 72` (box 60 wide, 76 tall, anchor at y 72).

Layers, bottom to top, inside a 60x76 box with `alignItems: 'center'`:
1. **Glow** (night only), centered on the emoji (top 4, 52x52):
   - iOS: the emoji Text itself gets `textShadowColor: glowColor, textShadowRadius: 14, textShadowOffset: {0,0}` plus wrapper `glow(glowColor, 18, 0.9)` on a 44x44 transparent View with radius 22 and `backgroundColor: 'rgba(0,0,0,0.001)'` (iOS needs a background to cast).
   - Android and web: a 46x46 View, radius 23, `backgroundColor: glowColor`, `opacity: 0.28`, `transform: [{scale: 1.15}]`. Web additionally `filter: 'blur(10px)'` via a web-only style. Cut-first fallback: the opacity halo without blur.
   - Day: no glow; shadow `shadowColor '#16172b', opacity 0.35, radius 6, offset y 4` (iOS/web), `textShadow` on Android with `rgba(22,23,43,0.35)` radius 4 offset y 2.
2. **Sticker emoji**: Text fontSize 40, lineHeight 48, height 52, no background, no circle. Selected: `scale 1.2, translateY -5` spring.
3. **Anchor dot**: 10x10, radius 5, bg `#ffffff`, marginTop 2; night `glow(glowColor, 8, 0.9)`; day border 1.5 `rgba(22,23,43,0.25)`.
4. **Kind badge chip**: absolute `left: 4, top: 30` (bottom-left of the emoji), 22x22 radius 11, bg night `#1a1d33` with border 1.5 `rgba(255,255,255,0.22)`, day `#ffffff` with border 1.5 `rgba(22,23,43,0.12)`; kind emoji 13 centered.
5. **Live dot**: absolute `right: 6, top: 4`, 14x14 radius 7, bg `mint`, border 3 `paper`, `glow(mint, 6, 0.9)`. Closed: bg `ink3`, no glow.
6. **Mood bubble** (when spot has mood): absolute, bottom 80 (above the box), centered (`alignSelf: 'center'`), paddingHorizontal 10, paddingVertical 4, radius pill, night bg `rgba(12,13,26,0.90)` border 1 `rgba(255,255,255,0.16)` text `#fff`; day bg `#fff` border `rgba(22,23,43,0.12)` text `#16172b` + `elevation.e1`. Text `caption` 12 `numberOfLines={1}`, `maxWidth: 180`. Hot spots: additional ring 64x64 radius 32 border 2 `hot` `glow(hot,10,0.8)` scaling 1 to 1.25 / opacity 1 to 0 1.8 s loop (cut first, off under reduce motion).
7. **Bob** (hot or selected only, not all 12, to save frames): translateY 0 to -3, 1.2 s each way, `Easing.inOut(Easing.sin)`, native driver. Off under reduce motion.

States: closed `opacity: 0.55` (emoji only, badge and dot stay full); filtered-out `opacity: 0.3` and `pointerEvents: 'none'`, 250 ms fade.
Hit area: the whole 60x76 box (>= 44). `accessibilityRole="button"`, `accessibilityLabel` = `t('pin.a11y', {name, kind, status, distance})` = "{name}, {kind}, {status}, {distance}", hint "Shows details". Mood bubble text is appended to the label when present.
Sizes for QA (DESIGN_LOG rule): check the emoji at 24, 40 and 56 on both palettes; tonight's map uses 40 at zoom 1, 32 at zoom 0, 48 at zoom 2 (scale the pin box proportionally, keep the anchor dot at 10).

Selected z-order: the selected pin renders last (on top). The mood bubble shows only when the spot has a mood.

### 6.9 Map controls (over the map)

- Top bar: paddingHorizontal 12, paddingTop `insets.top + 8`, row, gap 10.
  - Ask pill: `flex: 1`, minHeight 50, paddingHorizontal 14, radius 17, bg `glass`, border 1 `line`, `elevation.e2`, `ui.sparkles` icon + text "Ask Lokal anything" `ui` `ink2` `numberOfLines={1}` (single exception: it is a placeholder hint; full text is in the a11y label). Role button, label "Ask Lokal".
  - Icon button (bell, day/night): 44x44 radius 15 bg `glass` border 1 `line` `elevation.e1`, emoji 19. Unread badge: absolute top -4 right -4, minWidth 18 height 18 radius 9 bg `hotFill` text `#fff` 11 bold, paddingHorizontal 4. Label "Notifications, {count} unread"; day/night label "Switch to day map" / "Switch to night map".
- Filter chips row 8 px below, then ticker 8 px below.
- Ticker: `alignSelf: 'flex-start'`, maxWidth 100%, bg `glass`, border 1 `line`, radius pill, paddingVertical 5, paddingLeft 5, paddingRight 12, gap 8, avatar 24, text `caption` 12.5 to 13 `ink`, wraps to 2 lines max (`numberOfLines={2}`). Cross-fade 250 ms on change; `accessibilityLiveRegion="polite"` on Android only (avoid chatter on iOS: do not set it).
- Right rail (bottom-right, above sheet peek, gap 10): zoom +, zoom -, recenter: each 44x44 icon button. Labels "Zoom in", "Zoom out", "Center on me". Optional "Surprise me" (C4 stretch): 44x44 with dice emoji, label "Surprise me".

### 6.10 Avatar (`Avatar.tsx`)

- Sizes: `sm 24`, `md 36`, `lg 92`. Circle, bg from a fixed list `['#ffd68a','#b7ec9f','#bfe2ff','#ffc2de','#d9c8ff','#ffe1a1']` indexed by avatar index, emoji at 55% of size.
- Friend stack: sm avatars, `marginLeft: -7` after the first, border 2 `paper`.
- You tab lg: ring = border 3 `paper` inside an outer 102x102 circle bg `neon` (2 px visible) + `glow(neon, 16, 0.7)` night. Level medal chip 34x34 radius 17 bg `card` border 2 `paper` absolute right -4 bottom -4.
- Decorative: `importantForAccessibility="no-hide-descendants"`; the row label carries the name.

### 6.11 Toast (`Toast.tsx`, `ToastHost`, `useToast()`)

- Position: absolute, top `insets.top + 64` (under top bar), centered, maxWidth `88%`, zIndex 50.
- Style: bg `#f5f2ff` (night) / `#16172b` (day), text `#16172b` / `#f5f2ff`, `ui` 14, `textAlign: 'center'`, paddingHorizontal 16, paddingVertical 10, radius 14, `elevation.e2`. Optional leading emoji.
- Motion: in = opacity 0 to 1 + translateY -10 to 0 (250 ms); hold 2600 ms (+40 ms per char over 40, max 5000); out 200 ms. Reduce motion: opacity only.
- `useToast().show(message, { emoji?, tone? })`, queue one at a time.
- a11y: `accessibilityLiveRegion="polite"` (Android) and `AccessibilityInfo.announceForAccessibility(message)` on show (iOS/web).
- Copy keys: `toast.reportLive` "Thanks, your report is live at {spot}", `toast.newSpotSoon` "Adding new spots is coming next", `toast.comingSoon` "Coming soon", `toast.checkedIn` "Checked in at {spot} · +{rep} rep", `toast.stillHere` "Thanks for confirming · +2 rep", `toast.remindOn` "We'll remind you when it drops", `toast.bizSoon` "Business mode is coming next".

### 6.12 Rep pill and burst

- Rep pill: bg `rgba(255,204,51,0.14)`, text `neon` `label` 13, paddingHorizontal 11, paddingVertical 6, radius pill, tabular nums: "{n} rep". Quiet, not a game score: never animate the number counting up, just swap.
- "+5 rep" burst: emoji 46 with `textShadow` neon radius 16; under it a pill bg `rgba(12,13,26,0.85)` text `neon` `label` 14. Rises 40 px and fades over 900 ms. Reduce motion: fade only.

### 6.13 Report radial (visual only; behavior owned by UX 1)

- Backdrop: `scrim`, tap to close (label "Close report menu").
- Target line at 24% from top: caption "Reporting at" `ink2`, name `title` 22 `#fff`, wraps, centered, paddingHorizontal 24.
- Option: column, width 84, gap 5; circle 62x62 radius 31 bg `#1d2036` border 1 `rgba(255,255,255,0.20)`, emoji 29, `glow(neon, 14, 0.5)`; label `label` 13 `#fff`, centered, wraps (width 84 is for the circle column; label can grow to 2 lines).
- Arc: 6 items at angles `[165, 135, 105, 75, 45, 15]` degrees (mockup formula): `tx = cos(a) * R`, `ty = -sin(a) * R * 1.25 - 70`, with `R = Math.min(130, screenWidth * 0.34)`, origin at the center Report button. Spring from scale 0.2 / opacity 0 with stagger 35 ms.
- List fallback (screen reader or reduce motion): sheet-style Card list, each row 56 high, emoji 24 + label `ui`.

### 6.14 Empty, loading and placeholder states

- Empty state (`EmptyState.tsx`): centered column, gap 10, padding 24; emoji 48; title `heading` 18 centered; body `body` `ink2` centered maxWidth 320; optional Button `ghost` sm.
  - Filter with no match never happens (map never empty), but the list: "Nothing here right now" / "Try another filter".
  - Ask fallback answer: "Hmm, I don't know that one yet. Try tacos, late night or rainy day."
  - Drops none: "No drops tonight" / "Turn on reminders and we'll ping you."
- Business placeholders (Where, Menu, Promote), use EmptyState with a `Badge tone="grape"` "Coming next":
  - Where: "Where you sell" / "See where hungry people are and plan your weekly stops. Coming next."
  - Menu: "Your menu" / "Add dishes and mark them sold out in one tap. Coming next."
  - Promote: "Promote" / "Create drops and tell your followers you're live. Coming next."
- Loading (skeleton): bg `card2`, radius matches the target (card 22, line 6), opacity loop 0.5 to 1, 900 ms (static 0.7 under reduce motion). Tonight only needed while AsyncStorage hydrates: show the map with no skeleton; the store hydrates before the splash ends, so a skeleton is a fallback only.

### 6.15 Screen (`Screen.tsx`)

- `SafeAreaView` edges `['top']` (tab bar handles bottom), bg `paper`, `flex: 1`. Optional `scroll` prop: `ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}`.
- Screen header: `title` 22 left, optional right element; paddingTop 8, paddingBottom 8.

### 6.16 Spot page specifics (for UI 2, so tokens match)

- Art header height 240, full width, no radius, gradient from glow pair, emoji 96 (hero), plate as in 1.4. Back button 44x44 glass over it at `insets.top + 8, left 12`.
- Schedule strip: 7 equal cells `flex: 1`, gap 6, radius 11, padding 6/2, bg `card2`, day `caption` 11 `ink2`, place `micro` 10; today: bg `neon` text `onNeon`.
- Busy bars: height 64, bars `flex: 1` gap 3, radius 4 top, bg `rgba(165,133,255,0.45)`, now bar bg `hot` `glow(hot,8,0.7)`, minHeight 4. Axis `caption` 11 `ink2`.
- % liked bar: track 6 high radius 3 bg `card2`, fill `mint`.
- Portions-left bar (Drops): track 8 radius 4 bg `card2`, fill LinearGradient `['#ff5a3c', '#ffcc33']` horizontal.

---

## 7. `tokens.ts` skeleton (paste)

```ts
import { brand } from '@/constants/brand';

const night = {
  paper: '#0d0e19', card: '#171a2c', card2: '#1f2338', line: 'rgba(255,255,255,0.09)',
  glass: 'rgba(16,18,34,0.86)', scrim: 'rgba(5,6,14,0.70)',
  ink: '#f5f2ff', ink2: '#9d9abb', ink3: '#77748f',
  hot: '#ff5a3c', hot2: '#ff2d6f', neon: '#ffcc33', mint: '#34e0a1', grape: '#a585ff', sky: '#4aa8ff', amber: '#ffb020',
  mintFill: '#34e0a1', hotFill: '#ff5a3c',
  onNeon: '#1a1300', onMint: '#062a1d', onGrape: '#140c33', onHot: '#ffffff', focus: '#ffcc33',
  pinChip: '#1a1d33', pinChipBorder: 'rgba(255,255,255,0.22)', bubble: 'rgba(12,13,26,0.90)', bubbleInk: '#ffffff',
  toastBg: '#f5f2ff', toastInk: '#16172b',
};
export type Palette = typeof night;
const day: Palette = {
  paper: '#f3f4f8', card: '#ffffff', card2: '#f0f0f6', line: 'rgba(22,23,43,0.10)',
  glass: 'rgba(255,255,255,0.92)', scrim: 'rgba(22,23,43,0.45)',
  ink: '#16172b', ink2: '#5a5876', ink3: '#9b99b0',
  hot: '#c23c0a', hot2: '#c9174f', neon: '#ffcc33', mint: '#0b7f56', grape: '#6b46d9', sky: '#1769c4', amber: '#a15c00',
  mintFill: '#34e0a1', hotFill: '#ff5a3c',
  onNeon: '#1a1300', onMint: '#062a1d', onGrape: '#ffffff', onHot: '#ffffff', focus: '#16172b',
  pinChip: '#ffffff', pinChipBorder: 'rgba(22,23,43,0.12)', bubble: '#ffffff', bubbleInk: '#16172b',
  toastBg: '#16172b', toastInk: '#f5f2ff',
};
export const palettes = { night, day } as const;
export { brand };
// + type, space, radius, minTap, hitSlop, elevation, glow, motion, gradients, mapNight, mapDay from sections 1-4
```
Note `onMint` on day: buttons use `mintFill` as their background, so `#062a1d` is correct on both.

`use-theme.ts` returns `{ mode: 'night' | 'day', c: Palette, map: MapPalette, isNight }`; auto = night when `hour >= 19 || hour < 7`, re-evaluated from `use-clock` once per minute (not every second).

---

## 8. French and accessibility checklist for every component

- No fixed width on any element that contains text, except: trending card (168, text wraps inside), radial option column (84, label wraps), mood bubble (maxWidth 180, single line, truncation acceptable because the full text is in the pin's a11y label).
- No `numberOfLines` on buttons, chips, badges, toasts, body.
- Test once per chunk with a debug flag `__DEV__ && PAD_STRINGS` in `t()` that appends 30% `·` padding; nothing should clip mid-word.
- Every Pressable: role, label, and visual size >= 44 or `hitSlop`.
- Emoji never carry meaning alone: hidden from a11y, meaning in the label.
- Color never carries meaning alone: open/closed has text, closing soon has text, selected chip has `accessibilityState`.
- Web focus: add `outlineColor: focus, outlineWidth: 2, outlineStyle: 'solid', outlineOffset: 2` on focus for Pressables (web-only style).

---

## Later (not tonight)

- Real custom emoji PNGs from `assets/emoji/manifest.json` (swap inside `emoji.ts` for an `EmojiImage` component, sizes 24/40/56).
- Blur glass via `expo-blur` (needs a dev build check), Skia glow, Reanimated sheet with gesture handler, pinch zoom.
- Mapbox styles matching `mapNight` / `mapDay`.
- Dynamic Type audit at 200%, high-contrast mode palette, full fr-CA copy pass.
- Pin clustering at low zoom, labels-on-zoom (mockup `.world.labels`), truck trails.
- Level-up medal modal, share card gradients, heatmap legend, QR poster styles.
