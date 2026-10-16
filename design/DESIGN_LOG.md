# Lokal: design log

The lead designer's running record: decisions made, and every change still to make.
Check this file before any design or emoji work. Tick items off as they're done.

## Decisions

| Date | Decision |
|---|---|
| 2026-10-16 | Visual direction is mockup v3 (night street-food look), plus Business mode from v4. Keep the fun and animation; no Duolingo-style look. |
| 2026-10-16 | Custom emoji are AI-generated with ChatGPT in 3×3 sheets, then split and cleaned with `tools/split-sheet.py`. |
| 2026-10-16 | **Style anchor: `emoji/approved/food-taco.png` and `food-burger.png`.** Glossy, soft 3D render, chunky simple shapes, thin even white sticker rim, no dark outline lines, fully solid. Every new emoji is judged next to these two. |
| 2026-10-16 | Rejected: photoreal food (taco v1) and the burger with a dark outline and painted look (burger B). |
| 2026-10-16 | **Pins are the sticker itself**, no colored circle behind it: soft colored glow at night, soft shadow by day, small anchor dot under it. |
| 2026-10-16 | **Spot-type badges sit on a small round chip** (white on the day map, dark navy on the night map) at the pin's bottom-left, so tiny icons stay readable and don't blend into the food. |
| 2026-10-16 | Every emoji is checked at 24, 40 and 56 px on both the night and day map before it's approved. |
| 2026-10-16 | **Logo: concept B · Bite pin** (chosen by the founder). A map pin with a bite taken out of it: food + location. Splash: the pin pops in and gets bitten, crumbs fly, then the wordmark. |
| 2026-10-16 | Cleanup is always applied: remove haze, make fully opaque, trim, square. |

## Changes to make

### Emoji to regenerate

- [ ] **Spot types and statuses sheet (all 9): redo.** The test came out as flat "game icon" cartoon, not the glossy 3D of the anchor. Prompt updated with stronger style rules.
  - Pop-up tent and market stall: much simpler (fewer props) so they read as badges at 18 px.
  - Bike cart: simpler, bigger wheels, no small parts.
- [ ] **Curry bowl:** too similar to the ramen at small size. Redo as curry and rice on a white oval plate.
- [ ] **BBQ brisket and ribs:** too much texture compared with the rest. Redo smoother and glossier, fewer char marks.
- [ ] Keep from food sheet 1 as approved: pho, ramen, dumplings, pizza slice, hot dog, fried chicken.

### Emoji still to make

- [ ] Food sheets 2, 3 and 4
- [ ] Live reports
- [ ] Reactions and effects
- [ ] Avatars 1, Avatars 2 and moods
- [ ] Rewards and drops
- [ ] Business tools
- [ ] App icon and splash mark (to be refined by a designer if it will be trademarked)

### Logo and splash

Concepts (canvas): https://claude.ai/artifact/BpSfoPp9LvWgkv5tmJujG7 · source copies in `logo/`.
A · Pin-o (the "o" is a map pin), B · Bite pin (pin with a bite), C · Neon sign (script neon), D · Sticker slap (sticker wordmark + emoji).

- [x] Choose a concept: **B · Bite pin**.
- [x] Refinement round on the canvas (row 3): bite shapes, icon at real sizes, colors and versions, refined splash.
- [ ] Approve the refined bite: **three equal teeth** at the top right (main logo), **two big teeth + bigger hole** for 24 px and smaller.
- [ ] Approve the app icon: white bite pin on the Sun → Grill → Chili gradient (alternate: gradient pin on Night navy).
- Logo colors: Sun #FFCC33, Grill #FF7A45, Chili #FF2D6F, Night #0D0E19, Moon #F5F2FF. Wordmark: Unbounded ExtraBold (Google Fonts, OFL).
- Splash timing (smoothed): fade in, pin rises and pops by 0.45 s; three teeth sink in with eased, overlapping timing at 0.6–0.9 s; soft recoil tilt instead of a shake; crumbs arc out and fall; wordmark by 1.45 s, tagline by 1.75 s; scene fades out before the loop. No springy overshoot on the bite.
- [ ] Refine the bite so it reads as a **food bite, not Apple's logo**: keep three clear rounded "teeth" scallops at the top right, keep the pin's pointed tail and the hole as the main silhouette, no leaf, never on a round fruit-like shape.
- [ ] Test the app icon at 16, 24, 40 and 60 px; make a simplified small-size version if the bite disappears.
- [ ] Define the logo palette (yellow → orange → pink gradient) and a one-color version (white on the gradient, dark on light).
- [x] Splash built in the app: native splash shows the unbitten gradient pin on Night (`assets/splash-pin.png`, imageWidth 150), then `src/components/animated-splash.tsx` takes over seamlessly: three-tooth bite, soft recoil, crumbs, radial glow, wordmark and tagline, fade into the app (~2 s; reduce-motion skips to a short fade). Built with React Native Animated + react-native-svg, no Lottie needed.
- [ ] Trademark search for the final name and mark, then have a designer redraw the final vector.
- Rejected for now: A · Pin-o, C · Neon sign (neon may return as a splash effect), D · Sticker slap (emoji pop-ins may return elsewhere).

### App and mockup changes

- [ ] Replace circle pins with sticker pins (glow by night, shadow by day, anchor dot).
- [ ] Add the round chip behind spot-type badges.
- [ ] Load all emoji from `assets/emoji/manifest.json` with glow colors per food.
- [ ] Put the approved emoji into the mockup to review them on the real map before the full build.
