# Lokal: development plan

"Lokal" is a placeholder name. A live, Waze-style map of small, independent food:
food trucks, carts, pop-ups, market stalls and small restaurants. No chains.

**Launch markets: the United States and Canada**, then global.

Related files: [`design/DESIGN_LOG.md`](design/DESIGN_LOG.md) (decisions and design changes),
[`design/README.md`](design/README.md) (mockups, stack, AI plan), [`design/ASSETS.md`](design/ASSETS.md) (emoji and brand assets).

Timelines are estimates for steady work with the founder testing on a phone along the way.

---

## 1. Where we are (done)

- Expo app (iPhone, Android, web) in this repo, Expo Router, TypeScript.
- Phone-only workflow: push to `main` → GitHub Actions → EAS live update (JS changes) or new Android build (native changes).
- Instant browser preview page for quick review.
- Design direction locked: mockup v3 look + v4 Business mode.
- Logo chosen (B · Bite pin), colors and wordmark defined.
- Animated splash screen in the app (3.5 s, cross-fades into the app).
- Emoji style anchored (taco, burger); 8 food emoji approved; ChatGPT sheet workflow and splitter ready.

---

## 2. Launching in the US and Canada

What this means for version 1:

| Area | US | Canada | What we build |
|---|---|---|---|
| Language | English | English and **French** (French is legally required for apps sold in Quebec) | Every word in translation files from day one; English and Canadian French at launch; store listings in both |
| Units | miles, °F | kilometres, °C | Distance and temperature follow the phone's region |
| Money | USD | CAD | Prices shown in the spot's local currency; payments later handle GST/HST and US sales tax |
| Phone numbers | +1 | +1 | Same format; sign-in by phone works for both |
| Privacy law | State laws (California CCPA/CPRA and others) | PIPEDA (federal) and **Quebec Law 25** (stricter) | Clear consent for location, privacy policy in English and French, data export and account deletion in the app, a named privacy contact, a privacy impact assessment because data is stored outside Quebec |
| Accessibility | ADA | AODA (Ontario) | Screen reader labels, contrast, reduce motion (already planned) |
| Time zones | 6 | 6 | All times stored in UTC and shown in the spot's local time |
| Store availability | ✓ | ✓ | App Store and Google Play limited to the US and Canada at launch |

**Every city at once:** Lokal launches across all of the US and Canada on day one (founder decision).
Seed place data (Foursquare Open Source Places or Overture) is imported for both whole countries, chains
filtered out, so every city's map starts populated. Food trucks and pop-ups still depend on owners and
users adding them, so the app pushes "be the first" moments and invite-a-truck links in quiet areas,
and marketing concentrates wherever people start using it on their own.

Going global later mostly means more languages, more currencies and checking each new country's
privacy and payment rules; the version 1 groundwork above (translations, units, UTC times, local currency) carries over.

---

## 3. Version 1 scope

### For eaters
- Live night/day map of independent food near you, with sticker pins, glow, moving trucks.
- Filters (open now, trucks and carts, cuisine, pop-ups, cheap eats), search.
- Pull-up sheet: trending now, closest to you.
- Spot page: photos, live status, truck schedule, busy times, top dishes, AI summary, live reports, "not a chain".
- Check in, one-tap reports (radial menu), confirm or reject others' reports.
- Add a spot in 3 steps with a photo; chains are blocked.
- Follow spots; notifications when a followed truck parks nearby or a drop starts.
- Drops tab: limited specials with countdowns and reminders.
- Ask Lokal (AI guide) by text, using real data only.
- You tab: food map, taste profile, lists, quiet rep, weekly recap share card.
- Accounts: Sign in with Apple, Google, phone code.

### For owners (Business mode, same app)
- Claim and verify a spot (or create one).
- Go live with a location and "serving until"; live statuses (wait, closing soon, sold out, closed).
- Weekly schedule of stops.
- Menu with sold-out toggles; snap a menu photo and let AI build the menu.
- Create drops; message followers (limited per week).
- Reply to reviews; report fake ones.
- Basic insights: views, check-ins, followers, busy hours.

### Not in version 1 (later)
Order ahead and payments, hungry-people heatmap, punch cards, Pro subscription, staff accounts,
multiple trucks per business, events and catering, voice input beyond keyboard dictation,
avatar accessories, sounds.

---

## 4. Architecture

```
App (Expo, React Native, TypeScript)
 ├─ Mapbox (map display, custom night and day styles)
 ├─ Supabase
 │   ├─ Postgres + PostGIS (spots, reports, check-ins, … ; "near me" queries)
 │   ├─ Auth (Apple, Google, phone)
 │   ├─ Storage (photos, resized)
 │   ├─ Realtime (truck locations, reports, drop counters)
 │   └─ Edge Functions ── Claude API (Ask Lokal, summaries, menu scan, moderation)
 ├─ Expo Notifications (push)
 └─ Sentry (crashes) + PostHog (product analytics)
Builds and releases: GitHub Actions + EAS Build / EAS Update. Web: EAS Hosting.
```

AI models (see `design/README.md`): Claude Opus 5.5 for Ask Lokal and menu scanning, Claude Haiku 5.5
for review summaries and moderation. The API key lives only in Edge Functions.

### Core data model (first version)

| Table | Holds |
|---|---|
| `profiles` | user, avatar, mood, rep, home city |
| `spots` | name, kind (truck, cart, trailer, pop-up, stall, restaurant), cuisine, price, location (PostGIS), source (seed, user, owner), chain flag, claimed by |
| `spot_schedules` | weekly stops for trucks and carts |
| `live_sessions` | owner "we're here": location, start, serving until, status |
| `menu_items` | name, price, emoji, sold out today |
| `photos` | spot, uploader, storage path, moderation state |
| `reports` | spot, type (amazing, long line, deal, sold out, photo), author, expires at |
| `report_votes` | still true / not anymore |
| `checkins` | user, spot, time (must be near the spot) |
| `reviews` + `review_replies` | rating, text, owner reply |
| `follows` | user → spot |
| `drops` + `drop_claims` | special, quantity, starts at, followers-only window |
| `lists` + `list_items` | user lists ("Late-night eats") |
| `notifications` | per-user inbox |
| `business_claims` | claim and verification state |
| `moderation_flags` | reported content and decisions |

Row-level security on every table: people can only change their own data; owners can only manage claimed spots.

---

## 5. Phases

Each phase ends with something the founder can use on the phone. Every change passes typecheck, lint
and `expo-doctor`, is checked in the browser preview, then reaches the phone as a live update or a new build.

### Phase 0 · Setup (1–3 days)
- Founder creates accounts: **Supabase**, **Mapbox**, **Anthropic API**, **Apple Developer** ($99/year), **Google Play** ($25 once), **Sentry**, **PostHog**.
- Keys stored as EAS environment variables and GitHub secrets (never in the code).
- **iPhone testing:** App Store Expo Go stops at SDK 54 and the app is on SDK 58, so until the Apple Developer account is ready the iPhone preview runs in Safari from the computer's dev server (`npx expo start`, then `http://<computer-ip>:8081` on the same Wi-Fi). After enrollment: an iOS development build through EAS (also needed for Mapbox).
- Translation setup (English, Canadian French), locale-aware units and currency, UTC time handling.
- Supabase project, database schema v1, security rules, seed script skeleton.
- Done when: the app on the phone reads one test spot from Supabase.

### Phase 1 · The live map (about 1 week)
- Mapbox night and day styles in the brand colors.
- Sticker pins with glow or shadow, spot-type badge chips, clustering when zoomed out, live dot.
- Pull-up sheet (trending, closest), filters, search.
- Spot page (read-only first): photos, status, schedule, dishes, "not a chain".
- **Seed data:** import Foursquare Open Source Places (or Overture) for **all of the US and Canada**, filter out chains, keep food places, map categories to our emoji. Expect hundreds of thousands to over a million spots: needs the Supabase paid tier, map pin clustering and tiled loading (only the visible area is fetched).
- Quiet-area design: "No trucks reported here yet" prompts and invite-a-truck links.
- Distances in miles or kilometres by region; every screen in English and French.
- Directions button hands off to Apple or Google Maps.
- Done when: the founder browses real Austin spots on the night map.

### Phase 2 · Accounts and community (about 1 week)
- Sign-in (Apple, Google, phone code), profile with avatar and mood.
- Check-ins (only near the spot), one-tap reports with the radial menu, votes, reports expire after a few hours.
- Add a spot (3 steps, photo upload, chain block), follows.
- Basic moderation: report button, AI check on new text and photos, admin review list.
- Done when: two phones see each other's reports appear live on the map.

### Phase 3 · Business mode (1–2 weeks)
- Claim and verify (phone code + photo), or create a new business.
- Go live, serving until, live statuses; the truck moves on everyone's map in real time.
- Weekly stops schedule, menu with sold-out toggles, snap-a-menu with AI.
- Drops (customer Drops tab), message followers (3 per week), review replies, basic insights.
- Done when: the founder runs a test truck from one phone and watches it on another.

### Phase 4 · AI guide and notifications (about 1 week)
- Ask Lokal: chat that searches our database through tools; answers only with real spots; free daily limit.
- Review summaries ("What people say"), refreshed in batches with the fast model.
- Push notifications: followed truck parked nearby, drop starting, replies; quiet hours.
- Done when: "spicy under $12 open now" returns real nearby spots with a correct summary.

### Phase 5 · The fun layer and polish (1–2 weeks)
- Animations: pin bob and sparks, moving trucks, emoji rain on check-in, report float-up, celebrations.
- You tab: food map, taste profile, lists, rep and perks, weekly recap share card.
- All P0 emoji in place (see design log), app icon final.
- Speed (map with hundreds of pins), offline cache for the last area, accessibility pass (screen reader labels, reduce motion, contrast).
- Done when: the app feels like the v3/v4 mockups on a real phone.

### Phase 6 · Beta (about 2 weeks, overlaps phase 5)
- iPhone TestFlight and Android internal testing.
- **Spread-out beta:** testers in many cities across both countries (including Quebec, for French), plus a handful of trucks recruited online who claim their spots on their own.
- Self-serve owner onboarding must work with no help from us.
- Watch crashes (Sentry) and real usage (PostHog); fix the top issues each few days.
- Done when: testers keep reporting and checking in without being asked.

### Phase 7 · Store launch (2–3 weeks, overlaps phase 6)
- Final name, trademark search, designer-refined logo.
- Store listings and screenshots in English and French, short video, privacy policy and terms in both languages (US state laws, PIPEDA, Quebec Law 25), content policy, data safety forms.
- Store availability set to the US and Canada only.
- **Google Play:** new personal developer accounts must run a closed test with at least 12 testers for 14 days before going public (check the current rule at that time).
- Apple review (usually 1–3 days), landing page on the web.
- Done when: Lokal is downloadable in both stores.

### Timeline at a glance

| Week | Milestone |
|---|---|
| 1 | Accounts ready, database live |
| 2 | Real spots across the US and Canada on the night map, in English and French |
| 3 | Sign-in, check-ins, reports, add a spot |
| 4–5 | Business mode working end to end |
| 6 | Ask Lokal and notifications |
| 7–8 | Fun layer, polish, beta with real users |
| 8–10 | Store review and public launch |

---

## 6. After launch

1. Order ahead with payments (Stripe), pickup slots, "your order is ready".
2. Hungry-people heatmap and AI parking tips for owners.
3. Punch cards and loyalty.
4. Lokal Pro for businesses (check Apple and Google payment rules before choosing how to charge).
5. Staff accounts, multiple trucks, events and catering requests.
6. More US and Canadian cities, chosen by where people start using it on their own.
7. Going global: new languages and currencies, each country's privacy and payment rules, local seed data.

---

## 7. Parallel tracks (not blocking the build)

- **Design and emoji:** follow `design/DESIGN_LOG.md` (spot types redo, food sheets 2–4, reports, avatars, rewards, business icons).
- **Name:** shortlist, then check app stores, domains, social handles and trademarks.
- **Legal:** privacy policy and terms in English and French, content and review policy, location data disclosure; Quebec Law 25 items (privacy contact, impact assessment, consent records). Have a lawyer review before launch.
- **Translation:** French copy reviewed by a native Canadian French speaker, not only machine translated.
- **Vendor outreach:** online first (food-truck associations, social media, invite links); in person in the cities that take off first.

---

## 8. Running costs (rough, to verify when signing up)

| Item | Early stage |
|---|---|
| Supabase | paid tier from launch (about $25/month to start, more as the nationwide data and users grow) |
| Mapbox | free up to 25,000 monthly map users; then roughly $4 per 1,000 users (about $100/month at 50k, $400 at 125k; verify on mapbox.com/pricing). Cost depends on users, not cities or data. Map code stays swappable; reassess at ~20k monthly users (MapLibre + self-hosted tiles is the cheaper path). |
| Claude API | about 1–2 cents per Ask Lokal question; small for summaries and moderation |
| EAS (Expo) | free tier; paid plan if builds or updates exceed it |
| Sentry, PostHog | free tiers |
| Apple Developer | $99/year |
| Google Play | $25 once |

---

## 9. Main risks

| Risk | What we do |
|---|---|
| Thin cities (few trucks or pop-ups yet) | Seeded restaurants and stalls everywhere, "be the first" prompts, invite-a-truck links, marketing focused where usage grows |
| Moderation at national scale | Automatic AI checks, report buttons, expiring reports, check-in required to review |
| Stale truck locations | Owners' one-tap "we're here", report expiry, "still true?" votes |
| Fake or unfair reviews | Check-in required to review, AI moderation, owner replies, report button |
| Costs from AI use | Daily limits, caching, fast model for bulk work |
| Store rejection | Follow guidelines early: Sign in with Apple, privacy labels, content moderation tools |
| French or privacy requirements missed in Canada | Translations from day one, native French review, lawyer review of policies, Law 25 checklist |
| Logo resembling another brand | Distinct three-tooth bite, trademark search, designer redraw |

---

## 10. What the founder does in each phase

| Phase | You |
|---|---|
| 0 | Create the accounts, add keys to Expo and GitHub (guided step by step) |
| 1–5 | Test each update on your phone, give feedback, make design calls |
| 2–5 | Generate the remaining emoji sheets in ChatGPT |
| 6 | Recruit beta testers across many cities (some French-speaking) and a few trucks online |
| 7 | Choose the final name (check it works in English and French), approve store listings, enroll 12+ testers for Google, get the policies reviewed |
