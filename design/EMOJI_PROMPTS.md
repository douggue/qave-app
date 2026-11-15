# Lokal: emoji sheet prompts

## Round 2 · Better method (use this one)

What changed from round 1, and why:
- **One reference image with all 8 approved stickers** (`design/emoji/lokal-style-reference.png`) instead of 2. ChatGPT copies a set much better than a pair.
- **The style rules are sent once, in a setup message.** Each sheet prompt then only describes the food, so ChatGPT focuses on it.
- **4 per image (2×2), not 9.** Each sticker comes out about twice as big and sharper.
- **Direction for each food:** angle, shape, main colors, the one detail that makes it read, and what it must NOT look like (the reason curry was redone).
- **Background:** transparent, or plain light grey if ChatGPT can't. The split tool now removes a plain or fake-checkerboard background itself.

### How to run it (about 15 minutes)

1. Open a **new** ChatGPT chat. Upload `lokal-style-reference.png`, paste **Setup**, send. ChatGPT replies "Ready".
2. Paste **Sheet 1**. Wait for the image. Do the same for **Sheet 2** and **Sheet 3**, in the same chat.
3. If one sticker is off, use a **Fix** message, never a whole new sheet.
4. Send the 3 finished images back to Claude. Claude splits, cleans, checks them at 24, 40 and 56 px on the night and day maps, and puts the approved ones in the app.

### Setup (send once, with the reference image)

```
I'm making a custom emoji set for a food app. The image I uploaded shows the 8 approved emoji. Every new emoji must look like it belongs in this exact set, as if the same artist made it on the same day.

Study them and match exactly:
- Stylized glossy 3D emoji illustration, like a premium emoji set. Not photorealistic, not a flat cartoon, not a game icon, not a painting.
- Seen from a slight 3/4 angle from above, slightly tilted, like the burger, dumplings and taco.
- Chunky, rounded, simplified shapes. Few details, each one big enough to see at 40 pixels.
- Rich, warm, saturated colors. Smooth gradients, one clear glossy highlight on each main shape.
- Soft light from the top left. A small soft shadow under the bottom right of the object only.
- A thin, even, pure white outline around the whole silhouette, like a die-cut sticker, exactly as thick as on the reference. No dark or black outline lines anywhere.
- Fully solid and opaque. No glow, haze, sparkles, smoke clouds or background scenery.
- No text, letters, numbers, logos or brand marks anywhere.

I'll send the items 4 at a time. Reply only "Ready".
```

### Sheet 1 · Bakery and coffee

```
Make sheet 1: one square image, as large as you can, with a 2×2 grid of 4 separate emoji. Each emoji is centered in its quarter, fills about 70% of it, and never touches another one. Background: fully transparent if you can; otherwise a plain flat light grey. Never a checkerboard pattern.

Top left: a plump golden butter croissant, a fat curved crescent seen from the side at a slight angle, 5 clear rounded layers, deep golden-amber with a glossy egg-wash shine and lighter cream in the folds. Must not look like a shrimp or a horn.
Top right: a round Texas fruit kolache, seen from above at an angle: a soft golden bun with a puffy rim and a shiny apricot-orange jam center, a few white streusel crumbs on the rim. Must not look like a bagel, a donut or a fried egg: the center is filled with glossy jam, no hole.
Bottom left: a to-go paper coffee cup, short and wide, cream white with a brown cardboard sleeve and a dark brown lid, two soft white curls of steam above it. No logo. Must not look like a soda cup.
Bottom right: a ring donut with glossy pink frosting and a few colorful rod sprinkles, golden dough showing at the edge. Must not look like a bagel.

Match the reference set exactly: same angle, gloss, color strength, white rim thickness and level of detail.
```

### Sheet 2 · Sides and sweets

```
Make sheet 2: one square image, as large as you can, with a 2×2 grid of 4 separate emoji. Each emoji is centered in its quarter, fills about 70% of it, and never touches another one. Background: fully transparent if you can; otherwise a plain flat light grey. Never a checkerboard pattern.

Top left: a plain red paper scoop carton of golden french fries, about 9 thick fries standing at different heights, bright golden with lighter tips. The carton has no logo, letters or stripes. Must not resemble any fast-food brand.
Top right: a stack of 3 thick battered onion rings leaning on each other, light golden brown, the front ring standing up so its big hole shows. Bumpy batter shown with smooth glossy shading. Must not look like donuts or bagels: thinner rings, bigger holes.
Bottom left: a tall milkshake glass with a pink strawberry shake, a swirl of whipped cream, a red cherry on top and a red-and-white striped straw.
Bottom right: a rectangular Mexican mango paleta (ice pop) on a wooden stick, bright mango orange with small fruit pieces inside, a red chili-lime dusting on one corner, rounded corners, and a small three-tooth bite taken out of the top right corner. Must not look like a cheese bar or a twin popsicle.

Match the reference set exactly: same angle, gloss, color strength, white rim thickness and level of detail.
```

### Sheet 3 · Hot dishes (includes the 3 redos)

```
Make sheet 3: one square image, as large as you can, with a 2×2 grid of 4 separate emoji. Each emoji is centered in its quarter, fills about 70% of it, and never touches another one. Background: fully transparent if you can; otherwise a plain flat light grey. Never a checkerboard pattern.

Top left: three thick slices of smoked BBQ brisket fanned out on a small light wooden board, each slice with a dark bark edge and a thin pink smoke ring, juicy and glossy, smooth simple shapes with almost no texture. Must not look like bread or cake.
Top right: Japanese curry and rice on a white oval plate, seen from above at an angle: a neat dome of white rice on the left, glossy golden-brown curry with a few big carrot and potato chunks on the right. Must not look like ramen or soup: a flat plate, no bowl, no noodles.
Bottom left: a small round black cast-iron pot of hearty red-brown stew with big vegetable chunks, a wooden spoon resting in it and its lid tilted open on the side. Must not look like ramen or pho: a heavy dark pot, not a ceramic bowl, no noodles.
Bottom right: a short rack of 4 glazed pork ribs in glossy dark-red BBQ sauce, white bone tips showing along the top, smooth surfaces. Must not look like a chocolate bar.

Match the reference set exactly: same angle, gloss, color strength, white rim thickness and level of detail.
```

### Fix messages (when one sticker is off)

```
Redo only the [top left / top right / bottom left / bottom right] emoji: [the note, e.g. "simpler, fewer crumbs, bigger jam center"]. Keep the other 3 exactly the same, same layout and size.
```
```
The style drifted from the reference. Redo the whole sheet closer to the reference image: glossier, chunkier, fewer details, and the same thin white sticker rim.
```

### Review checklist (Claude runs it, founder decides)

- Reads as what it is at 24 px, without a label, on the night and the day map.
- Doesn't look like another sticker in the set.
- Same gloss, color strength, angle and rim as the reference.
- Solid after cleaning, no halo, no text, no brand look.

### Where they go in the app

| Sheet | Sticker | App food key |
|---|---|---|
| 1 | croissant | `croissant` |
| 1 | kolache | `kolache` |
| 1 | coffee | `coffee` |
| 1 | donut | (new, for future spots) |
| 2 | fries | `fries` |
| 2 | onion rings | `rings` |
| 2 | milkshake | `shake` |
| 2 | paleta | `paleta` |
| 3 | brisket | `bbq` |
| 3 | curry plate | `curry` |
| 3 | stew pot | `supper` |
| 3 | ribs | (BBQ alternate) |

Split command: `python3 design/tools/split-sheet.py <sheet.png> <out-dir> name1 name2 name3 name4` (top left, top right, bottom left, bottom right).

---

## Round 1 (archive)


How to use: in ChatGPT, upload `design/emoji/approved/food-taco.png` and `design/emoji/approved/food-burger.png` first (or work in the same chat as the taco), then paste one prompt per sheet. Send each finished sheet back to Claude to split, clean and export.

## 1. Food sheet 1

```
Create an emoji sprite sheet for a food app's custom emoji set.

Order (left to right, top to bottom):
1. sliced BBQ brisket with a dark peppery bark on a small wooden board
2. a rack of glazed BBQ pork ribs
3. a bowl of pho with noodles, beef slices, herbs and chopsticks
4. a bowl of ramen with a soft-boiled egg, chashu pork and green onions
5. a bowl of curry with rice
6. three pan-fried dumplings
7. a slice of pepperoni pizza with a cheese pull
8. a hot dog with a wavy line of mustard
9. a crispy fried chicken drumstick

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 2. Food sheet 2

```
Create an emoji sprite sheet for a food app's custom emoji set.

Order (left to right, top to bottom):
1. Caribbean jerk chicken with grill marks and a slice of scotch bonnet pepper
2. a banh mi sandwich with pickled carrots, cucumber and cilantro
3. a deli sandwich cut in half showing layers
4. a to-go coffee cup with a lid and a little steam
5. a golden croissant
6. a round fruit kolache pastry with an apricot center
7. a pink frosted donut with sprinkles
8. a waffle cone with two scoops of ice cream
9. a mango-chili paleta (Mexican ice pop) on a stick

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 3. Food sheet 3

```
Create an emoji sprite sheet for a food app's custom emoji set.

Order (left to right, top to bottom):
1. a cup of boba milk tea with tapioca pearls and a wide straw
2. a smoothie cup with a straw and a strawberry on the rim
3. a vegan salad bowl with greens, avocado and chickpeas
4. a red carton of golden french fries
5. three saucy buffalo chicken wings
6. two golden empanadas
7. a stuffed arepa
8. a folded crepe with strawberries and chocolate drizzle
9. two pieces of salmon nigiri sushi

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 4. Food sheet 4

```
Create an emoji sprite sheet for a food app's custom emoji set.

Order (left to right, top to bottom):
1. a paper boat of grilled shrimp with a lemon wedge
2. a breakfast taco with scrambled egg, bacon and cheese
3. a steaming bowl of soup with a spoon
4. two pupusas with curtido on the side
5. a gyro wrap in paper
6. three falafel balls in a small pita
7. two churros with a cup of chocolate sauce
8. an elote (grilled corn on the cob) with cheese and chili
9. a golden waffle with butter and syrup

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 5. Spot types and statuses

```
Create an emoji sprite sheet for a food app's custom emoji set. These icons show what kind of place a food spot is.

Order (left to right, top to bottom):
1. a colorful food truck seen from the front-left with a serving window and striped awning
2. a small street food cart with an umbrella
3. a vintage silver food trailer with a serving window
4. a pop-up tent with a striped canopy
5. a farmers market stall with a wooden counter and an awning
6. a tiny cozy neighborhood restaurant building with a striped awning and a warm lit window
7. a simple bike cart: a bicycle with big wheels and one box with a coffee cup on the front
8. an alarm clock meaning 'closing soon'
9. a rain cloud with drops meaning 'closed today because of weather'

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 6. Live reports

```
Create an emoji sprite sheet for a food app's custom emoji set. People tap these to report what is happening at a food spot.

Order (left to right, top to bottom):
1. a bright orange and red flame meaning 'this is amazing'
2. an hourglass with golden sand meaning 'long wait'
3. a green dollar bill with a sparkle meaning 'good deal'
4. a red octagon stop sign meaning 'sold out'
5. a camera meaning 'photo'
6. a cluster of three sparkles meaning 'new spot'
7. a small food truck with a red map pin above it meaning 'just parked'
8. a small food truck with speed lines behind it meaning 'on the move'
9. a glowing green dot with radio waves meaning 'live now'

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 7. Reactions and effects

```
Create an emoji sprite sheet for a food app's custom emoji set.

Order (left to right, top to bottom):
1. a thumbs up
2. a thumbs down
3. a glossy red heart
4. a round yellow face drooling with hunger
5. a round yellow face with a mind-blown expression
6. a small orange flame (used as a floating spark)
7. a golden star
8. a soft white wisp of steam
9. a burst of colorful confetti pieces

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 8. Avatars 1

```
Create an emoji sprite sheet for a food app's custom emoji set. These are foodie avatar faces for user profiles. Each is a cute, round, chubby face seen from the front with a happy, hungry expression.

Order (left to right, top to bottom):
1. a fox
2. a panda
3. a frog
4. a unicorn
5. an octopus
6. a smiling person in a cowboy hat
7. a friendly green alien
8. a friendly robot
9. a cat

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 9. Avatars 2 and moods

```
Create an emoji sprite sheet for a food app's custom emoji set. Items 1–3 are foodie avatar faces (cute, round, chubby, front-facing, happy and hungry). Items 4–7 are round yellow mood faces. Items 8–9 are reward icons.

Order (left to right, top to bottom):
1. a bear
2. a raccoon
3. a smiling chef with a white chef hat
4. a mood face meaning 'hungry' (licking lips)
5. a mood face meaning 'exploring' (looking around with a small compass)
6. a mood face meaning 'snacking' (eating popcorn)
7. a mood face meaning 'food coma' (sleepy, holding its full belly)
8. a golden crown meaning 'local legend'
9. a golden key meaning 'insider'

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 10. Rewards and drops

```
Create an emoji sprite sheet for a food app's custom emoji set.

Order (left to right, top to bottom):
1. a compass meaning 'explorer'
2. a magnifying glass with a sparkle meaning 'first to find'
3. a calendar page with a flame meaning 'streak'
4. a wrapped gift box with a bow meaning 'your weekly recap'
5. a stopwatch meaning 'limited drop countdown'
6. a lightning bolt meaning 'flash deal'
7. a ticket meaning 'event'
8. a string of colorful festival lights meaning 'food truck rally'
9. a bell meaning 'reminder'

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## 11. Business tools

```
Create an emoji sprite sheet for a food app's custom emoji set. These icons are for food truck and restaurant owners.

Order (left to right, top to bottom):
1. a big red map pin with a pulse ring meaning 'go live'
2. a small folded map with a glowing heat spot meaning 'where people are hungry'
3. a phone camera scanning a menu board meaning 'scan your menu'
4. a punch card with stamps meaning 'loyalty card'
5. a megaphone meaning 'message your followers'
6. a rising bar chart with an arrow meaning 'insights'
7. a blue badge with a white check mark meaning 'verified'
8. a small sign with a QR code meaning 'follow us poster'
9. a speech bubble with a star meaning 'reply to reviews'

Style (the same for all 9): match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim, smooth shading instead of hard lines.

Layout: a 3×3 grid of 9 separate icons on one square image, at the largest size you can make. Each icon is centered in its own cell, about the same size, filling about 75% of its cell, with clear empty space between all icons. Icons must not touch or overlap.

Background: fully transparent. Nothing else: no text, no numbers, no labels, no grid lines, no borders, no scenery.

All 9 must look like one consistent set with the taco and burger: same glossiness, same color intensity, same outline thickness, same level of detail.
```

## Redo: food fixes (from the design log)

```
Create an emoji sprite sheet for a food app's custom emoji set. It contains only 3 icons in one row, on a wide image.

Order (left to right):
1. a plate of Japanese curry and white rice on a white oval plate
2. sliced BBQ brisket on a small wooden board, smooth and glossy, with a simple dark bark and only a few char spots
3. a rack of glazed BBQ pork ribs, smooth and glossy, simple shapes, only a few char spots

Style: match the exact style of the taco and burger images I uploaded. Stylized 3D emoji illustration, like a premium emoji set, NOT photorealistic. Smooth, glossy surfaces with soft gradients and one clear highlight per main shape. Simple, chunky, rounded shapes with only a few details, no rough meat texture. Each icon must clearly read as what it is at 40 pixels wide. Soft light from the top left, a small soft shadow on the bottom right of each object. Every icon has a thin, even white outline around its whole shape, like a die-cut sticker, the same thickness as the taco's. Every icon is fully solid, not see-through, with no glow or haze around it. Rendered like soft glossy 3D, not a flat cartoon or game icon: no dark or black outline lines inside the white rim.

Layout: icons spaced evenly with clear empty space between them; they must not touch or overlap.

Background: fully transparent. Nothing else: no text, no labels, no borders, no scenery.
```
