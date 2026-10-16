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

### App and mockup changes

- [ ] Replace circle pins with sticker pins (glow by night, shadow by day, anchor dot).
- [ ] Add the round chip behind spot-type badges.
- [ ] Load all emoji from `assets/emoji/manifest.json` with glow colors per food.
- [ ] Put the approved emoji into the mockup to review them on the real map before the full build.
