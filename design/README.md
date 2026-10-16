# Lokal: design notes

"Lokal" is a placeholder name. The app is a live, Waze-style map of small, independent
food in the US: food trucks, carts, pop-ups, market stalls and small restaurants. No chains.

## Mockups

Each file is a self-contained clickable page. Open it in a browser, or use the published links.

| Version | File | Link | What it is |
|---|---|---|---|
| v1 | `lokal-mockup-v1.html` | https://claude.ai/artifact/3vgj3EXaefonVirvQwqH8b | First playful map |
| v2 | `lokal-mockup-v2.html` | https://claude.ai/artifact/CH41PAwhjMpLsY7p8hiUA8 | Illustrated map, sheet, radial report, add a spot |
| v3 | `lokal-mockup-v3.html` | https://claude.ai/artifact/Re6YBJs2n4zguRW5pmfcj6 | **Chosen direction**: night street-food look, Drops, food map |
| v4 | `lokal-mockup-v4.html` | https://claude.ai/artifact/UgnPxfTsQQQiVMmhMtmRkJ | v3 plus Business mode for owners |

All spots, people and numbers in the mockups are fictional sample data (Austin, TX).

## Decisions so far

- **Market:** United States. Launch nationwide with a pre-filled map, focus marketing on 2–3 food-truck cities (Austin, LA, Portland, Houston or Miami).
- **Scope:** small independent food only. Chains are filtered out and can't be added.
- **Look and feel:** v3 direction. Keep the fun (animated emoji pins, moving trucks, report arc, emoji celebrations) without a Duolingo-style look. Rewards come from the food scene: drops, a personal food map, taste profile, friends, weekly recap. Points are a quiet "rep".
- **Owners:** same app, with a Business mode (see v4).
- **Name:** not chosen yet. Candidates: Dibs, Foodar, Curbie, Nearbite, Tastemap, Glow, Morsel.

## Planned tech stack

- App: Expo + React Native + TypeScript + Expo Router (this repo)
- Map: Mapbox (`@rnmapbox/maps`) with a custom night style
- Animations: Reanimated + Skia
- Backend: Supabase (Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions)
- AI: Claude API called from Supabase Edge Functions (fast model for summaries, stronger model for chat)
- Notifications: Expo Notifications
- Starter place data: Foursquare Open Source Places or Overture, chains filtered
- Monitoring: Sentry + PostHog
- Builds and releases: GitHub Actions + EAS Build and EAS Update (`.github/workflows/eas-build.yml`)

## Instant browser preview of the app

`tools/web-preview.sh <project-dir> <out-dir>` exports the Expo app for web as a single
bundle and writes `preview.html` plus `app/*.js`, ready to publish as a private preview page.
Changes under `design/` and Markdown files don't trigger app builds.
